import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker } from "@jupyterlab/notebook";
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
import { record } from "./record";

export default {
  id: "redspot:plugin",
  autoStart: true,
  requires: [INotebookTracker],
  activate: (_: JupyterFrontEnd, tracker: INotebookTracker) => {
    // start monitoring panel changes
    tracker.currentChanged.connect((_, panel) => {
      // start monitoring session changes
      panel?.sessionContext.sessionChanged.connect((_, args) => {
        record(
          panel.id,
          "ISessionContext.sessionChanged",
          jsonifySessionChange(args)
        );
      });
      // start monitoring notebook changes
      panel?.content.model?.sharedModel.changed.connect((notebook, change) => {
        // record notebook changes
        if (change.cellsChange) {
          record(
            panel.id,
            "INotebookModel.changed:cellsChange",
            jsonifyCellsChange(change.cellsChange)
          );
        } else if (change.nbformatChanged) {
          record(
            panel.id,
            "INotebookModel.changed:nbformatChanged",
            jsonifyNbformatChange(change.nbformatChanged)
          );
        } else if (change.metadataChange) {
          record(
            panel.id,
            "INotebookModel.changed:metadataChange",
            jsonifyMetadataChange(change.metadataChange, notebook.metadata)
          );
        }
        // start monitoring cell changes
        change.cellsChange?.forEach((delta) =>
          delta.insert?.forEach((cell) =>
            cell.changed.connect((_, c) => {
              // record cell changes
              if (c.attachmentsChange) {
                record(panel.id, "ISharedCell.changed:attachmentsChange", {
                  cell: cell.id,
                  ...jsonifyAttachmentsChange(c.attachmentsChange)
                });
              } else if (c.executionCountChange) {
                record(panel.id, "ISharedCell.changed:executionCountChange", {
                  cell: cell.id,
                  ...jsonifyValueChange(c.executionCountChange)
                });
              } else if (c.outputsChange) {
                record(panel.id, "ISharedCell.changed:outputsChange", {
                  cell: cell.id,
                  ...jsonifyOutputsChange(c.outputsChange)
                });
              } else if (c.sourceChange) {
                record(panel.id, "ISharedCell.changed:sourceChange", {
                  cell: cell.id,
                  ...jsonifySourceChange(c.sourceChange)
                });
              } else if (c.metadataChange) {
                record(panel.id, "ISharedCell.changed:metadataChange", {
                  cell: cell.id,
                  ...jsonifyMetadataChange(c.metadataChange, cell.metadata)
                });
              }
            })
          )
        );
      });
    });
  }
};
