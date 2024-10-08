from functools import cache
from json import loads
from os import environ
from sqlite3 import connect


def put(time, panel, kind, args):
    signal = time, panel, kind, args
    _connect().execute(_put_query, signal)


def get(path=None):
    path = path or environ.get(_environ_key, _default_path)
    connection = connect(path, isolation_level=None)
    cursor = connection.execute(_get_query)
    for time, panel, kind, args in cursor:
        yield time, panel, kind, loads(args)


@cache
def _connect():
    path = environ.get(_environ_key, _default_path)
    connection = connect(path, isolation_level=None)
    connection.execute(_create_table_query)
    connection.execute(_create_index_query)
    return connection


_create_table_query = """
CREATE TABLE IF NOT EXISTS signal (
    time INTEGER NOT NULL,
    panel TEXT NOT NULL,
    kind TEXT NOT NULL,
    args JSON NOT NULL
)
"""

_create_index_query = """
CREATE INDEX IF NOT EXISTS
time_index ON signal (time)
"""

_put_query = "INSERT INTO signal VALUES (?, ?, ?, ?)"

_get_query = "SELECT * FROM signal ORDER BY time, rowid"

_environ_key = "REDSPOT_DATABASE"

_default_path = "redspot.db"
