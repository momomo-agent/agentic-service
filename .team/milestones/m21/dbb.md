# M21 DBB - Detector完善 + Admin路由 + 架构对齐

## DBB-001: profiles.js getProfile 返回正确配置
- Given: 调用 `getProfile({ platform:'darwin', arch:'arm64', gpu:{type:'apple-silicon'}, memory:16 })`
- Expect: 返回含 `llm`, `stt`, `tts`, `fallback` 字段的 profile 对象
- Verify: unit test

## DBB-002: profiles.js 无匹配时返回默认配置
- Given: 调用 `getProfile({ platform:'linux', arch:'x64', gpu:{type:'none'}, memory:4 })`
- Expect: 返回内置默认 profile，不抛出异常
- Verify: unit test

## DBB-003: optimizer.js 导出 optimize 函数
- Given: `import { optimize } from './optimizer.js'`
- Expect: 函数存在，接受 `(hardware, profile)` 返回调整后的 profile
- Verify: unit test

## DBB-004: Admin UI /admin 路由可访问
- Given: 服务启动，访问 `http://localhost:3000/admin`
- Expect: 返回 Admin 管理面板 HTML，包含设备列表区域
- Verify: browser or curl

## DBB-005: client router 包含 /admin 路由
- Given: Vue Router 配置
- Expect: routes 数组含 `{ path: '/admin', component: AdminApp }`
- Verify: 代码审查
