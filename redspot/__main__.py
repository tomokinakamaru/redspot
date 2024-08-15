from sys import argv

from notebook.app import main as notebook


def main(args=None):
    args = args or argv[1:]
    extra = "--ServerApp.jpserver_extensions=redspot=true"
    return notebook([*args, extra])


if __name__ == "__main__":
    exit(main())
