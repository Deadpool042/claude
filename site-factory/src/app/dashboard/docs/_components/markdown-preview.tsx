"use client";

import { useMemo } from "react";

interface MarkdownPreviewProps {
  content: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "#";
  }

  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  return "#";
}

function applyInline(text: string): string {
  const codeSpans: string[] = [];
  let output = text.replace(/`([^`]+)`/g, (_match, codeText: string) => {
    const token = `@@CODE${String(codeSpans.length)}@@`;
    codeSpans.push(`<code>${escapeHtml(codeText)}</code>`);
    return token;
  });
  output = escapeHtml(output);
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, url: string) => {
      const safeUrl = sanitizeUrl(url);
      return `<a href="${safeUrl}" target="_blank" rel="noreferrer noopener">${label}</a>`;
    },
  );
  codeSpans.forEach((markup, index) => {
    output = output.replace(`@@CODE${String(index)}@@`, markup);
  });
  return output;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const cells = splitTableRow(trimmed);
  return (
    cells.length > 1 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function renderMarkdownToHtml(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLang = line.replace(/```/, "").trim();
        codeLines = [];
      } else {
        const code = escapeHtml(codeLines.join("\n"));
        const langClass = codeLang ? ` language-${codeLang}` : "";
        html.push(
          `<pre><code class="code-block${langClass}">${code}</code></pre>`,
        );
        inCode = false;
        codeLang = "";
        codeLines = [];
      }
      i += 1;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^#{1,6}/)?.[0].length ?? 1;
      const text = line.replace(/^#{1,6}\s+/, "");
      html.push(`<h${level}>${applyInline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.trim() === "---" || line.trim() === "***") {
      html.push("<hr />");
      i += 1;
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]?.trim().startsWith(">")) {
        quoteLines.push(lines[i]?.replace(/^\s*>\s?/, "") ?? "");
        i += 1;
      }
      html.push(`<blockquote>${applyInline(quoteLines.join(" "))}</blockquote>`);
      continue;
    }

    const nextLine = lines[i + 1] ?? "";
    if (line.includes("|") && isTableDivider(nextLine)) {
      const headerCells = splitTableRow(line);
      const bodyRows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i]?.includes("|")) {
        bodyRows.push(splitTableRow(lines[i] ?? ""));
        i += 1;
      }
      const headerHtml = headerCells
        .map((cell) => `<th>${applyInline(cell)}</th>`)
        .join("");
      const bodyHtml = bodyRows
        .map((row) => {
          const cells = row
            .map((cell) => `<td>${applyInline(cell)}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      html.push(
        `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      const listItems = items.map((item) => `<li>${applyInline(item)}</li>`).join("");
      html.push(`<ul>${listItems}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      const listItems = items.map((item) => `<li>${applyInline(item)}</li>`).join("");
      html.push(`<ol>${listItems}</ol>`);
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && (lines[i]?.trim() ?? "") !== "") {
      if (
        lines[i]?.startsWith("```") ||
        /^#{1,6}\s+/.test(lines[i] ?? "") ||
        /^\s*[-*]\s+/.test(lines[i] ?? "") ||
        /^\s*\d+\.\s+/.test(lines[i] ?? "") ||
        (lines[i]?.includes("|") && isTableDivider(lines[i + 1] ?? "")) ||
        (lines[i]?.trim() ?? "") === "---"
      ) {
        break;
      }
      paragraphLines.push(lines[i] ?? "");
      i += 1;
    }
    const paragraph = paragraphLines.join(" ").trim();
    if (paragraph) {
      html.push(`<p>${applyInline(paragraph)}</p>`);
    }
  }

  return html.join("\n");
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = useMemo(() => renderMarkdownToHtml(content), [content]);
  return (
    <div
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
