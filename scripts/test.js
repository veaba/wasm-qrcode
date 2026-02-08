#!/usr/bin/env node

/**
 * Cross-platform test runner for monorepo
 *
 * Usage:
 *   node scripts/test.js              - Run all tests
 *   node scripts/test.js --browser    - Run browser tests
 *   node scripts/test.js --coverage   - Run with coverage
 *   node scripts/test.js --watch      - Watch mode
 *   node scripts/test.js --shared     - Test specific package
 *   node scripts/test.js --node       - Test qrcode-node package
 *   node scripts/test.js --bun        - Test qrcode-bun package
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log();
  log('━'.repeat(60), 'cyan');
  log(`  ${title}`, 'cyan');
  log('━'.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    browser: false,
    coverage: false,
    watch: false,
    packages: [],
  };

  for (const arg of args) {
    switch (arg) {
      case '--browser':
      case '-b':
        options.browser = true;
        break;
      case '--coverage':
      case '-c':
        options.coverage = true;
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--shared':
        options.packages.push('shared');
        break;
      case '--node':
        options.packages.push('qrcode-node');
        break;
      case '--ts':
      case '--bun':
        options.packages.push('qrcode-bun');
        break;
      case '--qrcode-js':
        options.packages.push('qrcode-js');
        break;
      case '--all':
        // Run all packages (default)
        break;
      default:
        if (arg.startsWith('--')) {
          logWarning(`Unknown option: ${arg}`);
        }
    }
  }

  return options;
}

// Check if a package has tests
function hasTests(packageName) {
  const packageDir = resolve(rootDir, 'packages', packageName);
  const testFile = resolve(packageDir, 'src', 'index.test.' + (packageName === 'qrcode-js' || packageName.includes('cache') || packageName.includes('perf') ? 'js' : 'ts'));
  return existsSync(testFile);
}

// Get all packages with tests
function getPackagesWithTests() {
  const packages = ['shared', 'qrcode-node', 'qrcode-bun', 'qrcode-js', 'qrcode-js-cache', 'qrcode-js-perf'];
  return packages.filter(pkg => hasTests(pkg));
}

// Build vitest command
function buildVitestCommand(options) {
  const packagesToTest = options.packages.length > 0
    ? options.packages
    : getPackagesWithTests();

  // Build config file path based on mode
  const configPath = options.browser
    ? 'vitest.config.browser.ts'
    : 'vitest.config.ts';

  let command = 'npx vitest';

  if (!options.watch) {
    command += ' run';
  }

  command += ` --config ${configPath}`;

  // Use filter for specific packages
  if (packagesToTest.length > 0 && packagesToTest.length < getPackagesWithTests().length) {
    const filters = packagesToTest.map(pkg => `packages/${pkg}/src/`);
    command += ' ' + filters.map(f => `"${f}"`).join(' ');
  }

  if (options.coverage) {
    command += ' --coverage';
  }

  return command;
}

// Run tests for a specific runtime
async function runTests(runtime, options) {
  logSection(`Running tests for ${runtime}`);

  const startTime = Date.now();

  try {
    let command;

    if (runtime === 'node') {
      command = buildVitestCommand(options);
    } else if (runtime === 'bun') {
      // Bun tests use its own test runner
      const bunPackage = resolve(rootDir, 'packages', 'qrcode-bun');
      command = `cd "${bunPackage}" && bun test`;
    } else {
      command = buildVitestCommand(options);
    }

    log(`Running: ${command}`, 'blue');

    execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env },
    });

    const duration = Date.now() - startTime;
    logSuccess(`${runtime} tests passed (${duration}ms)`);

    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`${runtime} tests failed (${duration}ms)`);
    return false;
  }
}

// Main test runner
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  logSection('QRCode Monorepo Test Runner');
  log(`Mode: ${options.browser ? 'Browser' : 'Node.js'}`, 'blue');
  log(`Coverage: ${options.coverage ? 'Enabled' : 'Disabled'}`, 'blue');
  log(`Watch: ${options.watch ? 'Enabled' : 'Disabled'}`, 'blue');

  const packagesToTest = options.packages.length > 0
    ? options.packages
    : getPackagesWithTests();

  log(`Packages: ${packagesToTest.join(', ')}`, 'blue');

  let allPassed = true;

  // Run Node.js tests (shared, qrcode-node, qrcode-js)
  const nodePackages = packagesToTest.filter(pkg =>
    ['shared', 'qrcode-node', 'qrcode-js', 'qrcode-js-cache', 'qrcode-js-perf'].includes(pkg)
  );

  if (nodePackages.length > 0) {
    const nodeOptions = { ...options, packages: nodePackages };
    const nodePassed = await runTests('Node.js', nodeOptions);
    allPassed = allPassed && nodePassed;
  }

  // Run Bun tests (qrcode-bun)
  if (packagesToTest.includes('qrcode-bun')) {
    const bunPassed = await runTests('Bun', options);
    allPassed = allPassed && bunPassed;
  }

  // Print summary
  logSection('Test Summary');
  if (allPassed) {
    logSuccess('All tests passed!');
    process.exit(0);
  } else {
    logError('Some tests failed!');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run
main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
