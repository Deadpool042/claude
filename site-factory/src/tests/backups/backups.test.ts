import { applyBackupRetention, type BackupFileWithStamp, buildBackupEntries, parseBackupFilename, stampToIso } from "@/lib/backups";
import { describe, expect, it } from "vitest";


describe("parseBackupFilename", () => {
  it("parses db backups", () => {
    expect(parseBackupFilename("db-20260227-100332.sql", "db")).toEqual({
      stamp: "20260227-100332",
    });
  });

  it("parses uploads backups", () => {
    expect(
      parseBackupFilename("uploads-20260227-100332.zip", "uploads"),
    ).toEqual({ stamp: "20260227-100332" });
  });

  it("rejects invalid names", () => {
    expect(parseBackupFilename("db-latest.sql", "db")).toBeNull();
    expect(parseBackupFilename("uploads-20260227.sql", "uploads")).toBeNull();
  });
});

describe("stampToIso", () => {
  it("converts stamp to iso", () => {
    expect(stampToIso("20260227-100332")).toBe("2026-02-27T10:03:32.000Z");
  });

  it("returns null for invalid stamp", () => {
    expect(stampToIso("bad")).toBeNull();
  });
});

describe("buildBackupEntries", () => {
  it("groups files by stamp and sorts desc", () => {
    const files: BackupFileWithStamp[] = [
      {
        name: "db-20260227-100332.sql",
        path: "db/db-20260227-100332.sql",
        size: 120,
        modifiedAt: "2026-02-27T10:04:00.000Z",
        kind: "db",
        stamp: "20260227-100332",
      },
      {
        name: "uploads-20260227-100332.zip",
        path: "uploads/uploads-20260227-100332.zip",
        size: 512,
        modifiedAt: "2026-02-27T10:04:10.000Z",
        kind: "uploads",
        stamp: "20260227-100332",
      },
      {
        name: "db-20260226-080000.sql",
        path: "db/db-20260226-080000.sql",
        size: 88,
        modifiedAt: "2026-02-26T08:00:05.000Z",
        kind: "db",
        stamp: "20260226-080000",
      },
    ];

    const entries = buildBackupEntries(files);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.stamp).toBe("20260227-100332");
    expect(entries[0]?.db).toBeDefined();
    expect(entries[0]?.uploads).toBeDefined();
    expect(entries[1]?.uploads).toBeUndefined();
  });
});

describe("applyBackupRetention", () => {
  it("keeps only the most recent entries when keep is set", () => {
    const entries = [
      { stamp: "20260227-100332", createdAt: "2026-02-27T10:03:32.000Z" },
      { stamp: "20260226-080000", createdAt: "2026-02-26T08:00:00.000Z" },
      { stamp: "20260225-070000", createdAt: "2026-02-25T07:00:00.000Z" },
    ];

    const { kept, removed } = applyBackupRetention({
      entries,
      keep: 1,
      maxAgeDays: 0,
      now: new Date("2026-02-27T12:00:00.000Z"),
    });

    expect(kept).toHaveLength(1);
    expect(kept[0]?.stamp).toBe("20260227-100332");
    expect(removed).toHaveLength(2);
  });

  it("drops entries older than max age before applying keep", () => {
    const entries = [
      { stamp: "20260227-100332", createdAt: "2026-02-27T10:03:32.000Z" },
      { stamp: "20260226-080000", createdAt: "2026-02-26T08:00:00.000Z" },
      { stamp: "20260225-070000", createdAt: "2026-02-25T07:00:00.000Z" },
    ];

    const { kept, removed } = applyBackupRetention({
      entries,
      keep: 2,
      maxAgeDays: 1,
      now: new Date("2026-02-27T12:00:00.000Z"),
    });

    expect(kept).toHaveLength(1);
    expect(kept[0]?.stamp).toBe("20260227-100332");
    expect(removed).toHaveLength(2);
  });
});
