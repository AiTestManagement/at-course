# CLAUDE.md - Playwright TypeScript Test Automation Project

This file provides essential context for AI assistance with the Playwright TypeScript test automation framework for the-internet.herokuapp.com.

## 🎯 Project Overview

**Purpose**: Automated E2E testing framework for web application testing course  
**Current Focus**: Testing checkbox functionality at http://the-internet.herokuapp.com/checkboxes  
**Framework**: Playwright with TypeScript, Page Object Model architecture  
**Status**: ✅ Framework established, checkbox tests implemented, documentation complete

## 📁 Project Structure

```
at-course/                        # Root project directory
├── playwright-tests/             # Main test framework (ACTIVE DEVELOPMENT)
│   ├── src/
│   │   ├── pages/               # Page Object Models
│   │   │   ├── BasePage.ts     # Abstract base class
│   │   │   └── CheckboxPage.ts # Checkbox page implementation
│   │   ├── fixtures/            # Custom test fixtures
│   │   └── utils/               # Helpers and constants
│   ├── tests/
│   │   ├── checkbox.spec.ts    # Main checkbox tests (10 tests)
│   │   └── checkbox-edge-cases.spec.ts # Edge cases (13 tests)
│   ├── playwright.config.ts    # Playwright configuration
│   └── [Documentation files: README, GETTING-STARTED, ARCHITECTURE]
├── APP-UNDER-TEST/              # Target application source (Ruby/Sinatra)
└── PRPs/                        # Product Requirement Prompts & docs
```

## 🔧 Technical Stack

- **Test Framework**: Playwright 1.55.0
- **Language**: TypeScript 5.9.2
- **Node.js**: 18.x / 20.x / 22.x
- **Browsers**: Chromium, Firefox, WebKit
- **Target App**: http://the-internet.herokuapp.com

## 🎭 Key Implementation Details

### Checkbox Page Specifics
```typescript
// CRITICAL: Custom JS syncs checked attribute with property
// Must verify BOTH when testing:
const propertyChecked = await checkbox.isChecked();
const attributeChecked = await checkbox.getAttribute('checked') !== null;
expect(propertyChecked).toBe(attributeChecked);

// GOTCHA: No <label> elements - text is not clickable
// Initial states: checkbox1=false, checkbox2=true
```

### Page Object Pattern
```typescript
// Pattern in use:
export class CheckboxPage extends BasePage {
  readonly checkboxes: Locator;
  
  async checkCheckbox(index: number): Promise<CheckboxPage> {
    // Method chaining enabled
    return this;
  }
}
```

### Test Organization
- **Naming**: `{feature}.spec.ts`, `{feature}-edge-cases.spec.ts`
- **Structure**: `test.describe()` blocks with `test.beforeEach()` setup
- **Fixtures**: Custom fixtures for page object injection
- **Data-driven**: Test cases array pattern for repetitive scenarios

## 📝 Common Commands

```bash
# Development
npm test                      # Run all tests
npm run test:ui              # Interactive UI mode
npm run test:chrome          # Chrome only
npm run typecheck            # TypeScript validation
npm run lint                 # ESLint check

# Specific tests
npx playwright test checkbox.spec.ts --project=chromium
npx playwright test -g "verify initial"  # Run by name pattern

# Debugging
npm run test:debug           # Debug mode
npm run test:headed          # See browser
npx playwright show-report   # View HTML report
```

## 🚀 Current Capabilities

### ✅ Implemented
- Full Playwright TypeScript framework setup
- Page Object Model with BasePage abstraction
- Checkbox functionality tests (23 total)
- Cross-browser testing configuration
- Custom fixtures and utilities
- Comprehensive documentation (README, GETTING-STARTED, ARCHITECTURE)

### 🔄 Ready for Extension
- Additional page objects (follow CheckboxPage pattern)
- More test features (use existing test structure)
- API testing integration
- Visual regression testing
- CI/CD pipeline (GitHub Actions ready)

## ⚠️ Important Context

### Known Issues
- Firefox occasionally has timeout issues with parallel execution
- Use `--workers=2` to avoid timeout problems
- Custom checkbox JS behavior requires special handling
- **Test execution requires being in the `playwright-tests` directory** - always `cd playwright-tests` before running tests
- The-internet.herokuapp.com may respond slowly at times - this is normal behavior

### Test Data
- No authentication required for current tests
- Static test data in `src/utils/constants.ts`
- Factory pattern ready for dynamic data generation

### Environment
- Single environment: http://the-internet.herokuapp.com
- No local deployment needed
- Tests run against live site

## 🎓 Documentation Available

1. **README.md** - Project overview, installation, usage
2. **GETTING-STARTED.md** - Onboarding guide for new engineers
3. **ARCHITECTURE.md** - Technical architecture and patterns
4. **PRPs/** - Product requirement documents and AI context

## 📋 For AI Assistance

### When helping with this project:

1. **Follow existing patterns**:
   - Page objects extend BasePage
   - Tests use describe/beforeEach structure
   - Methods return `this` for chaining

2. **Use project conventions**:
   - TypeScript with full typing
   - Async/await for all Playwright operations
   - Constants in UPPER_CASE, classes in PascalCase

3. **Reference documentation**:
   - Check ARCHITECTURE.md for patterns
   - Use playwright-test-framework-prp.md for implementation details
   - Follow examples in existing test files

4. **Test considerations**:
   - Tests must be isolated (no dependencies)
   - Verify both property and attribute for checkboxes
   - Use `--workers=2` for stable execution

### Priority Areas for Enhancement

1. **Immediate**: Add tests for other the-internet.herokuapp.com pages
2. **Short-term**: Implement API testing alongside UI tests
3. **Medium-term**: Add visual regression testing
4. **Long-term**: Full CI/CD pipeline with reporting dashboard

## 🔄 Recent Changes

- **2024-08-24**: Initial framework implementation
- **2024-08-24**: Checkbox tests completed (23 tests)
- **2024-08-24**: Documentation suite created
- **2024-08-24**: CLAUDE.md created for AI context
- **2025-08-24**: Resolved test execution issue - must run from playwright-tests directory

---

*Version: 1.0 | Last Updated: 2024-08-24*

### Quick Reference
- **Main test directory**: `playwright-tests/`
- **Run tests**: `cd playwright-tests && npm test`
- **Key files**: `CheckboxPage.ts`, `checkbox.spec.ts`
- **Target URL**: http://the-internet.herokuapp.com/checkboxes