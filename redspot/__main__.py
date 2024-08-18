from pathlib import Path
from sys import argv
from tempfile import mkdtemp

from jupyterlab import galata
from notebook.app import main as notebook


def main(args=None):
    args = [a for a in args or argv[1:]]
    _configure_playwright(args)
    _configure_redspot(args)
    return notebook(args)


def _configure_redspot(args):
    args.append("--ServerApp.jpserver_extensions=redspot=true")


def _configure_playwright(args):
    if _playwright in args:
        args.remove(_playwright)
        args.append("--ServerApp.password=")
        args.append("--IdentityProvider.token=")
        args.append("--ServerApp.disable_check_xsrf=true")
        args.append("--LabApp.expose_app_in_browser=true")
        args.append("--JupyterNotebookApp.expose_app_in_browser=true")
        args.append(f"--ServerApp.root_dir={mkdtemp()}")
        args.append(f"--LabApp.workspaces_dir={mkdtemp()}")
        args.append(f"--LabServerApp.extra_labextensions_path={_galatapath}")


_playwright = "--playwright"

_galatapath = str(Path(galata.__file__).parent)

if __name__ == "__main__":
    exit(main())
