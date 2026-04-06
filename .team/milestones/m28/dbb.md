# M28 DBB — Done-By-Build Criteria

## task-1775515078705: VAD集成
- [ ] Web UI有push-to-talk按钮可录音
- [ ] VAD自动检测语音开始/结束，无需手动按键
- [ ] 静音超过阈值自动停止录音并发送STT
- [ ] VAD和push-to-talk可切换

## task-1775515085075: HTTPS/LAN隧道
- [ ] `--https` flag启动HTTPS服务
- [ ] 自签名证书自动生成（首次启动）
- [ ] LAN内其他设备可通过IP访问
- [ ] HTTP自动重定向到HTTPS

## task-1775515085107: CDN profiles 7天缓存刷新
- [ ] 缓存超7天自动重新拉取CDN
- [ ] 拉取失败时使用旧缓存（不报错）
- [ ] 缓存文件记录`fetchedAt`时间戳

## task-1775515085136: Docker + setup.sh
- [ ] `docker-compose up` 端到端构建并启动服务
- [ ] `curl http://localhost:3000/api/status` 返回200
- [ ] `setup.sh` 重复执行无副作用
- [ ] Node.js已安装时跳过安装步骤
