from collections import defaultdict

from redspot import database
from redspot.notebook import Notebook


def load(path):
    panel_roots = _load_panel_roots(path)
    for time, panel, kind, args, notebook in _load_notebooks(path):
        panel = panel_roots[panel]
        yield time, panel, kind, args, notebook


def _load_notebooks(path):
    notebooks = defaultdict(Notebook)
    for time, panel, kind, args in database.get(path):
        notebooks[panel].apply(kind, args)
        yield time, panel, kind, args, notebooks[panel]


def _load_panel_roots(path):
    panel_roots, session_roots = {}, {}
    for time, panel, kind, args in database.get(path):
        session = args.get("val")
        panel_id = _create_panel_id(time, panel)
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
    return f"{time}-{p}"
