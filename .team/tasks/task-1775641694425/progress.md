# 创建 src/index.js 入口文件

## Progress

Created 4 aggregator/entry files:
- `src/index.js` — main package entry
- `src/runtime/index.js` — runtime aggregator
- `src/server/index.js` — server aggregator
- `src/detector/index.js` — detector aggregator

package.json already had `"main": "src/index.js"` — no change needed.
Hub/Brain have no default exports, used `export * as Hub/Brain` pattern.
