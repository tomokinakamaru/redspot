from collections import defaultdict
from datetime import datetime

from redspot import database
from redspot.notebook import Notebook


def load():
    panel_roots = _load_panel_roots()
    for panel, kind, args, notebook in _load_notebooks():
        panel = panel_roots[panel]
        yield panel, kind, args, notebook


def _load_notebooks():
    notebooks = defaultdict(Notebook)
    for _, panel, kind, args in database.get():
        notebooks[panel].apply(kind, args)
        yield panel, kind, args, notebooks[panel]


def _load_panel_roots():
    panel_roots, session_roots = {}, {}
    for panel_id, panel, kind, args in database.get():
        session = args.get("val")
        panel_id = _create_panel_id(panel_id, panel)
        if kind == "ISessionContext.sessionChanged" and session:
            if panel in panel_roots:
                if session in session_roots:
                    panel_roots[panel] = session_roots[session]
                else:
                    session_roots[session] = panel_roots[panel]
            else:
                if session in session_roots:
                    panel_roots[panel] = session_roots[session]
                else:
                    panel_roots[panel] = session_roots[session] = panel_id
        else:
            panel_roots.setdefault(panel, panel_id)
    return panel_roots


def _create_panel_id(time, panel):
    p = "".join(panel.split("-")[1:])
    s = datetime.fromtimestamp(time / 1000)
    return datetime.strftime(s, f"%Y-%m%d-%H%M-{p}")
