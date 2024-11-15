#!/bin/sh
set -eu

temp=$(mktemp -d)

trap 'rm -rf $temp' EXIT

python -m venv "$temp" --upgrade-deps

"$temp/bin/pip" install --no-cache-dir pdm

"$temp/bin/pip" freeze > pdm-deps.txt
