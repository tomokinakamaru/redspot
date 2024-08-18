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
  return new Promise<Record[]>((resolve, reject) => {
    new Database(path).all("SELECT panel, kind, args FROM data", (err, rows) =>
      err ? reject(err) : resolve(rows as Record[])
    );
  });
}

type Record = {
  panel: string;
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
  expect(rows1.length).toBe(rows2.length);
  for (let i = 0; i < rows1.length; i++) {
    expect(rows1[i].kind).toBe(rows2[i].kind);
    expect(rows1[i].args.length).toBe(rows2[i].args.length);
  }
});
