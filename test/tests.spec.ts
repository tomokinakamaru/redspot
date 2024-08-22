import { expect } from "@jupyterlab/galata";
import { read, test, unlink } from "./util";

const actual = process.env.REDSPOT_DATABASE!;

const expected = "test/x.sqlite3";

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
