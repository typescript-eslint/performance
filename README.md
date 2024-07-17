<h1 align="center">typescript-eslint Performance Comparisons</h1>

<p align="center">Various performance baselines for typescript-eslint.</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
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
npm generate
npm measure
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

Right now, `parserOptions.project` outperforms `parserOptions.projectService`.
This is a performance issue and we are investigating it as a critical bug for v8.

```plaintext
┌───────┬──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ files │ project (even)       │ project (references) │ service (even)       │ service (references) │
┼───────┼──────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ 128   │ '1.149 s ±  0.030 s' │ '1.135 s ±  0.008 s' │ '1.178 s ±  0.010 s' │ '1.736 s ±  0.012 s' │
│ 512   │ '1.636 s ±  0.009 s' │ '1.656 s ±  0.004 s' │ '1.895 s ±  0.007 s' │ '2.613 s ±  0.020 s' │
│ 1024  │ '2.353 s ±  0.013 s' │ '2.399 s ±  0.016 s' │ '3.130 s ±  0.017 s' │ '4.034 s ±  0.061 s' │
┴───────┴──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/typescript-eslint/performance/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/typescript-eslint/performance/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->
