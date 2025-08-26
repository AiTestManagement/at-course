// src/utils/constants.ts
export const CHECKBOX_SELECTORS = {
  form: '#checkboxes',
  allCheckboxes: '#checkboxes input[type="checkbox"]',
  firstCheckbox: '#checkboxes input[type="checkbox"]:nth-child(1)',
  secondCheckbox: '#checkboxes input[type="checkbox"]:nth-child(2)',
  pageHeading: 'h3'
} as const;

export const INITIAL_STATES = {
  checkbox1: false,  // Initially unchecked
  checkbox2: true    // Initially checked
} as const;

// Test data interfaces
export interface CheckboxState {
  index: number;
  checked: boolean;
  hasAttribute: boolean;
}

export interface CheckboxTestData {
  description: string;
  actions: Array<{ type: 'check' | 'uncheck', index: number }>;
  expectedStates: boolean[];
}