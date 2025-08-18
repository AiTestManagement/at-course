name: "Playwright TypeScript PRP Template v1 - E2E Testing Implementation-Focused"
description: |
  Template for creating comprehensive PRPs for Playwright TypeScript test automation projects.
  Focuses on end-to-end testing, page object models, test data management, and CI/CD integration.

---

## Goal

**Feature Goal**: [Specific, measurable test coverage or automation goal - e.g., "Automate user registration flow with data validation"]

**Deliverable**: [Concrete testing artifact - test suite, page object, test data factory, utility function, etc.]

**Success Definition**: [How you'll know the test automation is complete and reliable - e.g., "All user registration scenarios pass consistently across 3 browsers"]

## User Persona (if applicable)

**Target User**: [Who will use/maintain these tests - QA engineer, developer, product team, etc.]

**Use Case**: [Primary scenario for test execution - CI/CD pipeline, manual testing, regression validation, etc.]

**Test Journey**: [Step-by-step flow of test execution and validation]

**Pain Points Addressed**: [Specific testing gaps or manual processes this automation solves]

## Why

- [Testing value and quality assurance impact]
- [Integration with existing test suite]
- [Risk mitigation and coverage gaps this addresses]

## What

[Test scenarios, coverage areas, and automation requirements]

### Success Criteria

- [ ] [Specific measurable test outcomes and coverage targets]

## All Needed Context

### Context Completeness Check

_Before writing this PRP, validate: "If someone knew nothing about this test codebase, would they have everything needed to implement reliable tests successfully?"_

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: [Application URL or staging environment]
  why: [Specific user flows or features to test]
  critical: [Key behaviors that must be validated]

- file: [exact/path/to/existing/test/pattern.spec.ts]
  why: [Specific test pattern to follow - page object usage, assertion patterns, etc.]
  pattern: [Brief description of test structure to extract]
  gotcha: [Known test flakiness or timing issues to avoid]

- docfile: [PRPs/ai_docs/playwright_patterns.md]
  why: [Custom documentation for Playwright best practices]
  section: [Specific section if document is large]

- environment: [staging.example.com or test environment details]
  credentials: [How to access test data or authentication]
  data: [Test user accounts, sample data requirements]
```

### Current Test Codebase Structure (run `tree tests/` to get overview)

```bash

```

### Desired Test Codebase Structure with files to be added

```bash
tests/
├── e2e/
│   ├── {feature}/
│   │   ├── {feature}.spec.ts          # Main test scenarios
│   │   ├── {feature}-edge-cases.spec.ts # Edge case testing
│   │   └── {feature}-visual.spec.ts    # Visual regression tests
├── page-objects/
│   ├── {feature}/
│   │   ├── {feature}.page.ts          # Page object model
│   │   └── {feature}.components.ts    # Reusable component selectors
├── fixtures/
│   ├── {feature}/
│   │   ├── test-data.ts               # Test data factories
│   │   └── mock-responses.ts          # API mocking data
├── utils/
│   ├── {feature}-helpers.ts           # Feature-specific utilities
│   └── common-actions.ts              # Shared test actions
└── config/
    ├── test-environments.ts           # Environment configurations
    └── {feature}-config.ts            # Feature-specific test config
```

### Known Gotchas & Playwright Quirks

```typescript
// CRITICAL: Playwright-specific patterns and pitfalls
// Example: await page.waitForLoadState('networkidle') for SPA navigation
// Example: Use page.locator() over page.$() for better auto-waiting
// Example: Screenshots should use fullPage: true for consistent visual testing
// Example: API mocking must be setup before page.goto()
// Example: File uploads require proper file path handling across OS
// Example: Parallel test execution requires proper test isolation
```

## Implementation Blueprint

### Test Data Models and Structure

Create robust test data models ensuring type safety and reusability.

```typescript
Examples:
 - TypeScript interfaces for test data
 - Test user account models
 - API response type definitions
 - Form validation data structures
 - Test configuration types
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE fixtures/{domain}/test-data.ts
  - IMPLEMENT: TypeScript interfaces and factory functions for test data
  - FOLLOW pattern: fixtures/existing/existing-data.ts (factory patterns, data generation)
  - NAMING: PascalCase for interfaces, camelCase for factory functions
  - PLACEMENT: Test data in fixtures/{domain}/

Task 2: CREATE page-objects/{domain}/{Feature}.page.ts
  - IMPLEMENT: Page Object Model with proper TypeScript typing and Playwright locators
  - FOLLOW pattern: page-objects/existing/ExistingPage.page.ts (locator patterns, method structure)
  - NAMING: PascalCase for class names, camelCase for methods, descriptive locator names
  - DEPENDENCIES: Import test data types from Task 1
  - PLACEMENT: Page objects in page-objects/{domain}/

Task 3: CREATE utils/{domain}-helpers.ts
  - IMPLEMENT: Utility functions for common test actions and validations
  - FOLLOW pattern: utils/existing-helpers.ts (async/await patterns, error handling)
  - NAMING: camelCase for utility functions, clear descriptive names
  - DEPENDENCIES: Import page objects from Task 2, test data from Task 1
  - PLACEMENT: Utilities in utils/

Task 4: CREATE tests/e2e/{domain}/{feature}.spec.ts
  - IMPLEMENT: Main test scenarios using page objects and test data
  - FOLLOW pattern: tests/e2e/existing/existing.spec.ts (test structure, before/after hooks)
  - NAMING: Descriptive test names, grouped by functionality in describe blocks
  - DEPENDENCIES: Import page objects from Task 2, utilities from Task 3, test data from Task 1
  - PLACEMENT: E2E tests in tests/e2e/{domain}/

Task 5: CREATE tests/e2e/{domain}/{feature}-edge-cases.spec.ts
  - IMPLEMENT: Edge case and error scenario testing
  - FOLLOW pattern: tests/e2e/existing/existing-edge-cases.spec.ts (error testing, boundary conditions)
  - NAMING: Clear edge case scenario descriptions
  - DEPENDENCIES: Import all components from previous tasks
  - PLACEMENT: Edge case tests in tests/e2e/{domain}/

Task 6: CREATE tests/e2e/{domain}/{feature}-visual.spec.ts (if visual testing required)
  - IMPLEMENT: Visual regression tests with screenshot comparisons
  - FOLLOW pattern: tests/e2e/existing/existing-visual.spec.ts (screenshot patterns, visual assertions)
  - NAMING: Visual test naming conventions, viewport-specific tests
  - COVERAGE: Key UI states and responsive breakpoints
  - PLACEMENT: Visual tests in tests/e2e/{domain}/
```

### Implementation Patterns & Key Details

```typescript
// Show critical Playwright patterns and gotchas - keep concise, focus on non-obvious details

// Example: Page Object pattern
export class {Feature}Page {
  readonly page: Page;
  
  // PATTERN: Use descriptive locator getters (follow page-objects/existing patterns)
  readonly submitButton = this.page.locator('[data-testid="submit-btn"]');
  readonly errorMessage = this.page.locator('.error-message');
  
  constructor(page: Page) {
    this.page = page;
  }

  // PATTERN: Async methods with proper waiting strategies
  async fillForm(data: {Feature}Data): Promise<void> {
    // GOTCHA: Use waitForLoadState for SPA navigation
    await this.page.waitForLoadState('networkidle');
    // CRITICAL: Prefer data-testid over CSS selectors for stability
  }

  // PATTERN: Assertion methods within page objects
  async expectSuccessMessage(): Promise<void> {
    // GOTCHA: Use toBeVisible() not toBeTruthy() for UI elements
    await expect(this.successMessage).toBeVisible();
  }
}

// Example: Test structure pattern
test.describe('{Feature} Flow', () => {
  let {feature}Page: {Feature}Page;
  
  test.beforeEach(async ({ page }) => {
    // PATTERN: Page object instantiation (see tests/e2e/existing patterns)
    {feature}Page = new {Feature}Page(page);
    // GOTCHA: API mocking must happen before navigation
  });

  test('should handle happy path scenario', async ({ page }) => {
    // PATTERN: AAA pattern - Arrange, Act, Assert
    // GOTCHA: Use page.waitForResponse() for API-dependent tests
  });
});

// Example: Test data factory pattern
export function create{Feature}Data(overrides?: Partial<{Feature}Data>): {Feature}Data {
  // PATTERN: Factory with sensible defaults and override capability
  // GOTCHA: Use unique identifiers to avoid test data conflicts
}
```

### Integration Points

```yaml
CI_CD:
  - pipeline: ".github/workflows/playwright.yml or .gitlab-ci.yml"
  - browsers: "chromium, firefox, webkit for cross-browser testing"
  - reports: "HTML report generation and artifact storage"

TEST_DATA:
  - database: "Test database seeding and cleanup strategies"
  - api_mocking: "Mock Service Worker or Playwright route mocking"
  - external_services: "Third-party service mocking approaches"

ENVIRONMENTS:
  - staging: "Stable environment for reliable test execution"
  - local: "Local development environment test execution"
  - config: "Environment-specific configuration management"

REPORTING:
  - artifacts: "Screenshot and video capture on failure"
  - metrics: "Test execution time and flakiness tracking"
  - integration: "Test result integration with project management tools"
```

## Validation Loop

### Level 1: Syntax & Test Setup (Immediate Feedback)

```bash
# Run after each test file creation - fix before proceeding
npx playwright install                 # Install browser dependencies
npx playwright check                   # Validate test syntax and imports
npm run lint                          # ESLint checks with TypeScript rules
npx tsc --noEmit                      # TypeScript type checking

# Test configuration validation
npx playwright test --list           # List all tests without execution
npx playwright test --dry-run        # Validate test structure

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Individual Test Validation (Component Testing)

```bash
# Test each spec file as it's created
npx playwright test tests/e2e/{domain}/{feature}.spec.ts
npx playwright test tests/e2e/{domain}/{feature}.spec.ts --headed  # Visual debugging

# Page object validation
npx playwright test tests/e2e/{domain}/ --grep "basic navigation"

# Cross-browser validation for critical paths
npx playwright test tests/e2e/{domain}/{feature}.spec.ts --project=chromium
npx playwright test tests/e2e/{domain}/{feature}.spec.ts --project=firefox
npx playwright test tests/e2e/{domain}/{feature}.spec.ts --project=webkit

# Expected: All tests pass consistently. If flaky, investigate timing and add proper waits.
```

### Level 3: Integration Testing (Full Test Suite)

```bash
# Full test suite execution
npx playwright test                   # Run all tests
npx playwright test --parallel        # Parallel execution validation

# Environment-specific testing
npx playwright test --config=staging.config.ts
npx playwright test --config=local.config.ts

# Visual regression validation (if visual tests exist)
npx playwright test tests/e2e/{domain}/{feature}-visual.spec.ts

# Performance and reliability testing
npx playwright test --repeat-each=3   # Test stability across multiple runs
npx playwright test --retries=2       # Validate retry behavior

# Report generation
npx playwright show-report           # HTML report review

# Expected: All tests pass, reports generated, no consistent failures across runs
```

### Level 4: CI/CD & Production Validation

```bash
# CI/CD Pipeline Validation:

# Local CI simulation
act -P ubuntu-latest=nektos/act-environments-ubuntu:18.04  # GitHub Actions local run

# Docker container testing (if containerized)
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:focal npm test

# Performance benchmarking
npx playwright test --reporter=json | jq '.suites[].tests[] | select(.outcome == "passed") | .results[].duration'

# Cross-environment validation
ENVIRONMENT=staging npx playwright test
ENVIRONMENT=production npx playwright test --config=prod.config.ts

# Accessibility testing integration
npx playwright test --grep "@accessibility"

# API contract validation (if API testing included)
npx playwright test tests/api/ --reporter=json

# Load testing integration (if applicable)
npx playwright test --workers=10 tests/performance/

# Expected: All validations pass, CI/CD ready, performance benchmarks met
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npx playwright test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Cross-browser compatibility verified
- [ ] Test reports generated successfully

### Test Coverage Validation

- [ ] All success criteria from "What" section covered by tests
- [ ] Happy path scenarios fully automated
- [ ] Edge cases and error scenarios tested
- [ ] Visual regression tests implemented (if required)
- [ ] API integrations properly mocked or tested

### Quality & Reliability Validation

- [ ] Tests pass consistently across multiple runs
- [ ] No flaky tests or timing issues
- [ ] Proper test isolation and cleanup
- [ ] Page objects follow established patterns
- [ ] Test data management implemented correctly

### Playwright-Specific Validation

- [ ] Proper use of Playwright locators and waiting strategies
- [ ] Screenshot and video capture configured for failures
- [ ] Parallel execution works without conflicts
- [ ] Browser-specific behaviors properly handled
- [ ] Test artifacts properly managed

### CI/CD Integration

- [ ] Tests run successfully in CI/CD pipeline
- [ ] Test reports integrated with build process
- [ ] Environment-specific configurations working
- [ ] Test execution time within acceptable limits

### Documentation & Maintenance

- [ ] Test scenarios clearly documented in code
- [ ] Page objects well-structured and maintainable
- [ ] Test data factories provide good coverage
- [ ] Configuration changes properly documented

---

## Anti-Patterns to Avoid

- ❌ Don't use CSS selectors when data-testid attributes are available
- ❌ Don't create tests without proper waiting strategies (avoid arbitrary sleeps)
- ❌ Don't ignore test flakiness - investigate and fix root causes
- ❌ Don't duplicate test logic - use page objects and utilities
- ❌ Don't hardcode test data - use factories and configuration
- ❌ Don't skip cross-browser testing for critical user flows
- ❌ Don't create tests that depend on external services without proper mocking
- ❌ Don't ignore test execution time - optimize slow tests