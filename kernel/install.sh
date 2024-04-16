#!/bin/sh
set -eu

export PDM_IGNORE_ACTIVE_VENV=1

cd "$(dirname "$0")"

pdm install

pdm run python -m ipykernel install \
    --user \
    --frozen_modules \
    --name "python" \
    --display-name "Python" \
    --env PATH "$(pwd)/.venv/bin:$PATH"

pdm run pip freeze > requirements.txt
