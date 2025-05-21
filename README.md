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

You can manually measure individual cases by running `hyperfine ../../node_modules/eslint/bin/eslint.js --ignore-failure --warmup 1`.

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

Right now, `parserOptions.project` with single-run inference outperforms `parserOptions.projectService`.
This is a performance issue and we are investigating it as a bug.

```plaintext
┌───────┬───────────────────────┬───────────────────────┐
│ files │ project (even layout) │ service (even layout) │
├───────┼───────────────────────┼───────────────────────┤
│ 1024  │ '2.371 s ±  0.029 s'  │ '2.724 s ±  0.049 s'  │
└───────┴───────────────────────┴───────────────────────┘
```

See [typescript-eslint/typescript-eslint#9571 Performance: parserOptions.projectService no longer outperforms parserOptions.project](https://github.com/typescript-eslint/typescript-eslint/issues/9571) in typescript-eslint.

### Result Measurement Notes

- Example measurements taken on an M1 Max Mac Studio with Node.js 22.12.0
- These results are similar across TypeScript versions: 5.0.4, 5.4.5, and 5.5.3

## Comparisons

The `comparisons/` directory contains details on more specific comparisons.
See each `comparisons/*.md` file for details on what's being measured.

## Traces

The `traces/` directory contains more specific traces for investigations.

> ✨ You might consider using [0x](https://github.com/davidmarkclements/0x) for nice flamegraph visuals.

All comparisons were run on a common shape of linting: 1024 files with the "even" (triangle-shaped) imports layout.

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
