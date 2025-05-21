# Comparison: Project Service Uncached File System Stats

> 📌 Filed on TypeScript as [⚡ Performance: Project service doesn't cache all fs.statSync](https://github.com/microsoft/TypeScript/issues/59338).

This comparison shows the cost uncached `fs.statSync` calls inside the project service.

See `traces/service-uncached-stats/`:

- `baseline.cpuprofile`: Baseline measurement with no changes
- `caching.cpuprofile`: Adding a caching `Map` to TypeScript's `statSync`

They were generated with:

```shell
cd files-1024-layout-even-singlerun-true-types-service
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=baseline.cpuprofile ../../node_modules/eslint/bin/eslint.js
# edit ../../node_modules/typescript/lib/typescript.js > statSync (see diff below)
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=caching.cpuprofile ../../node_modules/eslint/bin/eslint.js
```

<details>
<summary><code>diff</code> patch to switch to the <em>Caching</em> variant...</summary>

```diff
diff --git a/node_modules/typescript/lib/typescript.js b/node_modules/typescript/lib/typescript.js
index 4baad59..44639d5 100644
--- a/node_modules/typescript/lib/typescript.js
+++ b/node_modules/typescript/lib/typescript.js
@@ -8546,9 +8546,15 @@ var sys = (() => {
         }
       }
     };
+    const statCache = new Map();
     return nodeSystem;
     function statSync(path) {
-      return _fs.statSync(path, { throwIfNoEntry: false });
+      if (statCache.has(path)) {
+        return statCache.get(path);
+      }
+      const result = _fs.statSync(path, { throwIfNoEntry: false });
+      statCache.set(path, result);
+      return result;
     }
     function enableCPUProfiler(path, cb) {
       if (activeSession) {
```

</details>

Hyperfine measurements show a ~7-12% improvement in lint time:

| Variant  | Measurement       | User Time |
| -------- | ----------------- | --------- |
| Baseline | 3.112 s ± 0.033 s | 4.382     |
| Caching  | 2.740 s ± 0.030 s | 4.032     |
