from pathlib import Path

from redspot import record, replay
from redspot.command import Command

command = Command()

parser = command.add(
    record,
    help="record notebook changes",
    add_help=False,
)

parser = command.add(
    replay,
    help="replay notebook changes",
)

parser.add_argument(
    "-s",
    "--snapshot",
    help="generate snapshots",
    action="store_true",
)

parser.add_argument(
    "-o",
    "--out",
    help="output directory",
    metavar="<path>",
    default=".",
    type=Path,
)

main = command.run

if __name__ == "__main__":
    exit(command.run())
