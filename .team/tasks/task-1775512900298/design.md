# Design: 提升测试覆盖率至 98%

## Files to Modify
- `vitest.config.js` — 添加 coverage thresholds
- `test/api.test.js` — 补充缺失测试
- `test/profiles.test.js` — 空数组边界
- `test/server.test.js` — SIGINT 优雅关闭

## vitest.config.js
```js
coverage: {
  provider: 'v8',
  thresholds: { lines: 98, functions: 98, branches: 98, statements: 98 }
}
```

## 新增测试

### POST /api/transcribe 无效格式
```js
it('returns 400 for non-audio content-type', async () => {
  const res = await request(app).post('/api/transcribe')
    .set('Content-Type', 'application/json').send({ text: 'hi' })
  expect(res.status).toBe(400)
})
```

### PUT /api/config 磁盘写失败
```js
it('returns 500 when fs.writeFile fails', async () => {
  vi.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('disk full'))
  const res = await request(app).put('/api/config').send({ llm: {} })
  expect(res.status).toBe(500)
})
```

### profiles.js 空数组边界
```js
it('returns default profile when profiles array is empty', () => {
  const result = getProfile(hardware, [])
  expect(result).toEqual(defaultProfile)
})
```

### SIGINT 优雅关闭
```js
it('calls server.close on SIGINT', () => {
  const closeSpy = vi.spyOn(server, 'close')
  process.emit('SIGINT')
  expect(closeSpy).toHaveBeenCalled()
})
```

## Edge Cases
- mock 需在每个 test 后 `vi.restoreAllMocks()`
- SIGINT 测试需防止真正退出进程
