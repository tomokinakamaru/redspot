from collections import defaultdict

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
    for _, panel, kind, args in database.get():
        if kind == "ISessionContext.sessionChanged":
            session = args["val"]
            if panel in panel_roots:
                if session in session_roots:
                    panel_roots[panel] = session_roots[session]
                else:
                    session_roots[session] = panel_roots[panel]
            else:
                if session in session_roots:
                    panel_roots[panel] = session_roots[session]
                else:
                    panel_roots[panel] = session_roots[session] = panel
        else:
            panel_roots.setdefault(panel, panel)
    return panel_roots
