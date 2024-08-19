# flake8: noqa
from redspot.dataloader import load


def _jupyter_server_extension_points():
    return [{"module": "redspot.extension"}]


def _jupyter_labextension_paths():
    return [{"src": "../labextension", "dest": "redspot"}]
