#!/bin/sh
set -eu

python -m venv kernel --upgrade --upgrade-deps

kernel/bin/pip install --no-cache-dir -r kernel-deps.txt

kernel/bin/python -m ipykernel install \
    --user \
    --name=python-isolated \
    --display-name="Python (isolated)" \
    --env PATH "$(pwd)/kernel/bin:$PATH"
