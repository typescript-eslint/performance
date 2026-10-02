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
│ 128   │ 'floating'    │ '0.982 s ± 0.006 s'   │ '0.823 s ± 0.006 s'  │ '0.84x'          │
│ 128   │ 'recommended' │ '1.068 s ± 0.012 s'   │ '0.921 s ± 0.009 s'  │ '0.86x'          │
│ 1024  │ 'floating'    │ '2.653 s ± 0.019 s'   │ '2.272 s ± 0.010 s'  │ '0.86x'          │
│ 1024  │ 'recommended' │ '3.011 s ± 0.016 s'   │ '2.742 s ± 0.013 s'  │ '0.91x'          │
│ 4096  │ 'floating'    │ '8.377 s ± 0.048 s'   │ '7.194 s ± 0.042 s'  │ '0.86x'          │
│ 4096  │ 'recommended' │ '9.576 s ± 0.054 s'   │ '8.862 s ± 0.100 s'  │ '0.93x'          │
│ 8192  │ 'floating'    │ '16.400 s ± 0.035 s'  │ '13.920 s ± 0.085 s' │ '0.85x'          │
│ 8192  │ 'recommended' │ '18.724 s ± 0.087 s'  │ '17.111 s ± 0.048 s' │ '0.91x'          │
└───────┴───────────────┴───────────────────────┴──────────────────────┴──────────────────┘
```

The native backend is faster in every case: by about 15% with only `no-floating-promises`, and by 7 to 14% with `recommendedTypeChecked`.
Its advantage is a cheaper program; each type query is a round trip to the native process, so a workload that queries types often pays for it.

Both backends reported identical lint results for every case.

## Result Measurement Notes

- Measured on an Apple Silicon Mac with Node.js 24.15.0, with no other heavy workloads running
- typescript-eslint at [typescript-eslint#12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803) commit `6563fe18d`, with TypeScript 6.0.3 (classic) and `typescript@7.1.0-dev.20261001.1` (native)
