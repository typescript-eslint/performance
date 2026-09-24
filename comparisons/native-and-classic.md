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
│ 128   │ 'floating'    │ '1.014 s ± 0.008 s'   │ '0.879 s ± 0.016 s'  │ '0.87x'          │
│ 128   │ 'recommended' │ '1.107 s ± 0.015 s'   │ '0.995 s ± 0.010 s'  │ '0.90x'          │
│ 1024  │ 'floating'    │ '2.713 s ± 0.036 s'   │ '2.458 s ± 0.043 s'  │ '0.91x'          │
│ 1024  │ 'recommended' │ '3.117 s ± 0.041 s'   │ '3.136 s ± 0.037 s'  │ '1.01x'          │
└───────┴───────────────┴───────────────────────┴──────────────────────┴──────────────────┘
```

The native backend is faster in every case but the largest type-heavy one, where it is at parity.
Its advantage is a cheaper program; each type query is a round trip to the native process, so a workload that queries types often pays for it.
Remembering every checker answer for the snapshot, prefetching each file's expression types in one request, and sending changed files with the snapshot instead of through file system callbacks closed a 1.22x gap at 1024 files with `recommendedTypeChecked`.

Both backends reported identical lint results for every case.

## Result Measurement Notes

- Measured on an Apple Silicon Mac with Node.js 24.15.0
- typescript-eslint at [typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) commit `f52446aa0`, with TypeScript 6.0.3 (classic) and `typescript@7.1.0-dev.20260923.1` (native)
