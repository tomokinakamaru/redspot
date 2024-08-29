# see https://www.python.org/doc/versions/
ARG PYTHON_VERSION=3.12.4

# -------------------------------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} AS development

# see https://github.com/tj/n/tags
ARG N_VERSION=9.2.3

# see https://nodejs.org/en/about/previous-releases
ARG NODE_VERSION=22.6.0

# see https://github.com/pdm-project/pdm/releases
ARG PDM_VERSION=2.18.0

RUN export URL=https://raw.githubusercontent.com/tj/n/v${N_VERSION}/bin/n && \
    curl -L $URL | bash -s ${NODE_VERSION}

RUN pip install pdm==${PDM_VERSION} && \
    pdm config check_update false

# -------------------------------------------------------------------------------------------------
FROM development AS build

COPY / /src

RUN cd /src && pdm build --no-sdist

# -------------------------------------------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS production

COPY /jupyter /jupyter

COPY /kernel-deps.txt /kernel-install.sh /

COPY --from=build /src/dist/*.whl /

ENV JUPYTER_CONFIG_PATH=/jupyter

RUN export PYTHONDONTWRITEBYTECODE=1 && \
    pip install --no-cache-dir /*.whl && \
    sh /kernel-install.sh && \
    rm -rf /*.whl /kernel-* /var/lib/apt/lists/*

WORKDIR "/workdir"

ENTRYPOINT [ "redspot" ]
