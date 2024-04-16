# Redspot

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

### Upgrade pdm-managed dependencies

```sh
pdm update --unconstrained
```

### Upgrade jlpm-managed dependencies

```sh
jlpm plugin import interactive-tools  # Remove the `plugins` section in `.yarnrc.yml`
jlpm upgrade-interactive
```
