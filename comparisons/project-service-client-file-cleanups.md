# Comparison: Project Service Client File Cleanups

> 📌 Filed on TypeScript as [⚡ Performance: Project service spends excess time cleaning client files when called synchronously](https://github.com/microsoft/TypeScript/issues/59335).

This comparison shows the cost of the TypeScript project service calling `cleanupProjectsAndScriptInfos`.

See `traces/service-file-cleanup/`:

- `baseline.cpuprofile`: Baseline measurement with no changes
- `skipping.cpuprofile`: Commenting out the contents of TypeScript's `cleanupProjectsAndScriptInfos`

They were generated with:

```shell
cd files-1024-layout-even-singlerun-true-types-service
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=baseline.cpuprofile ../../node_modules/eslint/bin/eslint.js
# clear ../../node_modules/typescript/lib/typescript.js > cleanupProjectsAndScriptInfos
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=skipping.cpuprofile ../../node_modules/eslint/bin/eslint.js
```

Hyperfine measurements show a ~15-20% improvement in lint time:

| Variant  | Measurement       | User Time |
| -------- | ----------------- | --------- |
| Baseline | 3.215 s ± 0.041 s | 4.483 s   |
| Skipping | 2.501 s ± 0.017 s | 3.758 s   |
