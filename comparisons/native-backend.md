# Comparison: Native Backend

The TypeScript 7.1 native backend is an unpublished, experimental parser backend in typescript-eslint.
It replaces the classic `typescript` API with the `@typescript/native` preview API, reached over IPC to a separate compiler process.

See [typescript-eslint/typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) for the implementation.

## Running It

The backend is not published, so measuring it requires a local typescript-eslint checkout.
Point `TYPESCRIPT_ESLINT_PATH` at one, and every case will use that build rather than the published package.
Without it, the native case is skipped and the comparison runs as it did before.

```shell
cd ../typescript-eslint
pnpm install
pnpm nx run-many -t build
cd ../performance
TYPESCRIPT_ESLINT_PATH=$(realpath ../typescript-eslint) npm run generate
TYPESCRIPT_ESLINT_PATH=$(realpath ../typescript-eslint) npm run measure
```

Set `TYPESCRIPT_NATIVE_VERSION` if the checkout pins a different `@typescript/native` preview.
The version has to match: typescript-eslint rejects any preview it has not been tested against.

## What Is Being Compared

All three cases lint identical source and report the same single `no-floating-promises` diagnostic, so the only variable is how type information is obtained.

| Case      | `parserOptions`                         |
| --------- | --------------------------------------- |
| `project` | `project: true`                         |
| `service` | `projectService: true`                  |
| `native`  | `projectService: { backend: "native" }` |

## Results

None recorded yet.

The harness is verified working: all three cases generate, lint, and report the same single diagnostic.
Measurements taken so far were on a contended machine and are not usable, with a standard deviation above half the mean.
Record numbers only from an otherwise idle machine, and note the `@typescript/native` preview version alongside them, since the native column is expected to move as the preview API changes.

```plaintext
┌───────┬───────────────────────┬───────────────────────┬──────────────────────┐
│ files │ project (even layout) │ service (even layout) │ native (even layout) │
├───────┼───────────────────────┼───────────────────────┼──────────────────────┤
│       │                       │                       │                      │
└───────┴───────────────────────┴───────────────────────┴──────────────────────┘
```

## Measurement Notes

- The native backend spawns a compiler process per lint run, so its cold cost is structurally different from the two in-process backends.
  A warmup of 1 does not amortize that the way it does for `project` and `service`.
- The native backend requires Node.js 22 or newer.
- `@typescript/native` ships its own `tsc` binary, which npm hoists to the repository root when the native case is generated.
  The `tsc` script therefore calls TypeScript by path, so that it does not silently run the preview compiler instead.
- `project` and `service` resolve `typescript` from the local checkout, which pins TypeScript 6.
  Measuring against a different TypeScript version means changing that checkout, not this repository.
