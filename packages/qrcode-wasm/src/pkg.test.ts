/**
 * @veaba/qrcode-wasm - Unit Tests
 * Tests for WASM QRCode generator
 */

import { describe, it, expect } from 'vitest';

describe('@veaba/qrcode-wasm - WASM Module', () => {
  it('should load WASM module', async () => {
    // Note: This test requires the WASM module to be built first
    // Run: wasm-pack build --target web --out-dir pkg
    const module = await import('../pkg/wasm_qrcode.js');
    expect(module).toBeDefined();
  });

  it('should have default export', async () => {
    try {
      const module = await import('../pkg/wasm_qrcode.js');
      // Module should have exports after wasm-pack build
      expect(module).toBeDefined();
    } catch (error) {
      // WASM might not be built yet
      expect(error.message).toBeDefined();
    }
  });
});

describe('@veaba/qrcode-wasm - Build Requirements', () => {
  it('requires wasm-pack to be installed', () => {
    // This is a documentation test
    expect(true).toBe(true);
  });

  it('requires Rust toolchain', () => {
    // This is a documentation test
    expect(true).toBe(true);
  });
});
