from argparse import ArgumentParser, HelpFormatter
from inspect import getfullargspec
from shutil import get_terminal_size


class Command(object):
    def __init__(self):
        self._parser = ArgumentParser(formatter_class=_Formatter)
        self._subparsers = self._parser.add_subparsers()
        self._actions = {None: (self._usage, lambda _: {})}

    def add(self, module, **kwargs):
        kwargs["formatter_class"] = _Formatter
        name = module.__name__.rsplit(".", 1)[1]
        subp = self._subparsers.add_parser(name, **kwargs)
        subp.set_defaults(**{"main": name})
        self._set_action(name, module.main)
        return subp

    def run(self, args=None):
        func, parser = self._get_action(args)
        args = parser(args)
        args.pop("main", None)
        return func(**args)

    def _usage(self):
        self._parser.print_usage()
        return 2

    def _get_action(self, args):
        known = self._parser.parse_known_args(args)[0]
        name = getattr(known, "main", None)
        return self._actions[name]

    def _set_action(self, name, func):
        b = "unknown" in getfullargspec(func).args
        f = self._parse_known_args if b else self._parse_args
        self._actions[name] = func, f

    def _parse_known_args(self, args):
        known, unknown = self._parser.parse_known_args(args)
        return dict(**vars(known), unknown=unknown)

    def _parse_args(self, args):
        known = self._parser.parse_args(args)
        return vars(known)


class _Formatter(HelpFormatter):
    def __init__(self, prog):
        width = min(get_terminal_size().columns, 80)
        super().__init__(prog, width=width, max_help_position=width)
