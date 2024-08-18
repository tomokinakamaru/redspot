# Redspot

## Usage

1. Create a workspace directory:

   ```sh
   # Workspace = ~/Desktop/cassini-workdir
   mkdir ~/Desktop/cassini-workdir
   ```

2. Move into the created directory:

   ```sh
   # Workspace = ~/Desktop/cassini-workdir
   cd ~/Desktop/cassini-workdir
   ```

3. Create a Docker container:

   ```sh
   # Container name = cassini
   docker create -it -p8888:8888 -v$(pwd):/workdir --name cassini ghcr.io/tomokinakamaru/redspot:latest
   ```

4. Start the created container:

   ```sh
   # Container name = cassini
   docker start -i cassini
   ```

5. Navigate to the URL displayed in the terminal (`http://localhost:8888/tree?token=...`).

6. Do anything you want on Jupyter.

## Development

### Build and install package

```sh
pdm install
```

### Install default kernel

```sh
sh kernel-install.sh
```

### Upgrade default kernel

```sh
sh kernel-upgrade.sh
```

### Build frontend extension

```sh
jlpm build
```

### Install frontend extension in development mode

```sh
jupyter labextension develop --overwrite .
```

### Check/Fix code formats

```sh
pdm run check  # Check
pdm run fix # Fix
```

### Run tests

```sh
pdm run test
```

### Upgrade pdm-managed dependencies

```sh
pdm update --unconstrained
```

### Upgrade jlpm-managed dependencies

```sh
jlpm plugin import @yarnpkg/plugin-interactive-tools
jlpm upgrade-interactive
jlpm plugin remove @yarnpkg/plugin-interactive-tools
```
