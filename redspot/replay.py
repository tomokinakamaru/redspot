from collections import defaultdict
from copy import deepcopy
from datetime import datetime
from itertools import count
from json import dumps

from nbdime import diff

from redspot import load


def main(path, outdir):
    counters = defaultdict(count)
    stream = load(path)
    stream = _filter_by_kind(stream)
    stream = _filter_by_diff(stream)
    stream = _filter_void(stream)
    for panel, data in stream:
        time, uuid = panel.split("-")
        ymdt = datetime.fromtimestamp(int(time) / 1000)
        outd = outdir / datetime.strftime(ymdt, f"%Y-%m%d-%H%M_{uuid}")
        name = f"{next(counters[panel])}.ipynb"
        outd.mkdir(parents=True, exist_ok=True)
        (outd / name).write_text(dumps(data))
    return 0


def _filter_void(stream):
    prev = defaultdict(lambda: None)
    void = defaultdict(lambda: True)
    for panel, notebook in stream:
        if panel in prev:
            void[panel] = False
            yield panel, prev[panel]
        prev[panel] = deepcopy(notebook)
    for panel, notebook in prev.items():
        if not void[panel]:
            yield panel, notebook


def _filter_by_diff(stream):
    notebooks = defaultdict(lambda: {"cells": [], "metadata": {}})
    for panel, notebook in stream:
        delta = diff(notebooks[panel], notebook)
        notebooks[panel] = deepcopy(notebook)
        if _has_visible_change(delta):
            yield panel, notebook


def _filter_by_kind(stream):
    notebooks = {}
    cell_changed = _cell_change_detector()
    for _, panel, kind, args, notebook in stream:
        notebooks[panel] = notebook
        if kind in _yield_immediately:
            yield panel, notebooks.pop(panel)
        elif kind in _yield_if_cell_changed:
            if cell_changed(panel, args):
                yield panel, notebooks.pop(panel)
    yield from notebooks.items()


def _has_visible_change(delta):
    for eps in delta:
        op, key = eps["op"], eps["key"]
        if op == "patch" and key == "cells":
            return True
    return False


def _cell_change_detector():
    def _(panel, args):
        if panel in prev:
            new = args.get("cell")
            old = prev[panel]
            if old != new:
                prev[panel] = new
                return True
        return False

    prev = {}
    return _


_yield_immediately = (
    "INotebookModel.changed:cellsChange",
    "ISharedCell.changed:executionCountChange",
)

_yield_if_cell_changed = (
    "ISharedCell.changed:attachmentsChange",
    "ISharedCell.changed:outputsChange",
    "ISharedCell.changed:sourceChange",
)
