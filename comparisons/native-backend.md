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

The native backend is faster on a handful of files and much slower on a project.

```plaintext
┌───────┬───────────────────────┬───────────────────────┬───────────────────────┐
│ files │ project (even layout) │ service (even layout) │ native (even layout)  │
├───────┼───────────────────────┼───────────────────────┼───────────────────────┤
│ 1024  │ '2.202 s ±  0.144 s'  │ '2.499 s ±  0.209 s'  │ '41.695 s ±  1.879 s' │
└───────┴───────────────────────┴───────────────────────┴───────────────────────┘
```

### Where The Time Goes

Linting subsets of the same generated project separates the fixed cost of getting ready from the marginal cost per file.
Each measurement is three runs after a warmup, taken with `hyperfine "npx eslint <files>"` inside the case directory.

| Files linted | `project` | `native` | Ratio |
| ------------ | --------- | -------- | ----- |
| 1            | 1.449 s   | 0.848 s  | 0.59  |
| 8            | 1.465 s   | 1.163 s  | 0.79  |
| 32           | 1.494 s   | 2.098 s  | 1.40  |
| 128          | 1.558 s   | 5.829 s  | 3.74  |
| 1024         | 2.202 s   | 41.695 s | 18.93 |

The two backends have opposite shapes.
`project` pays about 1.4 s up front to build a program and then roughly 0.7 ms for each additional file.
The native backend starts in about 0.8 s, which beats building a program, but then pays roughly 40 ms for each additional file.
That is about 54 times the marginal cost, and it puts the crossover somewhere around 20 to 25 files.

The likely cause is that every type query is a round trip to the compiler process, so cost tracks the number of checker calls rather than the size of the project.
That has not been profiled, so treat it as the hypothesis the numbers support rather than a measured conclusion.

## Measurement Notes

- The numbers above were taken with `@typescript/native` at `7.1.0-dev.20260822.1`, on an 8 core Apple Silicon Mac with a load average near 2.
  The `project` column matches the 2.371 s recorded in the repository README, so the harness is consistent with earlier runs.
- The native backend spawns a compiler process per lint run.
  That start up turns out to be cheaper than building a program, so it is not where the time goes.
- The native backend requires Node.js 22 or newer.
- `@typescript/native` ships its own `tsc` binary, which npm hoists to the repository root when the native case is generated.
  The `tsc` script therefore calls TypeScript by path, so that it does not silently run the preview compiler instead.
- `project` and `service` resolve `typescript` from the local checkout, which pins TypeScript 6.
  Measuring against a different TypeScript version means changing that checkout, not this repository.
