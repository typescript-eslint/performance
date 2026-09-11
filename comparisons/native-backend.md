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

The native backend is now the fastest of the three.

```plaintext
┌───────┬───────────────────────┬───────────────────────┬──────────────────────┐
│ files │ project (even layout) │ service (even layout) │ native (even layout) │
├───────┼───────────────────────┼───────────────────────┼──────────────────────┤
│ 1024  │ '2.075 s ±  0.023 s'  │ '2.387 s ±  0.052 s'  │ '1.779 s ±  0.030 s' │
└───────┴───────────────────────┴───────────────────────┴──────────────────────┘
```

It was not always.
The first run of this comparison measured 41.695 s.
Investigating that gap found three pieces of per-file work in typescript-eslint that only depended on the project.
See [typescript-eslint/typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803).

### Scaling

Linting subsets of the same generated project separates the fixed cost of
getting ready from the marginal cost per file.
Each measurement is three runs after a warmup.

| Files linted | `project` | `native` before | `native` after |
| ------------ | --------- | --------------- | -------------- |
| 1            | 1.456 s   | 0.848 s         | 0.843 s        |
| 8            | 1.459 s   | 1.163 s         | 0.859 s        |
| 32           | 1.493 s   | 2.098 s         | 0.895 s        |
| 128          | 1.570 s   | 5.829 s         | 0.992 s        |
| 1024         | 2.092 s   | 41.695 s        | 1.798 s        |

The native backend starts in about 0.84 s, which beats the 1.46 s that building
a program costs.
Its marginal cost per file went from about 40 ms to about 0.9 ms, against about
0.6 ms for `project`.
So it now leads at every size measured, by the most on small runs where the
cheaper start up dominates.

## Measurement Notes

- The numbers above were taken with `@typescript/native` at `7.1.0-dev.20260822.1`, on an 8 core Apple Silicon Mac with a load average near 2.
  The `project` column matches the 2.371 s recorded in the repository README, so the harness is consistent with earlier runs.
- The native backend spawns a compiler process per lint run.
  That start up turns out to be cheaper than building a program, so it is not where the time goes.
- The native backend requires Node.js 22 or newer.
- `@typescript/native` ships its own `tsc` binary, which npm hoists over this repository's TypeScript when the native case is generated.
  `npm run tsc` then runs the preview compiler and reports errors that are not real.
- `project` and `service` resolve `typescript` from the local checkout, which pins TypeScript 6.
  Measuring against a different TypeScript version means changing that checkout, not this repository.
