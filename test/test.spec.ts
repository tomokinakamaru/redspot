import * as galata from "@jupyterlab/galata";
import * as fs from "fs";

import { expect } from "@jupyterlab/galata";
import { Page } from "@playwright/test";
import { Database } from "sqlite3";

const output = "test/redspot.db";

const expected = "test/expected.sqlite3";

const test = galata.test.extend({
  waitForApplication: async ({}, use) => {
    await use(async (page: Page) => {
      await page.waitForSelector("#main-panel");
    });
  }
});

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function read(path: string) {
  return new Promise<Row[]>((resolve, reject) => {
    new Database(path).all("SELECT kind, args FROM data", (err, rows) =>
      err ? reject(err) : resolve(rows as Row[])
    );
  });
}

type Row = {
  kind: string;
  args: string;
};

test("test", async ({ page }) => {
  // delete database if exists
  if (fs.existsSync(output)) fs.unlinkSync(output);

  // create new notebook
  const popup = page.waitForEvent("popup");
  await page.click('text="New"');
  await page
    .locator('[data-command="notebook:create-new"] >> text="Python (isolated)"')
    .click();
  const notebook = await popup;

  // write code in cell
  await sleep(1000);
  await notebook
    .locator(".jp-Cell-inputArea >> .cm-editor >> .cm-content")
    .fill("print(1)");

  // run cell
  await sleep(1000);
  await notebook.keyboard.press("Shift+Enter");

  // close
  await sleep(1000);
  await notebook.close();
  await page.close();

  // assertions
  const rows1 = await read(output);
  const rows2 = await read(expected);
  assert(rows1, rows2);
});

function assert(rows1: Row[], rows2: Row[]) {
  const [items1, items2] = [rows1, rows2].map((rows) => {
    return rows.map((row) => {
      const args = removeIdentifiers(JSON.parse(row.args));
      return `${row.kind}${JSON.stringify(args)}`;
    });
  });
  items1.sort();
  items2.sort();
  expect(items1).toEqual(items2);
}

function removeIdentifiers(obj: any) {
  if (typeof obj === "number") {
    return obj;
  }
  if (typeof obj === "string") {
    if (identifier.test(obj)) {
      return "<identifier>";
    }
    return obj;
  }
  if (typeof obj === "object") {
    const ret = {};
    for (const k in obj) {
      ret[k] = removeIdentifiers(obj[k]);
    }
    return ret;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeIdentifiers);
  }
}

const identifier = /^.{8}-.{4}-.{4}-.{4}-.{12}$/;
