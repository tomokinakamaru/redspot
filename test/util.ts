import * as galata from "@jupyterlab/galata";
import * as fs from "fs";

import { Page } from "@playwright/test";
import { Database } from "sqlite3";

export const test = galata.test.extend({
  waitForApplication: async ({}, use) => {
    await use(async (page: Page) => {
      await page.waitForSelector("#main-panel");
    });
  }
});

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function unlink(path: string) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}

export function read(path: string) {
  type Row = { kind: string; args: string };

  const database = new Database(path);
  const query = "SELECT kind, args FROM data";

  const identifier = /^.{8}-.{4}-.{4}-.{4}-.{12}$/;
  const version = /^\d+\.\d+\.\d+$/;

  const fixValues = (obj: any) => {
    if (typeof obj === "number") {
      return obj;
    }
    if (typeof obj === "string") {
      if (identifier.test(obj)) return "<id>";
      if (version.test(obj)) return "<ver>";
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(fixValues);
    }
    const o = {};
    for (const k in obj) o[k] = fixValues(obj[k]);
    return o;
  };

  const encodeRow = (row: Row) => {
    const args = JSON.parse(row.args);
    const noid = fixValues(args);
    const encd = JSON.stringify(noid);
    return `${row.kind}${encd}`;
  };

  return new Promise<string[]>((resolve, reject) => {
    database.all(query, (err, rows: Row[]) =>
      err ? reject(err) : resolve(rows.map(encodeRow).sort())
    );
  });
}
