# Redspot

## Usage

1. Install [Docker](https://www.docker.com/)

1. Launch Redspot

   ```sh
   docker run --rm -it -p8888:8888 -v$(pwd):/workdir ghcr.io/tomokinakamaru/redspot:latest
   ```

1. Open the localhost URL displayed in the terminal

   ```sh
   ...
   [C 2024-01-01 00:00:00.000 ServerApp]
   ...
           http://localhost:8888/tree?token=... # ← This URL
           http://127.0.0.1:8888/tree?token=...
   ...
   ```

1. Create a notebook and do anything you want

1. Replay your work

   ```sh
   docker run --rm -it -v$(pwd):/workdir ghcr.io/tomokinakamaru/redspot:latest replay
   ```

## Data schema

### SQLite table

<!-- prettier-ignore-start -->
|Name|Type|Nullable|
|:---|:---|:-------|
|time|INTEGER|NO|
|panel|TEXT|NO|
|kind|TEXT|NO|
|args|JSON|NO|
<!-- prettier-ignore-end -->

### JSON shapes in TypeScript type notation

See the external type definitions for the following types:

- [IAttachments](https://github.com/jupyterlab/jupyterlab/blob/0d8446aa3504f166679e66b0abf8bce6154233dc/packages/nbformat/src/index.ts#L77)
- [IBaseCellMetadata](https://github.com/jupyterlab/jupyterlab/blob/0d8446aa3504f166679e66b0abf8bce6154233dc/packages/nbformat/src/index.ts#L159)
- [IMimeBundle](https://github.com/jupyterlab/jupyterlab/blob/0d8446aa3504f166679e66b0abf8bce6154233dc/packages/nbformat/src/index.ts#L70)
- [PartialJSONObject](https://github.com/jupyterlab/lumino/blob/0fb17ae08476cb6c03c1dced1454391c8ea38355/packages/coreutils/src/json.ts#L68)
- [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)

<!-- prettier-ignore-start -->
#### ISessionContext.sessionChanged

```typescript
type ISessionContext_sessionChanged = {
  val: string | undefined;
}
```

#### INotebookModel.changed:cellsChange

```typescript
type INotebookModel_changed__cellsChange = {
  delta: ({
    op: "insert";
    arg: {
      id: string;
      source: string;
      cell_type: string;
      metadata: Partial<IBaseCellMetadata>;
      execution_count: ExecutionCount | undefined;
      outputs: ({
        data: IMimeBundle;
        metadata: PartialJSONObject;
        output_type: "execute_result";
      } | {
        data: IMimeBundle;
        metadata: PartialJSONObject;
        output_type: "display_data";
      } | {
        name: StreamType;
        text: MultilineString;
        output_type: "stream";
      } | {
        ename: string;
        evalue: string;
        traceback: string[];
        output_type: "error";
      })[] | undefined;
    }[];
  } | {
    op: "delete";
    arg: number;
  } | {
    op: "retain";
    arg: number;
  })[];
}
```

#### INotebookModel.changed:nbformatChanged

```typescript
type INotebookModel_changed__nbformatChanged = {
  key: string;
  val: number | undefined;
}
```

#### INotebookModel.changed:metadataChange

```typescript
type INotebookModel_changed__metadataChange = {
  delta: {
    key: string;
    act: "delete" | "add" | "update";
    val: any;
  }[];
}
```

#### ISharedCell.changed:attachmentsChange

```typescript
type ISharedCell_changed__attachmentsChange = {
  cell: string;
  val: IAttachments | undefined;
}
```

#### ISharedCell.changed:executionCountChange

```typescript
type ISharedCell_changed__executionCountChange = {
  cell: string;
  val: number | undefined;
}
```

#### ISharedCell.changed:outputsChange

```typescript
type ISharedCell_changed__outputsChange = {
  cell: string;
  delta: ({
    op: "insert";
    arg: ({
      data: IMimeBundle;
      metadata: PartialJSONObject;
      output_type: "execute_result";
    } | {
      data: IMimeBundle;
      metadata: PartialJSONObject;
      output_type: "display_data";
    } | {
      name: StreamType;
      text: MultilineString;
      output_type: "stream";
    } | {
      ename: string;
      evalue: string;
      traceback: string[];
      output_type: "error";
    })[];
  } | {
    op: "delete";
    arg: number;
  } | {
    op: "retain";
    arg: number;
  })[];
}
```

#### ISharedCell.changed:sourceChange

```typescript
type ISharedCell_changed__sourceChange = {
  cell: string;
  delta: ({
    op: "insert";
    arg: string;
  } | {
    op: "delete";
    arg: number;
  } | {
    op: "retain";
    arg: number;
  })[];
}
```

#### ISharedCell.changed:metadataChange

```typescript
type ISharedCell_changed__metadataChange = {
  cell: string;
  delta: {
    key: string;
    act: "delete" | "add" | "update";
    val: any;
  }[];
}
```

<!-- prettier-ignore-end -->

## Development

1. Install Docker
1. Open this repository using a [dev container](https://containers.dev)
1. Run `pdm sync` to setup the environment
1. Run `sh kernel-install.sh` to install the default kernel
1. Run `source .venv/bin/activate` to activate the virtual environment

### Build frontend extension

```sh
jlpm build
```

### Run linters

```sh
pdm run lint
pdm run fix # Fix lint issues
```

### Run tests

```sh
jlpm playwright install --with-deps chromium # Install dependencies
pdm run test
```

### Run GitHub actions

```sh
# Run this command outside the dev container
act --job check --matrix python-version:3.12
```

### Build wheel

```sh
pdm build --no-sdist
```

### Update schema documentation

```sh
# Paste command outputs to this README
python schema-table.py
jlpm run ts-node schema-json.ts
```

### Upgrade dependencies

#### Upgrade pdm-managed dependencies

```sh
pdm update --unconstrained
```

#### Upgrade jlpm-managed dependencies

```sh
jlpm plugin import @yarnpkg/plugin-interactive-tools
jlpm upgrade-interactive
jlpm plugin remove @yarnpkg/plugin-interactive-tools
```

#### Upgrade default kernel dependencies

```sh
sh kernel-upgrade.sh
```

#### Upgrade Docker image dependencies

Check the URLs listed in Dockerfile
