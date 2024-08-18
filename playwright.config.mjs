import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    appPath: ""
  },
  webServer: [
    {
      command: "redspot --playwright",
      stdout: "pipe",
      stderr: "pipe",
      env: {
        REDSPOT_DATABASE: "test/redspot.db"
      }
    }
  ]
});
