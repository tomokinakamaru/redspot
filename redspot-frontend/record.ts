import { URLExt } from "@jupyterlab/coreutils";
import { ServerConnection } from "@jupyterlab/services";

export function record(panel: string, kind: string, args: any = {}) {
  const body = `${Date.now()} ${panel} ${kind} ${JSON.stringify(args)}`;
  const init = { method: "POST", body: body };
  ServerConnection.makeRequest(endpoint, init, settings);
}

const settings = ServerConnection.makeSettings();

const endpoint = URLExt.join(settings.baseUrl, "redspot");
