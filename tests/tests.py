import redspot


def test_load():
    g = redspot.load("tests/x.sqlite3")
    assert len(list(g)) == 3
