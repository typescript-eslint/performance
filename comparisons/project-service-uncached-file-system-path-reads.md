# Comparison: Project Service Uncached File System Path Reads

> 📌 Filed on TypeScript as [⚡ Performance: Project service doesn't cache all fs.realpath](https://github.com/microsoft/TypeScript/issues/59342).

This comparison shows the cost uncached `fs.realpath` calls inside the project service.

See `traces/service-uncached-realpaths/`:

- `baseline.cpuprofile`: Baseline measurement with no changes
- `caching.cpuprofile`: Adding a caching `Map` to TypeScript's `realpath`

They were generated with:

```shell
cd files-1024-layout-even-singlerun-true-types-service
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=baseline.cpuprofile ../../node_modules/eslint/bin/eslint.js
# edit ../../node_modules/typescript/lib/typescript.js > realpath (see diff below)
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=caching.cpuprofile ../../node_modules/eslint/bin/eslint.js
```

<details>
<summary><code>diff</code> patch to switch to the <em>Caching</em> variant...</summary>

```diff
diff --git a/node_modules/typescript/lib/typescript.js b/node_modules/typescript/lib/typescript.js
index 4baad59..e53476d 100644
--- a/node_modules/typescript/lib/typescript.js
+++ b/node_modules/typescript/lib/typescript.js
@@ -13,6 +13,8 @@ See the Apache Version 2.0 License for specific language governing permissions
 and limitations under the License.
 ***************************************************************************** */

+var realpathCache = new Map();
+
 var ts = {}; ((module) => {
 "use strict";
 var __defProp = Object.defineProperty;
@@ -8798,6 +8800,15 @@ var sys = (() => {
       return path.length < 260 ? _fs.realpathSync.native(path) : _fs.realpathSync(path);
     }
     function realpath(path) {
+      const cached = realpathCache.get(path);
+      if (cached) {
+        return cached;
+      }
+      const result = realpathWorker(path);
+      realpathCache.set(path, result);
+      return result;
+    }
+    function realpathWorker(path) {
       try {
         return fsRealpath(path);
       } catch {
```

</details>

Hyperfine measurements with `--runs 50` show a ~0.5-2.5% improvement in lint time:

| Variant  | Measurement       | User Time |
| -------- | ----------------- | --------- |
| Baseline | 3.153 s ± 0.039 s | 4.403 s   |
| Caching  | 3.073 s ± 0.048 s | 4.377 s   |
