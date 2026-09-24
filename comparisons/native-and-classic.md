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
│ 128   │ 'floating'    │ '1.067 s ± 0.064 s'   │ '0.885 s ± 0.021 s'  │ '0.83x'          │
│ 128   │ 'recommended' │ '1.125 s ± 0.023 s'   │ '1.202 s ± 0.077 s'  │ '1.07x'          │
│ 1024  │ 'floating'    │ '2.846 s ± 0.110 s'   │ '2.593 s ± 0.124 s'  │ '0.91x'          │
│ 1024  │ 'recommended' │ '3.266 s ± 0.057 s'   │ '3.998 s ± 0.099 s'  │ '1.22x'          │
└───────┴───────────────┴───────────────────────┴──────────────────────┴──────────────────┘
```

The native backend is faster with a single typed rule, but slower with `recommendedTypeChecked`, and the gap widens with more files.
Its advantage is a cheaper program; each type query is a round trip to the native process, so a workload that queries types often pays for it.

Both backends reported identical lint results for every case.

## Result Measurement Notes

- Measured on an Apple Silicon Mac with Node.js 24.15.0
- typescript-eslint at [typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) commit `a0ff647e6`, with TypeScript 6.0.3 (classic) and `typescript@7.1.0-dev.20260923.1` (native)
