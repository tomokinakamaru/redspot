import { expect } from "@jupyterlab/galata";
import { read, sleep, test, unlink } from "./util";

const output = "test/redspot.db";

const expected = "test/expected.sqlite3";

test("type-and-run", async ({ page }) => {
  // delete database if exists
  unlink(output);

  // create new notebook
  const popup = page.waitForEvent("popup");
  await page.click('text="New"');
  await page
    .locator('[data-command="notebook:create-new"] >> text="Python (isolated)"')
    .click();

  // wait for new tab
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
  expect(rows1).toEqual(rows2);
});
