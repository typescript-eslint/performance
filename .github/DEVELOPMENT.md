# Development

After [forking the repo from GitHub](https://help.github.com/articles/fork-a-repo) and [installing Node.js](https://nodejs.org):

```shell
git clone https://github.com/ < your-name-here > /performance
cd performance
npm install
```

> This repository includes a list of suggested VS Code extensions.
> It's a good idea to use [VS Code](https://code.visualstudio.com) and accept its suggestion to install them, as they'll help with development.

## Formatting

[Prettier](https://prettier.io) is used to format code.
It should be applied automatically when you save files in VS Code or make a Git commit.

To manually reformat all files, you can run:

```shell
npm run format -- --write
```

## Linting

This package includes several forms of linting to enforce consistent code quality and styling.
Each should be shown in VS Code, and can be run manually on the command-line:

- `npm lint` ([ESLint](https://eslint.org) with [typescript-eslint](https://typescript-eslint.io)): Lints JavaScript and TypeScript source files
- `npm lint:knip` ([knip](https://github.com/webpro/knip)): Detects unused files, dependencies, and code exports
- `npm lint:md` ([Markdownlint](https://github.com/DavidAnson/markdownlint): Checks Markdown source files
- `npm lint:spelling` ([cspell](https://cspell.org)): Spell checks across all source files

Read the individual documentation for each linter to understand how it can be configured and used best.

For example, ESLint can be run with `--fix` to auto-fix some lint rule complaints:

```shell
npm run lint -- --fix
```

## Adding Benchmarks

There are two kinds of benchmarks in this repo:

- [Comparison types](#adding-a-comparison-type): sets of generated cases measured against each other by `npm run measure`
- [Investigations](#adding-an-investigation): one-off A/B measurements of a specific change, written up in `comparisons/*.md`

Either way, start by generating and measuring the `default` comparison so you know what a baseline looks like on your machine:

```shell
npm run generate
npm run measure
```

### Adding a Comparison Type

Comparison types live in `comparisons` in `src/data.ts`.
Each one lists the [measured attributes](../README.md#measured-attributes) to generate cases for, and every combination of its `files`, `rules`, and `types` becomes its own case under `cases/`.

1. Add an entry to `comparisons`, such as:

   <!-- eslint-skip -->

   ```ts
   wide: {
   	description: "parserOptions.project against parserOptions.projectService with wide imports",
   	files: [128, 1024],
   	layout: "wide",
   	rules: ["recommended"],
   	singleRun: true,
   	types: ["project", "service"],
   },
   ```

2. Generate and measure it by passing its name:

   ```shell
   npm run generate -- wide
   npm run measure -- wide
   ```

If the existing attributes can't express what you want to measure, add a new value for one of them:

- `layout`: add a creator in `src/creators/cases/` and register it in `src/creators/writeCaseFiles.ts`
- `rules` or `types`: update how they're turned into ESLint configs in `src/creators/files/createESLintConfigFile.ts`
- Generated file contents: update `src/creators/files/createModuleFile.ts`

Then add the comparison type to the [_Comparison Types_ list in the README](../README.md#comparison-types).

### Adding an Investigation

Investigations measure the impact of a specific change, such as editing code in typescript-eslint or TypeScript, on a single generated case.

1. Generate cases with `npm run generate`, then `cd` into the `cases/` directory of the case you want to measure
2. Measure the baseline with `hyperfine` and record a CPU profile:

   ```shell
   hyperfine "npm run lint" --ignore-failure --warmup 1
   node --cpu-prof --cpu-prof-interval=100 --cpu-prof-name=baseline.cpuprofile ../../node_modules/eslint/bin/eslint.js src
   ```

3. Make your change, either by editing files in `../../node_modules/` or by pointing `TYPESCRIPT_ESLINT_PATH` at a local typescript-eslint checkout and re-running `npm run generate`
4. Re-run the same `hyperfine` and `node --cpu-prof` commands with a new profile name for your variant
5. Move the `.cpuprofile` files into a new directory under `traces/`
6. Write up the results in a new `comparisons/*.md` file, following the format of the existing ones:
   - A link to the corresponding issue filed on typescript-eslint or TypeScript
   - A description of the change and the commands used to generate the traces
   - A `diff` of the change, if it was made by editing `node_modules/`
   - A table of the `hyperfine` measurements for each variant
