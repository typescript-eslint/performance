# Comparison: Native and Classic Project Services

This compares the classic `parserOptions.projectService` against the experimental TypeScript 7.1 native backend, `projectService: { backend: "native" }`.

It was generated with:

```shell
TYPESCRIPT_ESLINT_PATH=$(realpath ../typescript-eslint) npm run generate:native
TYPESCRIPT_ESLINT_PATH=$(realpath ../typescript-eslint) npm run measure:native
```

```plaintext
┌───────┬───────────────┬───────────────────────┬──────────────────────┬──────────────────┐
│ files │ rules         │ service (even layout) │ native (even layout) │ native / service │
├───────┼───────────────┼───────────────────────┼──────────────────────┼──────────────────┤
│ 128   │ 'floating'    │ '1.003 s ± 0.019 s'   │ '0.877 s ± 0.020 s'  │ '0.87x'          │
│ 128   │ 'recommended' │ '1.098 s ± 0.015 s'   │ '0.968 s ± 0.009 s'  │ '0.88x'          │
│ 1024  │ 'floating'    │ '2.640 s ± 0.013 s'   │ '2.390 s ± 0.023 s'  │ '0.91x'          │
│ 1024  │ 'recommended' │ '3.059 s ± 0.024 s'   │ '2.955 s ± 0.011 s'  │ '0.97x'          │
└───────┴───────────────┴───────────────────────┴──────────────────────┴──────────────────┘
```

The native backend is faster in every case, though least so for the largest type-heavy one.
Its advantage is a cheaper program; each type query is a round trip to the native process, so a workload that queries types often pays for it.
Remembering checker answers for the snapshot, prefetching each file's expression types in one request, answering a symbol's type once away from identifiers, and sending changed files with the snapshot instead of through file system callbacks turned a 1.22x gap at 1024 files with `recommendedTypeChecked` into 0.97x.

Both backends reported identical lint results for every case.

## Result Measurement Notes

- Measured on an Apple Silicon Mac with Node.js 24.15.0, with the machine otherwise idle
- typescript-eslint at [typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) commit `0859bb016`, with TypeScript 6.0.3 (classic) and `typescript@7.1.0-dev.20260923.1` (native)
