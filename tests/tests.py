from json import loads
from os import walk
from pathlib import Path
from re import compile
from shutil import rmtree
from subprocess import run
from sys import executable

import redspot

database = "tests/x.db"


def test_load_api():
    g = redspot.load(database)
    assert len(list(g)) == 3


def test_load_cli():
    actual = ".tests"
    expected = "tests/x"

    # run command
    rmtree(actual, ignore_errors=True)
    run([executable, "-m", "redspot.load", database, "-o", actual])

    # assertions
    actual = _read(actual)
    expected = _read(expected)
    assert len(actual) == 3
    assert actual == expected


def _read(path):
    return sorted(_read_dir(path))


def _read_dir(path):
    for p in _find_files(path):
        yield p.name, _read_file(p)


def _find_files(path):
    for root, _, names in walk(path):
        for name in names:
            if not name.startswith("."):
                yield Path(root, name)


def _read_file(path):
    data = loads(path.read_text())
    return _fix_values(data)


def _fix_values(obj):
    if obj is None:
        return None
    if isinstance(obj, (int, float)):
        return obj
    if isinstance(obj, str):
        if _identifier.match(obj):
            return "<id>"
        if _version.match(obj):
            return "<ver>"
        return obj
    if isinstance(obj, list):
        return [_fix_values(e) for e in obj]
    return {k: _fix_values(v) for k, v in obj.items()}


_identifier = compile(r"^.{8}-.{4}-.{4}-.{4}-.{12}$")

_version = compile(r"^\d+\.\d+\.\d+$")
