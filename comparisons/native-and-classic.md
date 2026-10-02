# Comparison: Native and Classic Project Services

This compares the classic `parserOptions.projectService` against the experimental TypeScript 7.1 native backend, `projectService: { EXPERIMENTAL_backend: "native" }`.

It was generated with:

```shell
TYPESCRIPT_ESLINT_PATH=$(realpath ../typescript-eslint) npm run generate:native
TYPESCRIPT_ESLINT_PATH=$(realpath ../typescript-eslint) npm run measure:native
```

```plaintext
┌───────┬───────────────┬───────────────────────┬──────────────────────┬──────────────────┐
│ files │ rules         │ service (even layout) │ native (even layout) │ native / service │
├───────┼───────────────┼───────────────────────┼──────────────────────┼──────────────────┤
│ 128   │ 'floating'    │ '1.055 s ± 0.051 s'   │ '0.916 s ± 0.058 s'  │ '0.87x'          │
│ 128   │ 'recommended' │ '1.168 s ± 0.066 s'   │ '1.006 s ± 0.024 s'  │ '0.86x'          │
│ 1024  │ 'floating'    │ '2.855 s ± 0.200 s'   │ '2.478 s ± 0.050 s'  │ '0.87x'          │
│ 1024  │ 'recommended' │ '3.046 s ± 0.025 s'   │ '2.932 s ± 0.034 s'  │ '0.96x'          │
│ 4096  │ 'floating'    │ '8.411 s ± 0.042 s'   │ '7.833 s ± 0.029 s'  │ '0.93x'          │
│ 4096  │ 'recommended' │ '9.956 s ± 0.376 s'   │ '10.316 s ± 0.329 s' │ '1.04x'          │
└───────┴───────────────┴───────────────────────┴──────────────────────┴──────────────────┘
```

The native backend is faster in every case except 4096 files with `recommendedTypeChecked`, where the two are about even.
Its advantage is a cheaper program; each type query is a round trip to the native process, so a workload that queries types often pays for it.
Remembering checker answers for the snapshot, prefetching each file's expression types in one request, answering a symbol's type once away from identifiers, and sending changed files with the snapshot instead of through file system callbacks turned a 1.22x gap at 1024 files with `recommendedTypeChecked` into 0.96x.
Classic got faster at 4096 files since the previous measurement, from [typescript-eslint#12934](https://github.com/typescript-eslint/typescript-eslint/pull/12934) throttling its per-open cleanup.

Both backends reported identical lint results for every case.

## Result Measurement Notes

- Measured on an Apple Silicon Mac with Node.js 24.15.0, with the machine otherwise idle
- typescript-eslint at [typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) commit `7d5b80850`, with TypeScript 6.0.3 (classic) and `typescript@7.1.0-dev.20261001.1` (native)
