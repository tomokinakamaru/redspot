from pathlib import Path
from tempfile import mkdtemp

from jupyterlab import galata
from notebook.app import main as notebook


def main(playwright, unknown):
    playwright and _configure_playwright(unknown)
    _configure_redspot(unknown)
    return notebook(unknown)


def _configure_redspot(args):
    args.append("--ServerApp.jpserver_extensions=redspot=true")


def _configure_playwright(args):
    args.append("--ServerApp.password=")
    args.append("--IdentityProvider.token=")
    args.append("--ServerApp.disable_check_xsrf=true")
    args.append("--LabApp.expose_app_in_browser=true")
    args.append("--JupyterNotebookApp.expose_app_in_browser=true")
    args.append(f"--ServerApp.root_dir={mkdtemp()}")
    args.append(f"--LabApp.workspaces_dir={mkdtemp()}")
    args.append(f"--LabServerApp.extra_labextensions_path={_galatapath}")


_galatapath = str(Path(galata.__file__).parent)
