# CLAUDE.md - Project Context for AI Assistants

This file provides essential context for Claude Code and other AI assistants working on this test automation project.

## Project Overview

**What**: A comprehensive Playwright TypeScript test automation framework for The Internet application (http://the-internet.herokuapp.com/)

**Status**: Framework foundation complete with 57 tests across authentication, forms, and dynamic controls. Ready for expansion.

**Architecture**: Monorepo containing:
- `APP-UNDER-TEST/` - Ruby/Sinatra testing target (reference only)
- `playwright-tests/` - TypeScript test framework (main focus)
- `PRPs/` - Product Requirement Prompts (blueprints)

## Quick Start Commands

```bash
# Navigate to test directory
cd playwright-tests

# Run tests
npm test                     # All tests
npm run test:ui             # Interactive UI mode
npm run test:headed         # See browser
npx playwright test [file]  # Specific file

# Code quality
npm run typecheck           # TypeScript check
npm run lint               # ESLint check

# Debugging
npx playwright test --debug # Debug mode
npx playwright show-report  # View last report
```

## Project Structure

```
playwright-tests/
├── tests/e2e/           # Test specs by feature
├── page-objects/        # Page Object Model classes
│   └── base/           # BasePage abstract class
├── fixtures/           # Test setup and fixtures
├── test-data/          # Test data and factories
├── utils/              # Helper utilities
├── types/              # TypeScript definitions
└── config/             # Environment configs
```

## Core Patterns (MUST FOLLOW)

### Page Object Model

```typescript
// ALWAYS use page objects - no selectors in tests
export class LoginPage extends BasePage {
  readonly url = '/login';
  
  private readonly usernameInput: Locator;
  
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
  }
  
  async login(username: string, password: string): Promise<void> {
    // Implementation
  }
}
```

### Test Structure

```typescript
test.describe('Feature Name', () => {
  let page: PageObject;
  
  test.beforeEach(async ({ page: browserPage }) => {
    page = new PageObject(browserPage);
    await page.navigate();
  });
  
  test('should do specific action', async () => {
    // Arrange → Act → Assert
  });
});
```

### Wait Strategies

```typescript
// ✅ CORRECT
await expect(element).toBeVisible();
await page.waitForLoadState('networkidle');

// ❌ NEVER
await page.waitForTimeout(5000);  // No hard waits!
```

## Key Rules for AI Assistants

1. **Page Objects Required** - All UI interactions through page objects
2. **TypeScript Strict Mode** - No `any` types, no `@ts-ignore`
3. **Atomic Tests** - Each test must be independent
4. **No Hard Waits** - Use Playwright's auto-waiting
5. **Follow Patterns** - Check existing implementations first
6. **Test Before Suggesting** - Run `npm run typecheck` and `npm test`

## Adding New Features

### Step 1: Create Page Object
```bash
# Location: page-objects/[feature]/[Page]Page.ts
# Extend: BasePage
# Pattern: See page-objects/auth/LoginPage.ts
```

### Step 2: Add Test Data
```bash
# Location: test-data/[feature]-data.ts
# Pattern: Use factories for dynamic data
```

### Step 3: Write Tests
```bash
# Location: tests/e2e/[feature]/[feature].spec.ts
# Structure: describe → beforeEach → test
```

### Step 4: Validate
```bash
npm run typecheck  # Must pass
npm test          # Must pass
npm run lint      # Must pass
```

## Current Implementation Status

### ✅ Completed
- Authentication (login/logout)
- Form interactions (checkboxes, dropdowns)
- Dynamic controls
- Base utilities and fixtures
- CI/CD pipeline (GitHub Actions)

### 🚧 To Implement
- File upload/download
- Drag and drop
- JavaScript alerts
- Frames/iframes
- Hover interactions
- Table operations
- Visual regression
- API testing layer

## Environment Configuration

- **Local**: `http://localhost:9292` (run `cd APP-UNDER-TEST && rackup`)
- **Production**: `http://the-internet.herokuapp.com` (default)
- **Credentials**: `tomsmith/SuperSecretPassword!` (form auth), `admin/admin` (basic auth)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Timeout errors | Increase timeout in specific test: `test.setTimeout(60000)` |
| Flaky tests | Add retry: `test.describe.configure({ retries: 2 })` |
| Element not found | Check selector in page object, use `npx playwright codegen` |
| TypeScript errors | Run `npm run typecheck` to see details |

## File Naming Conventions

- Test files: `[feature].spec.ts`
- Page objects: `[Page]Page.ts` (PascalCase)
- Utilities: `[function].utils.ts`
- Types: `[domain].types.ts`

## Git Workflow

```bash
git add .
git commit -m "type: description"  # feat|fix|test|refactor|docs|chore
git push origin branch-name
```

## Important Notes

- **Focus**: Expand test coverage for remaining features
- **Quality**: Maintain <2% flakiness, <10min execution
- **Documentation**: Update only when requested
- **Patterns**: Follow existing implementations in `page-objects/` and `tests/`

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed technical architecture
- [GETTING-STARTED.md](./GETTING-STARTED.md) - Setup and development guide
- [Playwright Docs](https://playwright.dev) - Official documentation
- Test Site: http://the-internet.herokuapp.com

---

**Last Updated**: 2024 | **Framework Version**: 1.0.0 | **Primary Focus**: `playwright-tests/`