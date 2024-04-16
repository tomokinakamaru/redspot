from collections import defaultdict
from copy import deepcopy
from itertools import count
from json import dumps
from pkgutil import get_data

from nbdime import diff

from redspot import datafilter, dataloader


def main(snapshot, out):
    if snapshot:
        _main_snapshot(out)
    else:
        _main_diff(out)


def _main_snapshot(out):
    counters = defaultdict(count)
    for panel, data in _load_snapshot():
        path = out / panel
        name = f"{next(counters[panel])}.ipynb"
        path.mkdir(parents=True, exist_ok=True)
        (path / name).write_text(dumps(data))


def _main_diff(out):
    paths = set()
    html = get_data(__name__, "index.html").decode()
    head, tail = html.split("__diff__")
    out.mkdir(parents=True, exist_ok=True)
    for panel, data in _load_diff():
        path = out / f"{panel}.html"
        if path not in paths:
            path.write_text(head)
            paths.add(path)
        with open(path, "a") as f:
            f.write(dumps(data))
            f.write(",\n")
    for path in paths:
        with open(path, "a") as f:
            f.write(tail)


def _load_snapshot():
    stream = dataloader.load()
    stream = datafilter.filter(stream)
    yield from stream


def _load_diff():
    empty = {"cells": [], "metadata": {}}
    notebooks = defaultdict(lambda: deepcopy(empty))
    for panel, notebook in _load_snapshot():
        yield panel, diff(notebooks[panel], notebook)
        notebooks[panel] = deepcopy(notebook)
