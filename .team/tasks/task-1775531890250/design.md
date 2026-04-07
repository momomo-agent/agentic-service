# Design: Verify and complete README.md

## File
`README.md`

## Audit Result
README already covers:
- npx install, global install, Docker ✓
- Environment variables ✓
- API endpoints (chat, transcribe, synthesize, status, config) ✓
- Docker deployment + docker-compose ✓
- UI routes ✓
- Hardware profiles ✓
- Configuration reference ✓
- Troubleshooting ✓

## Missing Sections to Add
1. Hardware requirements (min specs)
2. Voice latency expectations

## Changes to README.md

### Add after "## Quick Start":
```markdown
## Hardware Requirements

| Tier | GPU | RAM | Recommended Model |
|---|---|---|---|
| High | Apple Silicon / NVIDIA 8GB+ | 16GB+ | gemma4:26b q8 |
| Mid | Any GPU 4GB+ | 8GB+ | llama3.2:3b |
| CPU | None | 8GB+ | llama3.2:1b |
```

### Add to "## Troubleshooting":
```markdown
| Voice latency >2s | Check STT provider in config; switch to `openai-whisper` for lower latency |
```

## Test Cases
- README renders without broken links
- All API endpoints documented match `src/server/api.js` routes
- Hardware table covers all profile tiers in `profiles/default.json`
