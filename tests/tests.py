import redspot

database = "tests/x.sqlite3"


def test_load():
    g = redspot.load(database)
    assert len(list(g)) == 3
