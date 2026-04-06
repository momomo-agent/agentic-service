# M36: Architecture补全 — profiles/default.json + README + 语音延迟 + headless camera

## 目标
补全剩余架构缺口，提升architecture match至30%+，完成文档和性能基准。

## 范围
1. profiles/default.json — 内置默认硬件profile (P0)
2. README.md — npx/Docker/API完整文档 (P1)
3. 语音延迟基准测试 <2s — STT+LLM+TTS端到端验证 (P1)
4. sense.js headless camera路径 — 服务端无头摄像头支持 (P1)

## 验收标准
- profiles/default.json存在且包含CPU/GPU默认配置
- README.md包含npx安装、Docker部署、REST API文档
- 语音延迟基准测试通过<2s目标并输出报告
- sense.js支持无浏览器videoElement的服务端路径

## Gap来源
- Architecture gap: profiles/default.json missing (P0)
- Architecture gap: src/detector/profiles.js partial
- PRD gap: README文档缺失
- Vision gap: 语音延迟<2s验证
- Architecture gap: sense.js headless路径缺失
