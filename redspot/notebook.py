class Notebook(dict):
    def __init__(self):
        super().__init__()
        self["cells"] = []
        self["metadata"] = {}
        self["nbformat"] = 4
        self["nbformat_minor"] = 0

    def apply(self, type, args):
        head = type.split(".", 1)[0]
        self._invoke(head, type, args)

    def _INotebookModel(self, type, args):
        self._invoke(type, args)

    def _ISharedCell(self, type, args):
        cell = self._get_cell(args["cell"])
        self._invoke(type, cell, args)

    def _INotebookModel_changed_cellsChange(self, args):
        self["cells"] = _apply_delta(self["cells"], args)

    def _INotebookModel_changed_nbformatChanged(self, args):
        self[args["key"]] = args.get("val")

    def _INotebookModel_changed_metadataChange(self, args):
        _update_metadata(self["metadata"], args)

    def _ISharedCell_changed_attachmentsChange(self, cell, args):
        cell["attachments"] = args.get("val")

    def _ISharedCell_changed_executionCountChange(self, cell, args):
        cell["outputs"] = cell["outputs"] if args.get("val") else []
        cell["execution_count"] = args.get("val")

    def _ISharedCell_changed_outputsChange(self, cell, args):
        cell["outputs"] = _apply_delta(cell["outputs"], args)

    def _ISharedCell_changed_sourceChange(self, cell, args):
        cell["source"] = _apply_delta(cell["source"], args)

    def _ISharedCell_changed_metadataChange(self, cell, args):
        _update_metadata(cell["metadata"], args)

    def _invoke(self, key, *args):
        name = key.replace(".", "_").replace(":", "_")
        func = getattr(self, f"_{name}", None)
        func and func(*args)

    def _get_cell(self, id):
        for c in self["cells"]:
            if c["id"] == id:
                return c


def _apply_delta(obj, args):
    head = 0
    for eps in args["delta"]:
        op = eps["op"]
        arg = eps["arg"]
        if op == "insert":
            obj = obj[:head] + arg + obj[head:]
            head += len(arg)
        elif op == "delete":
            obj = obj[:head] + obj[head + arg :]
        elif op == "retain":
            head += arg
    return obj


def _update_metadata(data, args):
    for eps in args["delta"]:
        key = eps["key"]
        act = eps["act"]
        val = eps.get("val")
        if act == "add":
            data[key] = val
        elif act == "update":
            data[key] = val
        elif act == "delete":
            data.pop(key, None)
