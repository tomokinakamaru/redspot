ARG PYTHON_VERSION=3.12.4

# -------------------------------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} as development

ARG N_VERSION=9.2.3

ARG NODE_VERSION=21.7.3

ARG PDM_VERSION=2.15.4

RUN export URL=https://raw.githubusercontent.com/tj/n/v${N_VERSION}/bin/n && \
    curl -L $URL | bash -s ${NODE_VERSION}

RUN pip install pdm==${PDM_VERSION}

# -------------------------------------------------------------------------------------------------
FROM development as build

COPY / /src

RUN cd /src && pdm build --no-sdist

# -------------------------------------------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim as production

COPY /jupyter /jupyter

COPY /kernel-deps.txt /kernel-install.sh /

COPY --from=build /src/dist/*.whl /

ENV JUPYTER_CONFIG_PATH=/jupyter

RUN export PYTHONDONTWRITEBYTECODE=1 && \
    savedAptMark="$(apt-mark showmanual)" && \
    apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    pip install --no-cache-dir /*.whl && \
    sh /kernel-install.sh && \
    apt-mark auto '.*' > /dev/null && \
    apt-mark manual $savedAptMark && \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
	rm -rf /*.whl /kernel-* /var/lib/apt/lists/*

WORKDIR "/workdir"

ENTRYPOINT [ "redspot" ]

CMD [ "record" ]
