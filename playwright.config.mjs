import { defineConfig } from "@playwright/test";

process.env.REDSPOT_DATABASE = ".redspot.db";

export default defineConfig({
  use: {
    appPath: ""
  },
  webServer: [
    {
      command: "redspot record --playwright",
      stdout: "pipe",
      stderr: "pipe",
      env: {
        JUPYTER_CONFIG_PATH: "jupyter"
      }
    }
  ]
});
