#!/bin/sh
set -eu

temp=$(mktemp -d)

trap 'rm -rf $temp' EXIT

python -m venv "$temp" --upgrade-deps

"$temp/bin/pip" install ipykernel

"$temp/bin/pip" freeze > kernel-deps.txt
