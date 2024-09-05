import * as galata from "@jupyterlab/galata";
import * as fs from "fs";

import { expect } from "@jupyterlab/galata";
import { Page } from "@playwright/test";
import { Database } from "sqlite3";

const actual = process.env.REDSPOT_DATABASE!;

const expected = "tests/x.db";

const test = galata.test.extend({
  waitForApplication: async ({}, use) => {
    await use(async (page: Page) => {
      await page.waitForSelector("#main-panel");
    });
  }
});

test("type-and-run", async ({ page }) => {
  const timeout = { timeout: 10 * 1000 };

  // delete database if exists
  unlink(actual);

  // create new notebook
  const popup = page.waitForEvent("popup");
  await page.click('text="New"');
  await page
    .locator('[data-command="notebook:create-new"] >> text="Python (isolated)"')
    .click();

  // wait for new tab
  const notebook = await popup;
  const indicator = notebook.locator(".jp-Notebook-ExecutionIndicator");

  // wait for kernel ready
  await expect(indicator).toHaveAttribute("data-status", "idle", timeout);

  // write code
  await notebook
    .locator(".jp-Cell-inputArea >> .cm-editor >> .cm-content")
    .fill("print(1)");

  // run cell
  await notebook.keyboard.press("Shift+Enter");

  // wait for kernel ready
  await expect(indicator).toHaveAttribute("data-status", "idle", timeout);

  // wait for prompt number
  const prompt = notebook.locator(".jp-InputPrompt").nth(0);
  await expect(prompt).toHaveText("[1]:");

  // wait for output
  const output = notebook.locator(".jp-OutputArea-output >> pre");
  await expect(output).toHaveText("1");

  // close
  await notebook.close();
  await page.close();

  // assertions
  const rows1 = await read(actual);
  const rows2 = await read(expected);
  expect(rows1).toEqual(rows2);
});

function unlink(path: string) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}

function read(path: string) {
  type Row = { kind: string; args: string };

  const database = new Database(path);
  const query = "SELECT kind, args FROM signal";

  const identifier = /^.{8}-.{4}-.{4}-.{4}-.{12}$/;
  const version = /^\d+\.\d+\.\d+$/;

  const fixValues = (obj: any) => {
    if (obj === null) {
      return null;
    }
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
