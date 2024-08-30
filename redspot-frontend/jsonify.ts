import { Delta, ISharedCell, MapChanges } from "@jupyter/ydoc";
import { IChangedArgs } from "@jupyterlab/coreutils";
import {
  IAttachments,
  IDisplayData,
  IError,
  IExecuteResult,
  IOutput,
  IStream,
  isDisplayData,
  isError,
  isExecuteResult,
  isStream
} from "@jupyterlab/nbformat";
import { Session } from "@jupyterlab/services";

export function jsonifyNbformatChange(change: NbformatChange) {
  return { key: change.key, val: change.newValue };
}

export function jsonifySessionChange(change: SessionChange) {
  return { val: change.newValue?.id };
}

export function jsonifyAttachmentsChange(change: ValueChange<IAttachments>) {
  return { val: change.newValue };
}

export function jsonifyValueChange(change: ValueChange<number>) {
  return { val: change.newValue };
}

export function jsonifyCellsChange(change: Delta<ISharedCell[]>) {
  return { delta: jsonifyArrayDelta(change, jsonifyCell) };
}

export function jsonifyOutputsChange(change: Delta<IOutput[]>) {
  return { delta: jsonifyArrayDelta(change, jsonifyOutput) };
}

export function jsonifySourceChange(change: Delta<string>) {
  return { delta: jsonifyDelta(change, (s) => s) };
}

export function jsonifyMetadataChange(change: MapChanges, current: any) {
  return { delta: mapMap(change, (e) => jsonifyMapChange(e, current)) };
}

function jsonifyMapChange(change: MapChange, current: any) {
  return { key: change[0], act: change[1].action, val: current[change[0]] };
}

function jsonifyArrayDelta<T, S>(delta: Delta<T[]>, f: (data: T) => S) {
  return jsonifyDelta(delta, (a) => a.map(f));
}

function jsonifyDelta<T, S>(delta: Delta<T>, f: (data: T) => S) {
  return delta.map((d) => {
    if (d.insert) return { op: "insert", arg: f(d.insert) };
    if (d.delete) return { op: "delete", arg: d.delete };
    if (d.retain) return { op: "retain", arg: d.retain };
    throw Error();
  });
}

function jsonifyCell(cell: ISharedCell) {
  const n = "execution_count" in cell ? cell.execution_count : undefined;
  const o = "outputs" in cell ? cell.outputs.map(jsonifyOutput) : undefined;
  return {
    id: cell.id,
    source: cell.source,
    cell_type: cell.cell_type,
    metadata: cell.metadata,
    execution_count: n,
    outputs: o
  };
}

function jsonifyOutput(o: IOutput) {
  const t = o.output_type;
  if (isExecuteResult(o)) return { output_type: t, ...jsonifyExecuteResult(o) };
  if (isDisplayData(o)) return { output_type: t, ...jsonifyDisplayData(o) };
  if (isStream(o)) return { output_type: t, ...jsonifyStream(o) };
  if (isError(o)) return { output_type: t, ...jsonifyError(o) };
  throw Error();
}

function jsonifyExecuteResult(result: IExecuteResult) {
  return { data: result.data, metadata: result.metadata };
}

function jsonifyDisplayData(data: IDisplayData) {
  return { data: data.data, metadata: data.metadata };
}

function jsonifyStream(data: IStream) {
  return { name: data.name, text: data.text };
}

function jsonifyError(err: IError) {
  return { ename: err.ename, evalue: err.evalue, traceback: err.traceback };
}

function mapMap<K, V, T>(m: Map<K, V>, f: (e: [K, V]) => T) {
  return Array.from(m.entries()).map(f);
}

type NbformatChange = {
  key: string;
  oldValue?: number;
  newValue?: number;
};

type SessionChange = IChangedArgs<
  Session.ISessionConnection | null,
  Session.ISessionConnection | null,
  "session"
>;

type ValueChange<T> = {
  oldValue?: T;
  newValue?: T;
};

type MapChange = [
  string,
  { action: "add" | "update" | "delete"; oldValue: any }
];
