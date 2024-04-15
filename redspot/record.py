from re import sub
from sys import argv

from notebook.app import main as notebook


def main(unknown):
    arg0 = sub(r"(-script\.pyw|\.exe)?$", "", argv[0])
    args = arg0, *unknown, "--ServerApp.jpserver_extensions=redspot=true"
    return notebook(args)
