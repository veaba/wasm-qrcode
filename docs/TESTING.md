# Testing Guide

This document describes how to run tests for the `@veaba/qrcode` monorepo.

## Prerequisites

Install dependencies:

```bash
pnpm install
```

## Test Commands

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

### Run Browser Tests

```bash
pnpm test:browser
```

### Run Unit Tests Only

```bash
pnpm test:unit
```

## Test Specific Packages

### Test Shared Package

```bash
pnpm test:shared
```

### Test Node.js Package

```bash
pnpm test:node
```

### Test Bun/TypeScript Package

```bash
pnpm test:ts
```

## Test Script Options

You can also use the test script directly:

```bash
node scripts/test.js [options]
```

Options:

- `--browser` / `-b` - Run browser tests
- `--coverage` / `-c` - Enable coverage report
- `--watch` / `-w` - Watch mode
- `--shared` - Test shared package only
- `--node` - Test qrcode-node package only
- `--ts` - Test qrcode-bun package only
- `--qrcode-js` - Test qrcode-js package only

## Browser Mode Tests

For browser-specific tests, use the browser config:

```bash
vitest --config vitest.config.browser.ts
```

## Package-Specific Test Locations

| Package | Test Location |
|---------|---------------|
| @veaba/qrcode-shared | `packages/shared/src/index.test.ts` |
| @veaba/qrcode-node | `packages/qrcode-node/src/index.test.ts` |
| @veaba/qrcode-bun | `packages/qrcode-bun/src/index.test.ts` |
| @veaba/qrcode-js | `packages/qrcode-js/src/index.test.js` |
| qrcode-js-cache | `packages/qrcode-js-cache/src/index.test.js` |
| qrcode-js-perf | `packages/qrcode-js-perf/src/index.test.js` |
| @veaba/qrcode-rust | `packages/qrcode-rust/src/pkg.test.ts` |
| @veaba/qrcode-wasm | `packages/qrcode-wasm/src/pkg.test.ts` |

## CI/CD

The tests are designed to run in CI/CD environments:

```yaml
- run: pnpm install
- run: pnpm test:unit
```

## Notes

- WASM packages require `wasm-pack` to be built before testing
- Bun tests require Bun runtime to be installed
- Browser tests use Playwright via `@vitest/browser`
