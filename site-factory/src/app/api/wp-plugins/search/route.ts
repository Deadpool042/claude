import { NextResponse } from "next/server";

/**
 * Recherche de plugins sur le store WordPress.org.
 *
 * GET /api/wp-plugins/search?q=wordfence&page=1
 *
 * Utilise l'API officielle WordPress.org :
 * https://api.wordpress.org/plugins/info/1.2/
 */

interface WpOrgPlugin {
  name: string;
  slug: string;
  version: string;
  author: string;
  short_description: string;
  rating: number;
  num_ratings: number;
  active_installs: number;
  downloaded: number;
  last_updated: string;
  icons: Record<string, string | undefined>;
  homepage: string;
}

interface WpOrgSearchResponse {
  info: { page: number; pages: number; results: number };
  plugins: WpOrgPlugin[];
}

export interface WpPluginSearchResult {
  slug: string;
  name: string;
  version: string;
  author: string;
  shortDescription: string;
  rating: number;
  numRatings: number;
  activeInstalls: number;
  downloaded: number;
  lastUpdated: string;
  icon: string;
  homepage: string;
}

export interface WpPluginSearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  plugins: WpPluginSearchResult[];
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const page = Number(searchParams.get("page") ?? "1");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Le paramètre 'q' doit contenir au moins 2 caractères" },
      { status: 400 },
    );
  }

  try {
    const wpApiUrl = new URL("https://api.wordpress.org/plugins/info/1.2/");
    wpApiUrl.searchParams.set("action", "query_plugins");
    wpApiUrl.searchParams.set("request[search]", query);
    wpApiUrl.searchParams.set("request[page]", String(page));
    wpApiUrl.searchParams.set("request[per_page]", "12");
    wpApiUrl.searchParams.set(
      "request[fields][icons]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][short_description]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][active_installs]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][downloaded]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][last_updated]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][homepage]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][rating]",
      "1",
    );
    wpApiUrl.searchParams.set(
      "request[fields][num_ratings]",
      "1",
    );
    // Exclure les champs lourds
    wpApiUrl.searchParams.set("request[fields][sections]", "0");
    wpApiUrl.searchParams.set("request[fields][description]", "0");
    wpApiUrl.searchParams.set("request[fields][screenshots]", "0");
    wpApiUrl.searchParams.set("request[fields][changelog]", "0");
    wpApiUrl.searchParams.set("request[fields][versions]", "0");

    const res = await fetch(wpApiUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!res.ok) {
      throw new Error(`WordPress.org API returned ${String(res.status)}`);
    }

    const data = (await res.json()) as WpOrgSearchResponse;

    const plugins: WpPluginSearchResult[] = data.plugins.map((p) => ({
      slug: p.slug,
      name: p.name,
      version: p.version,
      author: p.author.replace(/<[^>]*>/g, ""), // Strip HTML tags from author
      shortDescription: p.short_description,
      rating: p.rating,
      numRatings: p.num_ratings,
      activeInstalls: p.active_installs,
      downloaded: p.downloaded,
      lastUpdated: p.last_updated,
      icon: p.icons["2x"] ?? p.icons["1x"] ?? p.icons.svg ?? "",
      homepage: p.homepage,
    }));

    const response: WpPluginSearchResponse = {
      page: data.info.page,
      totalPages: data.info.pages,
      totalResults: data.info.results,
      plugins,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
