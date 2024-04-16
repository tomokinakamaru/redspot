from notebook.app import main as notebook


def main(unknown):
    extra = "--ServerApp.jpserver_extensions=redspot=true"
    return notebook([*unknown, extra])
