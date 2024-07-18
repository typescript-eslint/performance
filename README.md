<h1 align="center">typescript-eslint Performance Comparisons</h1>

<p align="center">Various performance baselines for typescript-eslint.</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 2" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-2-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/typescript-eslint/performance/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/typescript-eslint/performance/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

You'll need [hyperfine](https://github.com/sharkdp/hyperfine) installed locally, such as with `brew install hyperfine` or `winget install hyperfine`.
See [sharkdp/hyperfine#installation](https://github.com/sharkdp/hyperfine#installation).

```shell
npm install
npm run generate
npm run measure
```

### Measured Attributes

The `caseEntries` values in `src/data.ts` can be modified to test:

- `files`: roughly how many generated files should be linted
- `layout`: what rough shape of imports those files exhibit:
  - `"even"`: a single root-level `index.ts` importing from roughly an even triangle shape of files
  - `"references"`: a single root-level `tsconfig.json` with project references to a few projects
  - `"wide"`: one root-level `index.ts` importing from all files in the project
- `singleRun`: whether to enable [single-run inference](https://v8--typescript-eslint.netlify.app/packages/parser#disallowautomaticsingleruninference) as a performance boost
- `types`: whether to use `parserOptions.project` or `parserOptions.projectService` for typed linting

## Results

Right now, `parserOptions.project` _with_ single-run inference outperforms `parserOptions.projectService`.
This is a performance issue and we are investigating it as a critical bug for v8.

```plaintext
┌───────┬───────────────────────┬───────────────────────┐
│ files │ project (even layout) │ service (even layout) │
┼───────┼───────────────────────┼───────────────────────┤
│ 1024  │ '1.750 s ±  0.008 s'  │ '2.473 s ±  0.011 s'  │
┴───────┴───────────────────────┴───────────────────────┘
```

See [typescript-eslint/typescript-eslint#9571 Performance: parserOptions.projectService no longer outperforms parserOptions.project](https://github.com/typescript-eslint/typescript-eslint/issues/9571) in typescript-eslint.
Also see the 📌 pinned issues later in this file.

### Result Measurement Notes

- Example measurements taken on an M1 Max Mac Studio with Node.js 22.4.1
- These results are similar across TypeScript versions: 5.0.4, 5.4.5, and 5.5.3

## Traces

The `traces/` directory contains more specific traces for investigations.

> ✨ You might consider using [0x](https://github.com/davidmarkclements/0x) for nice flamegraph visuals.

All comparisons were run on a common shape of linting: 1024 files with the "even" (triangle-shaped) imports layout.

### Comparison: Globals in Scopes

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

### Comparison: Project and Project Service

This is a preliminary trace to start debugging their differences.

See `traces/Project 1 - Service 2.cpuprofile`.

- Trace #1: `parserOptions.project`
- Trace #2: `parserOptions.projectService`

It was generated with:

```shell
cd cases/files-1024-layout-even-singlerun-true-types-project
node --inspect-brk ../../node_modules/eslint/bin/eslint.js
cd ../files-1024-layout-even-singlerun-true-types-service
node --inspect-brk ../../node_modules/eslint/bin/eslint.js
```

Comparing equivalent code paths:

| Code Path         | Project | Service |
| ----------------- | ------- | ------- |
| All `verifyText`s | 2040ms  | 2859ms  |
| `parseForESLint`  | 993ms   | 1090ms  |

### Comparison: Project Service Client File Cleanups

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

### Comparison: Project Service Uncached File System Stats

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

### Comparison: Project Service Uncached File System Path Reads

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

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://jakebailey.dev/"><img src="https://avatars.githubusercontent.com/u/5341706?v=4?s=100" width="100px;" alt="Jake Bailey"/><br /><sub><b>Jake Bailey</b></sub></a><br /><a href="#ideas-jakebailey" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->
