# setup.sh Node.js detection and idempotency

## Progress

- setup.sh already had Node.js detection and version guard
- Fixed: `npm install` was unconditional; now guarded with `[ ! -d node_modules ]`
- All acceptance criteria met
