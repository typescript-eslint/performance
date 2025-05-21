# Comparison: Project and Project Service

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
