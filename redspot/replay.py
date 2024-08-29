from collections import defaultdict
from datetime import datetime
from itertools import count
from json import dumps

from redspot import load


def main(path, outdir):
    counters = defaultdict(count)
    for panel, data in load(path):
        time, uuid = panel.split("-")
        ymdt = datetime.fromtimestamp(int(time) / 1000)
        outd = outdir / datetime.strftime(ymdt, f"%Y-%m%d-%H%M_{uuid}")
        name = f"{next(counters[panel])}.ipynb"
        outd.mkdir(parents=True, exist_ok=True)
        (outd / name).write_text(dumps(data))
    return 0
