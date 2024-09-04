import { URLExt } from "@jupyterlab/coreutils";
import { ServerConnection } from "@jupyterlab/services";
import {
  jsonifyAttachmentsChange,
  jsonifyCellsChange,
  jsonifyMetadataChange,
  jsonifyNbformatChange,
  jsonifyOutputsChange,
  jsonifySessionChange,
  jsonifySourceChange,
  jsonifyValueChange
} from "./jsonify";

export function record(
  panel: string,
  type: "ISessionContext.sessionChanged",
  args: ISessionContext_sessionChanged
): void;

export function record(
  panel: string,
  type: "INotebookModel.changed:cellsChange",
  args: INotebookModel_changed__cellsChange
): void;

export function record(
  panel: string,
  type: "INotebookModel.changed:nbformatChanged",
  args: INotebookModel_changed__nbformatChanged
): void;

export function record(
  panel: string,
  type: "INotebookModel.changed:metadataChange",
  args: INotebookModel_changed__metadataChange
): void;

export function record(
  panel: string,
  type: "ISharedCell.changed:attachmentsChange",
  args: ISharedCell_changed__attachmentsChange
): void;

export function record(
  panel: string,
  type: "ISharedCell.changed:executionCountChange",
  args: ISharedCell_changed__executionCountChange
): void;

export function record(
  panel: string,
  type: "ISharedCell.changed:outputsChange",
  args: ISharedCell_changed__outputsChange
): void;

export function record(
  panel: string,
  type: "ISharedCell.changed:sourceChange",
  args: ISharedCell_changed__sourceChange
): void;

export function record(
  panel: string,
  type: "ISharedCell.changed:metadataChange",
  args: ISharedCell_changed__metadataChange
): void;

export function record(panel: string, type: string, args: any) {
  const body = `${Date.now()} ${panel} ${type} ${JSON.stringify(args)}`;
  const init = { method: "POST", body: body };
  ServerConnection.makeRequest(endpoint, init, settings);
}

const settings = ServerConnection.makeSettings();

const endpoint = URLExt.join(settings.baseUrl, "redspot");

type ISessionContext_sessionChanged = ReturnType<typeof jsonifySessionChange>;

type INotebookModel_changed__cellsChange = ReturnType<
  typeof jsonifyCellsChange
>;

type INotebookModel_changed__nbformatChanged = ReturnType<
  typeof jsonifyNbformatChange
>;

type INotebookModel_changed__metadataChange = ReturnType<
  typeof jsonifyMetadataChange
>;

type ISharedCell_changed__attachmentsChange = Expand<
  { cell: string } & ReturnType<typeof jsonifyAttachmentsChange>
>;

type ISharedCell_changed__executionCountChange = Expand<
  { cell: string } & ReturnType<typeof jsonifyValueChange>
>;

type ISharedCell_changed__outputsChange = Expand<
  { cell: string } & ReturnType<typeof jsonifyOutputsChange>
>;

type ISharedCell_changed__sourceChange = Expand<
  { cell: string } & ReturnType<typeof jsonifySourceChange>
>;

type ISharedCell_changed__metadataChange = Expand<
  { cell: string } & ReturnType<typeof jsonifyMetadataChange>
>;

// REF: https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type/57683652#57683652
// For intersection type expansion
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
