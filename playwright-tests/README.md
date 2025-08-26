# Playwright TypeScript Test Framework

## 📋 Project Overview

This is a production-ready Playwright test automation framework built with TypeScript, implementing comprehensive test coverage for web application testing. The framework follows the Page Object Model (POM) design pattern and includes tests for the checkbox functionality at [the-internet.herokuapp.com](http://the-internet.herokuapp.com/checkboxes).

### Key Features
- ✅ TypeScript for type-safe test development
- ✅ Page Object Model architecture for maintainability
- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Comprehensive test coverage including edge cases
- ✅ Custom fixtures for enhanced test organization
- ✅ Detailed HTML and JSON reporting
- ✅ CI/CD ready configuration

## 🔧 Prerequisites

### System Requirements
- **Node.js**: Version 18.x, 20.x, or 22.x
- **Operating System**: 
  - Windows 10+ / Windows Server 2016+ / WSL
  - macOS 11+ (Big Sur and later)
  - Ubuntu 20.04 / 22.04 / 24.04
  - Debian 11 / 12
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Disk Space**: ~2GB for browser binaries

### Development Tools
- Visual Studio Code (recommended) or any IDE with TypeScript support
- Git for version control

## 📦 Installation

1. **Clone the repository** (if applicable):
```bash
git clone <repository-url>
cd playwright-tests
```

2. **Install dependencies**:
```bash
npm install
```

3. **Install Playwright browsers**:
```bash
npx playwright install
```

This will download browser binaries for Chromium, Firefox, and WebKit.

## 🚀 Quick Start

### Run your first test:
```bash
# Run all tests on all browsers
npm test

# Run tests on a specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Run specific test file
npm run test:checkbox

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed
```

### View test results:
```bash
# Generate and open HTML report
npm run report
```

## 📝 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `npm test` | Run all tests on all configured browsers |
| `test:ui` | `npm run test:ui` | Open Playwright Test UI for interactive testing |
| `test:headed` | `npm run test:headed` | Run tests with browser window visible |
| `test:debug` | `npm run test:debug` | Run tests in debug mode |
| `test:chrome` | `npm run test:chrome` | Run tests only on Chromium |
| `test:firefox` | `npm run test:firefox` | Run tests only on Firefox |
| `test:webkit` | `npm run test:webkit` | Run tests only on WebKit |
| `test:checkbox` | `npm run test:checkbox` | Run checkbox-specific tests |
| `typecheck` | `npm run typecheck` | Run TypeScript type checking |
| `lint` | `npm run lint` | Run ESLint code quality checks |
| `format` | `npm run format` | Format code with Prettier |
| `report` | `npm run report` | Open last test report in browser |

### Advanced Commands

```bash
# Run specific test by name pattern
npx playwright test -g "verify initial checkbox"

# Run tests with specific number of workers
npx playwright test --workers=2

# Run tests and update snapshots
npx playwright test --update-snapshots

# Run tests with trace on
npx playwright test --trace on

# List all tests without running
npx playwright test --list
```

## 📁 Project Structure

```
playwright-tests/
├── src/                           # Source code
│   ├── pages/                     # Page Object Models
│   │   ├── BasePage.ts           # Base page with common functionality
│   │   └── CheckboxPage.ts       # Checkbox page implementation
│   ├── fixtures/                  # Custom test fixtures
│   │   └── test.ts               # Extended test with fixtures
│   └── utils/                     # Utility functions
│       ├── helpers.ts            # Helper functions
│       └── constants.ts          # Test constants and data
├── tests/                         # Test specifications
│   ├── checkbox.spec.ts          # Main checkbox tests
│   ├── checkbox-edge-cases.spec.ts # Edge case tests
│   └── tsconfig.json             # Test-specific TypeScript config
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # Root TypeScript configuration
├── package.json                   # Project dependencies
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
└── .gitignore                    # Git ignore patterns
```

### Key Components

- **Page Objects** (`src/pages/`): Encapsulate page-specific logic and locators
- **Test Fixtures** (`src/fixtures/`): Custom fixtures for test setup and teardown
- **Utilities** (`src/utils/`): Reusable helper functions and constants
- **Test Specs** (`tests/`): Actual test implementations using Playwright Test

## 🤝 Contributing Guidelines

We welcome contributions! Please follow these guidelines:

### Code Style
1. **TypeScript**: All code must be written in TypeScript with proper typing
2. **Linting**: Run `npm run lint` before committing
3. **Formatting**: Run `npm run format` to ensure consistent code style
4. **Type Checking**: Ensure `npm run typecheck` passes with no errors

### Testing Standards
1. **Page Object Model**: All page interactions should go through page objects
2. **Test Isolation**: Tests must be independent and not rely on execution order
3. **Descriptive Names**: Use clear, descriptive test and method names
4. **No Hard Waits**: Avoid `page.waitForTimeout()`, use proper waiting strategies
5. **Cross-browser**: Ensure tests work on all supported browsers

### Pull Request Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm test`)
5. Run type checking (`npm run typecheck`)
6. Commit your changes with descriptive messages
7. Push to your fork and create a Pull Request

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 [Your Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support & Contact

### Getting Help
- **Documentation**: Check the [Playwright documentation](https://playwright.dev)
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/your-org/your-repo/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/your-org/your-repo/discussions)

### Troubleshooting

**Tests timing out?**
- Check your internet connection
- Verify the target website is accessible
- Try reducing the number of parallel workers: `--workers=2`

**Browser installation issues?**
```bash
# Reinstall browsers
npx playwright install --force

# Install with system dependencies (Linux)
npx playwright install --with-deps
```

**TypeScript errors?**
```bash
# Check for type errors
npm run typecheck

# Ensure @types/node is installed
npm install -D @types/node
```

### Team Contact
- **Project Lead**: [Your Name] - [email@example.com]
- **QA Team**: [qa-team@example.com]
- **Slack Channel**: #test-automation

## 🎯 Quick Tips

1. **Debug a specific test**: Click the green play button in VS Code with Playwright extension
2. **View test trace**: Tests automatically capture trace on retry - check `test-results/` folder
3. **Update snapshots**: Run `npx playwright test --update-snapshots`
4. **Run single test**: Use `.only` modifier: `test.only('my test', async () => {})`
5. **Skip test**: Use `.skip` modifier: `test.skip('my test', async () => {})`
6. **Parallel execution**: Tests run in parallel by default, use `--workers=1` for serial execution

## 📊 Test Reports

After test execution, reports are available in multiple formats:

- **HTML Report**: Interactive report with screenshots and traces
  - Location: `playwright-report/`
  - Open with: `npm run report`

- **JSON Report**: Machine-readable results
  - Location: `test-results.json`
  - Use for: CI/CD integration

- **Test Artifacts**: Screenshots, videos, and traces on failure
  - Location: `test-results/`
  - Automatically captured on test failure

---

**Happy Testing! 🎭**