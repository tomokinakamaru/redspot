from argparse import ArgumentParser
from collections import defaultdict
from datetime import datetime
from itertools import count
from json import dumps
from pathlib import Path

from redspot import load


def main():
    args = _parse_args()
    counters = defaultdict(count)
    for panel, data in load(args.path):
        time, uuid = panel.split("-")
        ymdt = datetime.fromtimestamp(int(time) / 1000)
        path = args.out / datetime.strftime(ymdt, f"%Y-%m%d-%H%M_{uuid}")
        name = f"{next(counters[panel])}.ipynb"
        path.mkdir(parents=True, exist_ok=True)
        (path / name).write_text(dumps(data))


def _parse_args():
    p = ArgumentParser()
    p.add_argument(
        "path",
        help="input file",
        metavar="path",
        type=Path,
    )
    p.add_argument(
        "-o",
        "--out",
        default=".",
        help="output directory",
        metavar="path",
        type=Path,
    )
    return p.parse_args()


if __name__ == "__main__":
    main()
