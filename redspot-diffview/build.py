from pathlib import Path


def main():
    path = _nbpreview / "index.html"
    lines = _read(path)
    lines = _patch(lines)
    lines = _inline(lines)
    for line in lines:
        print(line)


def _patch(lines):
    for line in lines:
        if line in _patch_skip:
            pass
        elif line in _patch_replace:
            yield _patch_replace[line]
        else:
            yield line


def _inline(lines):
    for line in lines:
        if line.startswith('<script src="'):
            yield "<script>"
            yield from _read(_nbpreview / line.split('"')[1])
            yield "</script>"
        elif line.startswith('<link rel="stylesheet" href="'):
            yield "<style>"
            yield from _read(_nbpreview / line.split('"')[3])
            yield "</style>"
        else:
            yield line


def _read(path):
    with open(path) as f:
        for line in f:
            yield line.strip()


_nbpreview = Path(__file__).parent / "nbpreview"

_patch_skip = {
    "<title>nbpreview — Jupyter Notebook Previewer</title>",
    '<div id="header">Jupyter Notebook Previewer</div>',
    '<input type="file" id="file">',
    '<script src="js/nbpreview.js"></script>',
}

_patch_replace = {
    "</head>": f'<link rel="stylesheet" href="{_nbpreview.parent / "style.css"}" /></head>',
    "</body>": f'<script src="{_nbpreview.parent / "script.js"}"></script></body>',
    '<a href="https://github.com/jsvine/nbpreview">See the <code>nbpreview</code> code on GitHub</a>.': 'Powered by <a href="https://github.com/jsvine/nbpreview"><code>nbpreview</code></a>',
}

if __name__ == "__main__":
    main()
