from pathlib import Path

from redspot import record, replay
from redspot.command import Command

command = Command()

parser = command.add(
    record,
    help="record notebook activities",
)

parser.add_argument(
    "--playwright",
    action="store_true",
    help="configure jupyter for playwright tests",
)

parser = command.add(
    replay,
    help="replay notebook activities",
)

parser.add_argument(
    "path",
    help="input database file",
    metavar="<path>",
    nargs="?",
    type=Path,
)

parser.add_argument(
    "-o",
    "--outdir",
    default=".",
    help="output directory",
    metavar="<path>",
    type=Path,
)

main = command.run

if __name__ == "__main__":
    exit(command.run())
