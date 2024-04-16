#!/bin/sh
set -eu

python -m venv kernel --upgrade --upgrade-deps

kernel/bin/pip install -r kernel-deps.txt

kernel/bin/python -m ipykernel install \
    --user \
    --frozen_modules \
    --name "python" \
    --display-name "Python" \
    --env PATH "$(pwd)/kernel/bin:$PATH"
