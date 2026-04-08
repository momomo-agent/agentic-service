# Task: 统一默认端口为 1234

## 目标

修复文档与代码端口不一致问题：文档说 3000，代码默认 1234。统一为 1234。

## 文件清单

### 需要修改的文件

1. **docker-compose.yml** — 端口映射和环境变量
2. **README.md** — 所有端口引用
3. **Dockerfile** (如果存在 EXPOSE 指令)

### 需要检查的文件

- `bin/agentic-service.js` — 确认默认端口是 1234 (已确认，无需修改)
- `src/server/api.js` — 确认无硬编码端口
- 所有 `.md` 文档文件 — 搜索 3000 端口引用

## 实现细节

### 1. docker-compose.yml 修改

**当前内容**:
```yaml
services:
  agentic-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 3
```

**修改后**:
```yaml
services:
  agentic-service:
    build: .
    ports:
      - "1234:1234"
    environment:
      - NODE_ENV=production
      - PORT=1234
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:1234/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 3
```

**变更点**:
1. 端口映射: `"3000:3000"` → `"1234:1234"`
2. 添加环境变量: `PORT=1234`
3. healthcheck URL: `localhost:3000` → `localhost:1234`

### 2. README.md 修改

**搜索并替换**:
- `localhost:3000` → `localhost:1234`
- `http://localhost:3000` → `http://localhost:1234`
- `https://localhost:3000` → `https://localhost:1234`
- `3000:3000` → `1234:1234`
- `port 3000` → `port 1234`
- `端口 3000` → `端口 1234`

**需要检查的章节**:
- 安装说明
- Docker 使用说明
- 快速开始
- API 端点示例
- 故障排查

### 3. Dockerfile 修改 (如果存在)

**搜索**:
```dockerfile
EXPOSE 3000
```

**替换为**:
```dockerfile
EXPOSE 1234
```

## 边界情况

1. **用户自定义端口**:
   - `--port` 参数仍然有效
   - 环境变量 `PORT` 可覆盖默认值
   - 不影响用户配置文件

2. **现有容器**:
   - 需要重新构建: `docker-compose build`
   - 需要重新启动: `docker-compose up`

3. **文档中的示例代码**:
   - 确保所有 curl 示例使用 1234
   - 确保所有浏览器 URL 使用 1234

## 错误处理

无需特殊错误处理，这是配置修改。

## 测试用例

### 手动验证

```bash
# 1. 验证 Docker 配置
grep -n "3000" docker-compose.yml
# 预期: 无输出

# 2. 验证 README
grep -n "3000" README.md
# 预期: 无输出

# 3. 验证 Docker 启动
docker-compose up -d
sleep 5
curl http://localhost:1234/health
# 预期: 200 OK

# 4. 验证 healthcheck
docker-compose ps
# 预期: healthy 状态

# 5. 验证 npx 启动
npx agentic-service --skip-setup &
sleep 3
curl http://localhost:1234/health
# 预期: 200 OK
```

### 自动化测试

```javascript
// test/port-config.test.js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Port configuration consistency', () => {
  it('docker-compose.yml uses port 1234', () => {
    const content = readFileSync('docker-compose.yml', 'utf-8');
    expect(content).toContain('1234:1234');
    expect(content).toContain('PORT=1234');
    expect(content).toContain('localhost:1234');
    expect(content).not.toContain('3000');
  });

  it('README.md uses port 1234', () => {
    const content = readFileSync('README.md', 'utf-8');
    expect(content).toContain('1234');
    expect(content).not.toContain('localhost:3000');
  });
});
```

## 依赖关系

- 无代码依赖
- 仅修改配置和文档文件

## 验证步骤

1. 修改 docker-compose.yml
2. 修改 README.md
3. 检查 Dockerfile (如果存在)
4. 运行 `grep -r "3000" docker-compose.yml README.md Dockerfile`
5. 验证输出为空或仅包含无关内容
6. 运行 Docker 测试
7. 运行 npx 测试

## 回滚方案

如果需要回滚:
```bash
git checkout docker-compose.yml README.md Dockerfile
```

## 注意事项

1. **不要修改 bin/agentic-service.js**: 默认端口已经是 1234
2. **不要修改用户配置**: `~/.agentic-service/config.json` 不受影响
3. **保持向后兼容**: 用户仍可通过 `--port 3000` 使用旧端口
