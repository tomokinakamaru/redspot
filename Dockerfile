ARG PYTHON_VERSION=3.12.2

# -------------------------------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} as development

ARG N_VERSION=9.2.1

ARG NODE_VERSION=21.7.3

ARG PDM_VERSION=2.14.0

RUN export URL=https://raw.githubusercontent.com/tj/n/v${N_VERSION}/bin/n && \
    curl -L $URL | bash -s ${NODE_VERSION}

RUN pip install pdm==${PDM_VERSION}

# -------------------------------------------------------------------------------------------------
FROM development as build

COPY / /src

RUN cd /src && pdm build --no-sdist

# -------------------------------------------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim as production

COPY --from=build /src/dist/*.whl /

RUN savedAptMark="$(apt-mark showmanual)" && \
    apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    PYTHONDONTWRITEBYTECODE=1 pip install --no-cache-dir /*.whl && \
    apt-mark auto '.*' > /dev/null && \
    apt-mark manual $savedAptMark && \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
	rm -rf /*.whl /var/lib/apt/lists/*

ENTRYPOINT [ "redspot" ]
