# Create Playwright TypeScript PRP

## Feature: $ARGUMENTS

## PRP Creation Mission

Create a comprehensive Playwright TypeScript PRP that enables **one-pass test implementation success** through systematic research and context curation.

**Critical Understanding**: The executing AI agent only receives:

- Start by reading and understanding the prp concepts PRPs/README.md
- The PRP content you create
- Its training data knowledge
- Access to test codebase files (but needs guidance on which ones)

**Therefore**: Your research and context curation directly determines test implementation success. Incomplete context = test implementation failure.

## Research Process

> During the research process, create clear tasks and spawn as many agents and subagents as needed using the batch tools. The deeper research we do here the better the PRP will be. We optimize for chance of success and not for speed.

1. **Playwright/TypeScript Test Codebase Analysis in depth**
   - Create clear todos and spawn subagents to search the test codebase for similar test patterns/scenarios
   - Identify all the necessary Playwright test files to reference in the PRP
   - Note all existing Playwright/TypeScript testing conventions to follow
   - Check existing page object patterns, test utility patterns, and test data factory patterns
   - Analyze TypeScript interface definitions for test data and page object types
   - Check existing test patterns for E2E scenarios, visual regression, and API testing validation approaches
   - Examine test configuration files (playwright.config.ts, test environment setups)
   - Review existing test data management and mock strategies
   - Use the batch tools to spawn subagents to search the test codebase for similar features/patterns

2. **Playwright/TypeScript External Research at scale**
   - Create clear todos and spawn with instructions subagents to do deep research for similar test automation patterns online and include urls to documentation and examples
   - Playwright documentation (include specific URLs with version compatibility for TypeScript integration)
   - TypeScript testing documentation (include specific URLs for type definitions in tests)
   - Page Object Model best practices and TypeScript implementation examples
   - For critical pieces of documentation add a .md file to PRPs/ai_docs and reference it in the PRP with clear reasoning and instructions
   - Test automation examples (GitHub/StackOverflow/blogs) specific to Playwright/TypeScript
   - Best practices and common pitfalls found during research (Playwright timing issues, TypeScript test typing, CI/CD integration gotchas)
   - Visual regression testing patterns and tools integration
   - API testing and mocking strategies with TypeScript
   - Cross-browser testing considerations and configuration
   - Use the batch tools to spawn subagents to search for similar test automation patterns online and include urls to documentation and examples

3. **Application Under Test Analysis**
   - Research the target application's architecture and user flows
   - Identify key user journeys that need test coverage
   - Understand API endpoints and data models that tests will interact with
   - Document authentication flows and test user management requirements
   - Analyze responsive design requirements for cross-device testing

4. **User Clarification**
   - Ask for clarification if you need it
   - Clarify test scope and coverage requirements
   - Confirm target browsers and devices for testing
   - Validate test data requirements and environment access

## PRP Generation Process

### Step 1: Choose Template

Use `PRPs/templates/prp_playwright_ts.md` as your template structure - it contains all necessary sections and formatting specific to Playwright/TypeScript test development.

### Step 2: Context Completeness Validation

Before writing, apply the **"No Prior Knowledge" test** from the template:
_"If someone knew nothing about this Playwright/TypeScript test codebase, would they have everything needed to implement reliable tests successfully?"_

### Step 3: Research Integration

Transform your research findings into the template sections:

**Goal Section**: Use research to define specific, measurable test automation goal and concrete deliverable (test suite, page object, test data factory, etc.)
**Context Section**: Populate YAML structure with your research findings - specific Playwright/TypeScript URLs, test file patterns, testing gotchas
**Implementation Tasks**: Create dependency-ordered tasks using information-dense keywords from Playwright/TypeScript test codebase analysis
**Validation Gates**: Use Playwright/TypeScript-specific validation commands that you've verified work in this test environment

### Step 4: Playwright/TypeScript Information Density Standards

Ensure every reference is **specific and actionable** for Playwright test development:

- URLs include section anchors, not just domain names (Playwright docs, TypeScript testing guides)
- File references include specific Playwright patterns to follow (page objects, test structures, locator strategies)
- Task specifications include exact Playwright naming conventions and placement (PascalCase page classes, camelCase test methods, etc.)
- Validation commands are Playwright/TypeScript-specific and executable (playwright test, eslint with TypeScript rules, visual regression checks)
- Test data management patterns and TypeScript factory functions
- Cross-browser testing configuration and execution strategies

### Step 5: ULTRATHINK Before Writing

After research completion, create comprehensive PRP writing plan using TodoWrite tool:

- Plan how to structure each template section with your Playwright/TypeScript research findings
- Identify gaps that need additional Playwright/TypeScript test research
- Create systematic approach to filling template with actionable Playwright test context
- Consider test execution dependencies and page object hierarchies
- Plan test data management and environment configuration requirements

## Output

Save as: `PRPs/{feature-name}-prp.md`

## Playwright TypeScript PRP Quality Gates

### Context Completeness Check

- [ ] Passes "No Prior Knowledge" test from Playwright template
- [ ] All YAML references are specific and accessible (Playwright docs, test pattern examples)
- [ ] Implementation tasks include exact Playwright naming and placement guidance
- [ ] Validation commands are Playwright/TypeScript-specific and verified working
- [ ] TypeScript interface definitions for test data and page objects are specified
- [ ] Test environment configuration and setup requirements are documented

### Template Structure Compliance

- [ ] All required Playwright template sections completed
- [ ] Goal section has specific test automation goal, deliverable, success definition
- [ ] Implementation Tasks follow Playwright dependency ordering (test data → page objects → utilities → tests → visual tests)
- [ ] Final Validation Checklist includes Playwright/TypeScript-specific validation
- [ ] Cross-browser testing requirements and configuration specified

### Playwright/TypeScript Information Density Standards

- [ ] No generic references - all are specific to Playwright/TypeScript test patterns
- [ ] File patterns include specific Playwright examples to follow (page objects, test structures, locators)
- [ ] URLs include section anchors for exact Playwright/TypeScript guidance
- [ ] Task specifications use information-dense keywords from Playwright test codebase
- [ ] Test execution patterns specify browser configuration and parallel execution
- [ ] Test data factory patterns and mock strategies are comprehensive
- [ ] Visual regression testing approach is clearly defined (if applicable)
- [ ] API testing and mocking integration patterns specified

### Test Quality Assurance

- [ ] Test scenarios cover happy path, edge cases, and error conditions
- [ ] Page object patterns promote test maintainability and reusability
- [ ] Test data management ensures proper isolation and cleanup
- [ ] Cross-browser compatibility requirements are addressed
- [ ] Performance and reliability considerations are included
- [ ] CI/CD integration requirements are documented

## Success Metrics

**Confidence Score**: Rate 1-10 for one-pass Playwright test implementation success likelihood

**Quality Standard**: Minimum 8/10 required before PRP approval

**Validation**: The completed PRP should enable an AI agent unfamiliar with the Playwright/TypeScript test codebase to implement comprehensive, reliable test automation using only the PRP content and test codebase access, with full type safety and Playwright best practices.

## Playwright-Specific Success Criteria

- [ ] Tests execute reliably across target browsers without flakiness
- [ ] Page objects follow established patterns and provide good abstraction
- [ ] Test data management supports parallel execution and proper isolation
- [ ] Visual regression testing (if included) produces consistent results
- [ ] API testing and mocking integration works seamlessly
- [ ] Test execution time is optimized for CI/CD pipeline efficiency
- [ ] Test reports provide clear visibility into failures and coverage