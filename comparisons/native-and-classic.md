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
│ 128   │ 'floating'    │ '0.988 s ± 0.018 s'   │ '0.854 s ± 0.013 s'  │ '0.86x'          │
│ 128   │ 'recommended' │ '1.082 s ± 0.012 s'   │ '0.957 s ± 0.007 s'  │ '0.88x'          │
│ 1024  │ 'floating'    │ '2.639 s ± 0.018 s'   │ '2.382 s ± 0.012 s'  │ '0.90x'          │
│ 1024  │ 'recommended' │ '3.033 s ± 0.013 s'   │ '2.933 s ± 0.021 s'  │ '0.97x'          │
│ 4096  │ 'floating'    │ '9.966 s ± 0.072 s'   │ '7.643 s ± 0.036 s'  │ '0.77x'          │
│ 4096  │ 'recommended' │ '11.579 s ± 0.081 s'  │ '9.627 s ± 0.056 s'  │ '0.83x'          │
└───────┴───────────────┴───────────────────────┴──────────────────────┴──────────────────┘
```

The native backend is faster in every case, and furthest ahead at 4096 files.
Its advantage is a cheaper program; each type query is a round trip to the native process, so a workload that queries types often pays for it.
Remembering checker answers for the snapshot, prefetching each file's expression types in one request, answering a symbol's type once away from identifiers, and sending changed files with the snapshot instead of through file system callbacks turned a 1.22x gap at 1024 files with `recommendedTypeChecked` into 0.97x.

Both backends reported identical lint results for every case.

## Result Measurement Notes

- Measured on an Apple Silicon Mac with Node.js 24.15.0, with the machine otherwise idle
- typescript-eslint at [typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) commit `de8edf5e5`, with TypeScript 6.0.3 (classic) and `typescript@7.1.0-dev.20260923.1` (native)
