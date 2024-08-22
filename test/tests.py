import redspot


def test_load():
    g = redspot.load("test/x.sqlite3")
    assert len(list(g)) == 3
