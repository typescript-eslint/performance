# Comparison: Globals in Scopes

> 📌 Filed on typescript-eslint as [⚡ Performance: Overhead of populateGlobalsFromLib in scope-manager](https://github.com/typescript-eslint/typescript-eslint/issues/9575).

This trace shows the impact of `@typescript-eslint/scope-manager`'s `populateGlobalsFromLib`.

See `traces/globals-scope-manager/`:

- `baseline.cpuprofile`: Baseline measurement with no changes
- `skipping.cpuprofile`: Commenting out the contents of `populateGlobalsFromLib`

They were generated with:

```shell
cd files-1024-layout-even-singlerun-true-types-service
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=baseline.cpuprofile ../../node_modules/eslint/bin/eslint.js
# clear ../../node_modules/@typescript-eslint/scope-manager/dist/referencer/Referencer.js > populateGlobalsFromLib
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=skipping.cpuprofile ../../node_modules/eslint/bin/eslint.js
```

Hyperfine measurements show a ~20% improvement in lint time:

| Variant  | Measurement       | User Time |
| -------- | ----------------- | --------- |
| Baseline | 3.137 s ± 0.024 s | 4.417 s   |
| Skipping | 2.477 s ± 0.014 s | 3.501 s   |
