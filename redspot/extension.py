from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from tornado.web import authenticated

from redspot import database


class Handler(APIHandler):
    @authenticated
    def post(self):
        data = self.request.body.decode()
        database.put(*data.split(maxsplit=3))


def _load_jupyter_server_extension(app):
    url = app.web_app.settings["base_url"]
    url = url_path_join(url, "redspot")
    app.web_app.add_handlers(".*$", [(url, Handler)])
