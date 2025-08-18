# JSON Forms Advanced Patterns for Test Suite Implementation

## Overview

This document provides comprehensive patterns and implementations for advanced JSON Forms usage in the Test Suite application. These patterns are specifically designed for complex form scenarios involving file selection, validation, state management, and schema evolution.

## Table of Contents

1. [Custom Renderers for File Selection](#custom-renderers-for-file-selection)
2. [Reference Validation Integration](#reference-validation-integration)
3. [Complex Form State Management](#complex-form-state-management)
4. [Schema Evolution Patterns](#schema-evolution-patterns)
5. [Performance Optimization](#performance-optimization)
6. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)

---

## Custom Renderers for File Selection

### 1. File Selection Renderer with Drag-and-Drop

```typescript
// Custom file selection renderer for test case file references
import React, { useCallback, useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { RankedTester, rankWith, schemaMatches } from '@jsonforms/core';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AttachFile,
  FolderOpen
} from '@mui/icons-material';

interface FileSelectionRendererProps {
  data: string[];
  handleChange: (path: string, value: any) => void;
  path: string;
  schema: any;
  uischema: any;
  errors: string;
}

const FileSelectionRenderer: React.FC<FileSelectionRendererProps> = ({
  data = [],
  handleChange,
  path,
  schema,
  uischema,
  errors
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFile = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      // Electron API call to check file existence
      const exists = await window.electronAPI.fileExists(filePath);
      if (!exists) {
        setValidationErrors(prev => [...prev, `File not found: ${filePath}`]);
        return false;
      }

      // Validate file type if specified in schema
      const allowedExtensions = schema.fileExtensions || ['.md', '.json', '.txt'];
      const extension = filePath.split('.').pop()?.toLowerCase();
      
      if (extension && !allowedExtensions.includes(`.${extension}`)) {
        setValidationErrors(prev => [...prev, `Invalid file type: ${extension}`]);
        return false;
      }

      return true;
    } catch (error) {
      setValidationErrors(prev => [...prev, `Validation error: ${error.message}`]);
      return false;
    }
  }, [schema]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setValidationErrors([]);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const filePaths = await Promise.all(
        files.map(async (file) => {
          const filePath = (file as any).path || file.name;
          const isValid = await validateFile(filePath);
          return isValid ? filePath : null;
        })
      );

      const validPaths = filePaths.filter(Boolean) as string[];
      const newData = [...data, ...validPaths];
      handleChange(path, newData);
    }
  }, [data, handleChange, path, validateFile]);

  const handleFileSelect = useCallback(async () => {
    try {
      const result = await window.electronAPI.selectFiles({
        multiple: true,
        filters: [
          { name: 'Test Files', extensions: ['md', 'json', 'txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.filePaths) {
        setValidationErrors([]);
        const validPaths = await Promise.all(
          result.filePaths.map(async (filePath) => {
            const isValid = await validateFile(filePath);
            return isValid ? filePath : null;
          })
        );

        const newValidPaths = validPaths.filter(Boolean) as string[];
        const newData = [...data, ...newValidPaths];
        handleChange(path, newData);
      }
    } catch (error) {
      setValidationErrors([`File selection error: ${error.message}`]);
    }
  }, [data, handleChange, path, validateFile]);

  const handleRemoveFile = useCallback((index: number) => {
    const newData = data.filter((_, i) => i !== index);
    handleChange(path, newData);
  }, [data, handleChange, path]);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {schema.title || 'File Selection'}
      </Typography>
      
      {/* Drag and Drop Zone */}
      <Paper
        sx={{
          p: 3,
          border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: dragActive ? '#f3f4f6' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          mb: 2
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            Drag files here or click to select
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports: .md, .json, .txt files
          </Typography>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FolderOpen />}
          onClick={handleFileSelect}
        >
          Browse Files
        </Button>
        <Button
          variant="outlined"
          startIcon={<AttachFile />}
          onClick={async () => {
            const filePath = await window.electronAPI.selectDirectory();
            if (filePath) {
              const isValid = await validateFile(filePath);
              if (isValid) {
                handleChange(path, [...data, filePath]);
              }
            }
          }}
        >
          Select Directory
        </Button>
      </Box>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* File List */}
      {data.length > 0 && (
        <Paper variant="outlined">
          <List dense>
            {data.map((filePath, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={filePath.split('/').pop() || filePath}
                  secondary={filePath}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Schema Errors */}
      {errors && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {errors}
        </Alert>
      )}
    </Box>
  );
};

// Tester function for file selection renderer
export const fileSelectionTester: RankedTester = rankWith(
  10,
  schemaMatches((schema) => 
    schema.type === 'array' && 
    schema.items?.type === 'string' && 
    schema.format === 'file-paths'
  )
);

// Export the renderer with JSON Forms props
export const FileSelectionRendererComponent = withJsonFormsControlProps(FileSelectionRenderer);
```

### 2. Test Case Reference Renderer

```typescript
// Specialized renderer for test case references with auto-completion
import React, { useState, useEffect, useCallback } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { RankedTester, rankWith, schemaMatches } from '@jsonforms/core';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  Alert
} from '@mui/material';

interface TestCaseReferenceRendererProps {
  data: string[];
  handleChange: (path: string, value: any) => void;
  path: string;
  schema: any;
  uischema: any;
  errors: string;
}

const TestCaseReferenceRenderer: React.FC<TestCaseReferenceRendererProps> = ({
  data = [],
  handleChange,
  path,
  schema,
  errors
}) => {
  const [availableTestCases, setAvailableTestCases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load available test cases
  useEffect(() => {
    const loadTestCases = async () => {
      setLoading(true);
      try {
        const testCases = await window.electronAPI.getTestCaseList();
        setAvailableTestCases(testCases.map(tc => tc.metadata.id));
      } catch (error) {
        setValidationErrors([`Failed to load test cases: ${error.message}`]);
      } finally {
        setLoading(false);
      }
    };

    loadTestCases();
  }, []);

  // Validate test case references
  const validateReferences = useCallback(async (references: string[]) => {
    const errors: string[] = [];
    
    for (const ref of references) {
      if (!availableTestCases.includes(ref)) {
        errors.push(`Test case not found: ${ref}`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [availableTestCases]);

  const handleChange_internal = useCallback(async (newValue: string[]) => {
    await validateReferences(newValue);
    handleChange(path, newValue);
  }, [handleChange, path, validateReferences]);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {schema.title || 'Test Case References'}
      </Typography>
      
      <Autocomplete
        multiple
        options={availableTestCases}
        value={data}
        onChange={(_, newValue) => handleChange_internal(newValue)}
        loading={loading}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              color={availableTestCases.includes(option) ? 'primary' : 'error'}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select test case references..."
            helperText={schema.description}
          />
        )}
        filterOptions={(options, { inputValue }) => {
          return options.filter(option =>
            option.toLowerCase().includes(inputValue.toLowerCase())
          );
        }}
      />

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 1 }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {errors && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {errors}
        </Alert>
      )}
    </Box>
  );
};

export const testCaseReferenceTester: RankedTester = rankWith(
  10,
  schemaMatches((schema) => 
    schema.type === 'array' && 
    schema.items?.type === 'string' && 
    schema.format === 'test-case-reference'
  )
);

export const TestCaseReferenceRendererComponent = withJsonFormsControlProps(TestCaseReferenceRenderer);
```

---

## Reference Validation Integration

### 1. Custom AJV Keywords for File Validation

```typescript
// Custom AJV keywords for test suite validation
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export const createTestSuiteValidator = () => {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);

  // File existence validation
  ajv.addKeyword({
    keyword: 'fileExists',
    type: 'string',
    schemaType: 'boolean',
    async: true,
    compile: (schemaVal: boolean) => {
      return async function validate(filePath: string) {
        if (!schemaVal) return true;
        
        try {
          const exists = await window.electronAPI.fileExists(filePath);
          if (!exists) {
            validate.errors = [{
              instancePath: '',
              schemaPath: '#/fileExists',
              keyword: 'fileExists',
              params: { filePath },
              message: `File does not exist: ${filePath}`
            }];
            return false;
          }
          return true;
        } catch (error) {
          validate.errors = [{
            instancePath: '',
            schemaPath: '#/fileExists',
            keyword: 'fileExists',
            params: { filePath },
            message: `File validation error: ${error.message}`
          }];
          return false;
        }
      };
    }
  });

  // Test case ID uniqueness validation
  ajv.addKeyword({
    keyword: 'uniqueTestCaseId',
    type: 'string',
    schemaType: 'boolean',
    async: true,
    compile: (schemaVal: boolean) => {
      return async function validate(testCaseId: string) {
        if (!schemaVal) return true;
        
        try {
          const exists = await window.electronAPI.testCaseExists(testCaseId);
          if (exists) {
            validate.errors = [{
              instancePath: '',
              schemaPath: '#/uniqueTestCaseId',
              keyword: 'uniqueTestCaseId',
              params: { testCaseId },
              message: `Test case ID already exists: ${testCaseId}`
            }];
            return false;
          }
          return true;
        } catch (error) {
          validate.errors = [{
            instancePath: '',
            schemaPath: '#/uniqueTestCaseId',
            keyword: 'uniqueTestCaseId',
            params: { testCaseId },
            message: `ID validation error: ${error.message}`
          }];
          return false;
        }
      };
    }
  });

  // Version compatibility validation
  ajv.addKeyword({
    keyword: 'compatibleVersion',
    type: 'string',
    schemaType: 'string',
    compile: (schemaVal: string) => {
      return function validate(version: string) {
        const minVersion = schemaVal;
        const versionParts = version.split('.').map(Number);
        const minVersionParts = minVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(versionParts.length, minVersionParts.length); i++) {
          const v = versionParts[i] || 0;
          const mv = minVersionParts[i] || 0;
          
          if (v > mv) return true;
          if (v < mv) {
            validate.errors = [{
              instancePath: '',
              schemaPath: '#/compatibleVersion',
              keyword: 'compatibleVersion',
              params: { version, minVersion },
              message: `Version ${version} is not compatible with minimum required version ${minVersion}`
            }];
            return false;
          }
        }
        return true;
      };
    }
  });

  return ajv;
};
```

### 2. Real-time Cross-field Validation

```typescript
// Real-time validation hook for test case forms
import { useState, useEffect, useCallback } from 'react';
import { TestCase } from '../types/test-case';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export const useTestCaseValidation = (testCase: TestCase | null) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    warnings: {}
  });

  const validateField = useCallback(async (
    fieldPath: string,
    value: any,
    fullData: TestCase
  ): Promise<{ errors: string[]; warnings: string[] }> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (fieldPath) {
      case 'metadata.id':
        // Validate test case ID format and uniqueness
        if (!/^[A-Z]+-\d+$/.test(value)) {
          errors.push('Test case ID must follow pattern: PREFIX-NUMBER (e.g., AUTH-001)');
        }
        
        try {
          const exists = await window.electronAPI.testCaseExists(value);
          if (exists && fullData.metadata.id !== value) {
            errors.push('Test case ID already exists');
          }
        } catch (error) {
          warnings.push('Could not verify ID uniqueness');
        }
        break;

      case 'metadata.assignee':
        // Validate email format and team membership
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push('Invalid email format');
        }
        
        try {
          const isTeamMember = await window.electronAPI.validateTeamMember(value);
          if (!isTeamMember) {
            warnings.push('Assignee is not a recognized team member');
          }
        } catch (error) {
          warnings.push('Could not verify team membership');
        }
        break;

      case 'content.prerequisites':
        // Validate prerequisite test case references
        if (Array.isArray(value)) {
          for (const prereq of value) {
            if (prereq.startsWith('TEST-')) {
              try {
                const exists = await window.electronAPI.testCaseExists(prereq);
                if (!exists) {
                  errors.push(`Prerequisite test case not found: ${prereq}`);
                }
              } catch (error) {
                warnings.push(`Could not verify prerequisite: ${prereq}`);
              }
            }
          }
        }
        break;

      case 'metadata.library_dependencies':
        // Validate library dependencies
        if (Array.isArray(value)) {
          for (const dep of value) {
            try {
              const isValid = await window.electronAPI.validateDependency(dep);
              if (!isValid) {
                warnings.push(`Library dependency may not be available: ${dep}`);
              }
            } catch (error) {
              warnings.push(`Could not validate dependency: ${dep}`);
            }
          }
        }
        break;
    }

    return { errors, warnings };
  }, []);

  const validateTestCase = useCallback(async (testCase: TestCase) => {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // Validate all fields
    const validationPromises = [
      { path: 'metadata.id', value: testCase.metadata.id },
      { path: 'metadata.assignee', value: testCase.metadata.assignee },
      { path: 'content.prerequisites', value: testCase.content.prerequisites },
      { path: 'metadata.library_dependencies', value: testCase.metadata.library_dependencies }
    ].map(async ({ path, value }) => {
      const result = await validateField(path, value, testCase);
      if (result.errors.length > 0) {
        errors[path] = result.errors;
      }
      if (result.warnings.length > 0) {
        warnings[path] = result.warnings;
      }
    });

    await Promise.all(validationPromises);

    // Cross-field validation
    if (testCase.metadata.category === 'integration' && 
        testCase.content.prerequisites.length === 0) {
      warnings['content.prerequisites'] = [
        ...(warnings['content.prerequisites'] || []),
        'Integration tests typically require prerequisites'
      ];
    }

    const isValid = Object.keys(errors).length === 0;
    setValidation({ isValid, errors, warnings });
  }, [validateField]);

  useEffect(() => {
    if (testCase) {
      validateTestCase(testCase);
    }
  }, [testCase, validateTestCase]);

  return validation;
};
```

---

## Complex Form State Management

### 1. Test Case Context Provider

```typescript
// Context provider for complex test case state management
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { TestCase } from '../types/test-case';

interface TestCaseState {
  testCases: TestCase[];
  currentTestCase: TestCase | null;
  isDirty: boolean;
  history: TestCase[];
  historyIndex: number;
  validationState: Record<string, any>;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
}

type TestCaseAction = 
  | { type: 'LOAD_TEST_CASES'; payload: TestCase[] }
  | { type: 'SELECT_TEST_CASE'; payload: TestCase }
  | { type: 'UPDATE_CURRENT_TEST_CASE'; payload: Partial<TestCase> }
  | { type: 'SAVE_TEST_CASE'; payload: TestCase }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_VALIDATION_STATE'; payload: Record<string, any> }
  | { type: 'TOGGLE_AUTO_SAVE' }
  | { type: 'MARK_CLEAN' };

const initialState: TestCaseState = {
  testCases: [],
  currentTestCase: null,
  isDirty: false,
  history: [],
  historyIndex: -1,
  validationState: {},
  autoSaveEnabled: true,
  lastSaved: null
};

const testCaseReducer = (state: TestCaseState, action: TestCaseAction): TestCaseState => {
  switch (action.type) {
    case 'LOAD_TEST_CASES':
      return {
        ...state,
        testCases: action.payload
      };

    case 'SELECT_TEST_CASE':
      return {
        ...state,
        currentTestCase: action.payload,
        history: [action.payload],
        historyIndex: 0,
        isDirty: false
      };

    case 'UPDATE_CURRENT_TEST_CASE':
      if (!state.currentTestCase) return state;
      
      const updatedTestCase = {
        ...state.currentTestCase,
        ...action.payload,
        metadata: {
          ...state.currentTestCase.metadata,
          ...(action.payload.metadata || {}),
          updated: new Date().toISOString().split('T')[0]
        }
      };

      // Add to history for undo/redo
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(updatedTestCase);

      return {
        ...state,
        currentTestCase: updatedTestCase,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true
      };

    case 'SAVE_TEST_CASE':
      const updatedTestCases = state.testCases.map(tc =>
        tc.metadata.id === action.payload.metadata.id ? action.payload : tc
      );

      if (!state.testCases.find(tc => tc.metadata.id === action.payload.metadata.id)) {
        updatedTestCases.push(action.payload);
      }

      return {
        ...state,
        testCases: updatedTestCases,
        currentTestCase: action.payload,
        isDirty: false,
        lastSaved: new Date()
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          currentTestCase: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          isDirty: true
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          currentTestCase: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          isDirty: true
        };
      }
      return state;

    case 'SET_VALIDATION_STATE':
      return {
        ...state,
        validationState: action.payload
      };

    case 'TOGGLE_AUTO_SAVE':
      return {
        ...state,
        autoSaveEnabled: !state.autoSaveEnabled
      };

    case 'MARK_CLEAN':
      return {
        ...state,
        isDirty: false
      };

    default:
      return state;
  }
};

interface TestCaseContextType {
  state: TestCaseState;
  actions: {
    loadTestCases: (testCases: TestCase[]) => void;
    selectTestCase: (testCase: TestCase) => void;
    updateCurrentTestCase: (updates: Partial<TestCase>) => void;
    saveTestCase: () => Promise<void>;
    undo: () => void;
    redo: () => void;
    setValidationState: (validation: Record<string, any>) => void;
    toggleAutoSave: () => void;
  };
}

const TestCaseContext = createContext<TestCaseContextType | null>(null);

export const TestCaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(testCaseReducer, initialState);

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSaveEnabled && state.isDirty && state.currentTestCase) {
      const autoSaveTimer = setTimeout(async () => {
        try {
          await window.electronAPI.saveTestCase(state.currentTestCase);
          dispatch({ type: 'SAVE_TEST_CASE', payload: state.currentTestCase });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [state.isDirty, state.currentTestCase, state.autoSaveEnabled]);

  const actions = {
    loadTestCases: useCallback((testCases: TestCase[]) => {
      dispatch({ type: 'LOAD_TEST_CASES', payload: testCases });
    }, []),

    selectTestCase: useCallback((testCase: TestCase) => {
      dispatch({ type: 'SELECT_TEST_CASE', payload: testCase });
    }, []),

    updateCurrentTestCase: useCallback((updates: Partial<TestCase>) => {
      dispatch({ type: 'UPDATE_CURRENT_TEST_CASE', payload: updates });
    }, []),

    saveTestCase: useCallback(async () => {
      if (state.currentTestCase) {
        try {
          await window.electronAPI.saveTestCase(state.currentTestCase);
          dispatch({ type: 'SAVE_TEST_CASE', payload: state.currentTestCase });
        } catch (error) {
          throw new Error(`Save failed: ${error.message}`);
        }
      }
    }, [state.currentTestCase]),

    undo: useCallback(() => {
      dispatch({ type: 'UNDO' });
    }, []),

    redo: useCallback(() => {
      dispatch({ type: 'REDO' });
    }, []),

    setValidationState: useCallback((validation: Record<string, any>) => {
      dispatch({ type: 'SET_VALIDATION_STATE', payload: validation });
    }, []),

    toggleAutoSave: useCallback(() => {
      dispatch({ type: 'TOGGLE_AUTO_SAVE' });
    }, [])
  };

  return (
    <TestCaseContext.Provider value={{ state, actions }}>
      {children}
    </TestCaseContext.Provider>
  );
};

export const useTestCaseContext = () => {
  const context = useContext(TestCaseContext);
  if (!context) {
    throw new Error('useTestCaseContext must be used within a TestCaseProvider');
  }
  return context;
};
```

### 2. Performance-Optimized Form Component

```typescript
// Optimized test case form with virtualization and memoization
import React, { memo, useMemo, useCallback } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { useTestCaseContext } from '../contexts/TestCaseContext';
import { useTestCaseValidation } from '../hooks/useTestCaseValidation';

// Memoized UI Schema generator
const generateUISchema = memo((schemaType: string) => {
  switch (schemaType) {
    case 'comprehensive':
      return {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Group',
            label: 'Test Case Metadata',
            elements: [
              {
                type: 'HorizontalLayout',
                elements: [
                  { type: 'Control', scope: '#/properties/metadata/properties/id' },
                  { type: 'Control', scope: '#/properties/metadata/properties/title' }
                ]
              },
              // ... other metadata fields
            ]
          },
          {
            type: 'Group',
            label: 'Test Case Content',
            elements: [
              { type: 'Control', scope: '#/properties/content/properties/objective' },
              // ... other content fields
            ]
          }
        ]
      };
    
    case 'quick':
      return {
        type: 'VerticalLayout',
        elements: [
          { type: 'Control', scope: '#/properties/metadata/properties/id' },
          { type: 'Control', scope: '#/properties/metadata/properties/title' },
          { type: 'Control', scope: '#/properties/content/properties/objective' }
        ]
      };
    
    default:
      return generateUISchema('comprehensive');
  }
});

interface OptimizedTestCaseFormProps {
  mode: 'comprehensive' | 'quick';
  schema: any;
}

const OptimizedTestCaseForm: React.FC<OptimizedTestCaseFormProps> = ({ mode, schema }) => {
  const { state, actions } = useTestCaseContext();
  const validation = useTestCaseValidation(state.currentTestCase);

  // Memoized UI schema
  const uiSchema = useMemo(() => generateUISchema(mode), [mode]);

  // Memoized renderers with custom components
  const customRenderers = useMemo(() => [
    ...materialRenderers,
    // Add custom renderers here
  ], []);

  // Optimized change handler with debouncing
  const handleFormChange = useCallback(({ data, errors }: { data: any; errors: any }) => {
    actions.updateCurrentTestCase(data);
    actions.setValidationState({ errors, validation });
  }, [actions]);

  // Render nothing if no test case is selected
  if (!state.currentTestCase) {
    return null;
  }

  return (
    <JsonForms
      schema={schema}
      uischema={uiSchema}
      data={state.currentTestCase}
      renderers={customRenderers}
      cells={materialCells}
      onChange={handleFormChange}
      validationMode="ValidateAndShow"
    />
  );
};

export default memo(OptimizedTestCaseForm);
```

---

## Schema Evolution Patterns

### 1. Schema Versioning Strategy

```typescript
// Schema versioning and migration system
interface SchemaVersion {
  version: string;
  schema: any;
  uiSchema?: any;
  migrations?: {
    from: string;
    to: string;
    migrate: (data: any) => any;
  }[];
}

export class TestCaseSchemaManager {
  private schemas: Map<string, SchemaVersion> = new Map();
  private currentVersion = '1.2.0';

  constructor() {
    this.initializeSchemas();
  }

  private initializeSchemas() {
    // Version 1.0.0 - Initial schema
    this.schemas.set('1.0.0', {
      version: '1.0.0',
      schema: {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              category: { type: 'string', enum: ['core', 'module'] }
            }
          }
        }
      }
    });

    // Version 1.1.0 - Added new categories and priority
    this.schemas.set('1.1.0', {
      version: '1.1.0',
      schema: {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              category: { 
                type: 'string', 
                enum: ['core', 'module', 'integration', 'performance'] 
              },
              priority: { 
                type: 'string', 
                enum: ['low', 'medium', 'high'] 
              }
            }
          }
        }
      },
      migrations: [{
        from: '1.0.0',
        to: '1.1.0',
        migrate: (data: any) => ({
          ...data,
          metadata: {
            ...data.metadata,
            priority: 'medium' // Default priority for migrated data
          }
        })
      }]
    });

    // Version 1.2.0 - Current version with security category and critical priority
    this.schemas.set('1.2.0', {
      version: '1.2.0',
      schema: {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            properties: {
              id: { type: 'string', pattern: '^[A-Z]+-\\d+$' },
              title: { type: 'string', minLength: 5, maxLength: 100 },
              category: { 
                type: 'string', 
                enum: ['core', 'module', 'integration', 'performance', 'security'] 
              },
              priority: { 
                type: 'string', 
                enum: ['low', 'medium', 'high', 'critical'] 
              },
              version: { type: 'string', pattern: '^\\d+(\\.\\d+){0,2}$' }
            }
          },
          content: {
            type: 'object',
            properties: {
              objective: { type: 'string', minLength: 10 },
              execution: { type: 'array', items: { type: 'string' } },
              verification: { type: 'array', items: { type: 'string' } },
              expected_results: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      migrations: [{
        from: '1.1.0',
        to: '1.2.0',
        migrate: (data: any) => ({
          ...data,
          metadata: {
            ...data.metadata,
            version: '1.0' // Add version field for migrated data
          }
        })
      }]
    });
  }

  getCurrentSchema(): SchemaVersion {
    return this.schemas.get(this.currentVersion)!;
  }

  getSchema(version: string): SchemaVersion | undefined {
    return this.schemas.get(version);
  }

  migrateData(data: any, fromVersion: string, toVersion?: string): any {
    const targetVersion = toVersion || this.currentVersion;
    
    if (fromVersion === targetVersion) {
      return data;
    }

    // Find migration path
    const migrationPath = this.findMigrationPath(fromVersion, targetVersion);
    
    let migratedData = data;
    for (const step of migrationPath) {
      const schema = this.schemas.get(step.to);
      if (schema?.migrations) {
        const migration = schema.migrations.find(m => m.from === step.from);
        if (migration) {
          migratedData = migration.migrate(migratedData);
        }
      }
    }

    return migratedData;
  }

  private findMigrationPath(from: string, to: string): { from: string; to: string }[] {
    // Simple sequential migration path
    const versions = Array.from(this.schemas.keys()).sort((a, b) => 
      this.compareVersions(a, b)
    );
    
    const fromIndex = versions.indexOf(from);
    const toIndex = versions.indexOf(to);
    
    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return [];
    }

    const path: { from: string; to: string }[] = [];
    for (let i = fromIndex; i < toIndex; i++) {
      path.push({ from: versions[i], to: versions[i + 1] });
    }

    return path;
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }
    
    return 0;
  }

  validateBackwardCompatibility(newSchema: any, oldVersion: string): string[] {
    const issues: string[] = [];
    const oldSchema = this.schemas.get(oldVersion);
    
    if (!oldSchema) {
      issues.push(`Old version ${oldVersion} not found`);
      return issues;
    }

    // Check for removed required fields
    const oldRequired = oldSchema.schema.properties?.metadata?.required || [];
    const newRequired = newSchema.properties?.metadata?.required || [];
    
    for (const field of oldRequired) {
      if (!newRequired.includes(field)) {
        issues.push(`Required field removed: ${field}`);
      }
    }

    // Check for changed field types
    this.checkFieldTypeChanges(
      oldSchema.schema.properties,
      newSchema.properties,
      '',
      issues
    );

    return issues;
  }

  private checkFieldTypeChanges(
    oldProps: any,
    newProps: any,
    path: string,
    issues: string[]
  ) {
    for (const [key, oldValue] of Object.entries(oldProps || {})) {
      const newValue = newProps?.[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!newValue) {
        issues.push(`Field removed: ${currentPath}`);
        continue;
      }

      if (typeof oldValue === 'object' && oldValue.type !== newValue.type) {
        issues.push(`Type changed for field ${currentPath}: ${oldValue.type} -> ${newValue.type}`);
      }

      if (oldValue.properties && newValue.properties) {
        this.checkFieldTypeChanges(oldValue.properties, newValue.properties, currentPath, issues);
      }
    }
  }
}

// Usage example
export const schemaManager = new TestCaseSchemaManager();
```

### 2. Migration Helper Component

```typescript
// Component for handling schema migrations
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  LinearProgress
} from '@mui/material';
import { schemaManager } from './TestCaseSchemaManager';

interface SchemaMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  testCases: any[];
  onMigrationComplete: (migratedTestCases: any[]) => void;
}

const SchemaMigrationDialog: React.FC<SchemaMigrationDialogProps> = ({
  open,
  onClose,
  testCases,
  onMigrationComplete
}) => {
  const [migrationStatus, setMigrationStatus] = useState<'analyzing' | 'ready' | 'migrating' | 'complete'>('analyzing');
  const [migrationPlan, setMigrationPlan] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      analyzeMigration();
    }
  }, [open]);

  const analyzeMigration = async () => {
    setMigrationStatus('analyzing');
    
    const plan: any[] = [];
    const compatibilityIssues: string[] = [];
    
    for (const testCase of testCases) {
      const currentVersion = testCase.metadata?.version || '1.0.0';
      const targetVersion = schemaManager.getCurrentSchema().version;
      
      if (currentVersion !== targetVersion) {
        plan.push({
          id: testCase.metadata.id,
          from: currentVersion,
          to: targetVersion,
          testCase
        });

        // Check for backward compatibility issues
        const issues = schemaManager.validateBackwardCompatibility(
          schemaManager.getCurrentSchema().schema,
          currentVersion
        );
        compatibilityIssues.push(...issues);
      }
    }

    setMigrationPlan(plan);
    setIssues(compatibilityIssues);
    setMigrationStatus(plan.length > 0 ? 'ready' : 'complete');
  };

  const performMigration = async () => {
    setMigrationStatus('migrating');
    setProgress(0);

    const migratedTestCases: any[] = [];
    
    for (let i = 0; i < migrationPlan.length; i++) {
      const { testCase, from, to } = migrationPlan[i];
      
      try {
        const migratedData = schemaManager.migrateData(testCase, from, to);
        migratedTestCases.push(migratedData);
      } catch (error) {
        console.error(`Migration failed for ${testCase.metadata.id}:`, error);
        migratedTestCases.push(testCase); // Keep original if migration fails
      }
      
      setProgress(((i + 1) / migrationPlan.length) * 100);
    }

    // Add non-migrated test cases
    for (const testCase of testCases) {
      if (!migrationPlan.find(p => p.id === testCase.metadata.id)) {
        migratedTestCases.push(testCase);
      }
    }

    setMigrationStatus('complete');
    onMigrationComplete(migratedTestCases);
  };

  const renderContent = () => {
    switch (migrationStatus) {
      case 'analyzing':
        return (
          <>
            <Typography>Analyzing test cases for migration...</Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </>
        );

      case 'ready':
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Migration Required
            </Typography>
            <Typography paragraph>
              {migrationPlan.length} test case(s) need to be migrated to the current schema version.
            </Typography>

            {issues.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Compatibility Issues:</Typography>
                <ul>
                  {issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Migration Plan:
            </Typography>
            <List dense>
              {migrationPlan.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.id}
                    secondary={`${item.from} → ${item.to}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        );

      case 'migrating':
        return (
          <>
            <Typography>Migrating test cases...</Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {Math.round(progress)}% complete
            </Typography>
          </>
        );

      case 'complete':
        return (
          <Alert severity="success">
            Migration completed successfully!
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Schema Migration</DialogTitle>
      <DialogContent>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        {migrationStatus === 'ready' && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              onClick={performMigration} 
              variant="contained"
              disabled={issues.length > 0}
            >
              Start Migration
            </Button>
          </>
        )}
        {migrationStatus === 'complete' && (
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SchemaMigrationDialog;
```

---

## Performance Optimization

### 1. Virtualized Form Rendering

```typescript
// Virtualized rendering for large forms
import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box } from '@mui/material';

interface VirtualizedFormFieldProps {
  index: number;
  style: any;
  data: {
    fields: any[];
    renderField: (field: any, index: number) => React.ReactNode;
  };
}

const VirtualizedFormField: React.FC<VirtualizedFormFieldProps> = memo(({ index, style, data }) => {
  const { fields, renderField } = data;
  const field = fields[index];

  return (
    <div style={style}>
      <Box sx={{ p: 1 }}>
        {renderField(field, index)}
      </Box>
    </div>
  );
});

interface VirtualizedFormProps {
  fields: any[];
  renderField: (field: any, index: number) => React.ReactNode;
  height: number;
  itemHeight: number;
}

const VirtualizedForm: React.FC<VirtualizedFormProps> = ({
  fields,
  renderField,
  height,
  itemHeight
}) => {
  const itemData = useMemo(() => ({
    fields,
    renderField
  }), [fields, renderField]);

  return (
    <List
      height={height}
      itemCount={fields.length}
      itemSize={itemHeight}
      itemData={itemData}
    >
      {VirtualizedFormField}
    </List>
  );
};

export default memo(VirtualizedForm);
```

### 2. Form Field Memoization

```typescript
// Optimized form field with intelligent memoization
import React, { memo, useCallback, useMemo } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { TextField } from '@mui/material';

interface OptimizedTextFieldProps {
  data: any;
  handleChange: (path: string, value: any) => void;
  path: string;
  schema: any;
  uischema: any;
  errors: string;
}

const OptimizedTextField: React.FC<OptimizedTextFieldProps> = memo(({
  data,
  handleChange,
  path,
  schema,
  uischema,
  errors
}) => {
  const handleChange_internal = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(path, event.target.value);
  }, [handleChange, path]);

  const fieldProps = useMemo(() => ({
    label: schema.title || uischema.label,
    helperText: schema.description,
    error: !!errors,
    multiline: schema.format === 'textarea' || uischema.options?.multi,
    rows: uischema.options?.multi ? 4 : 1,
    required: schema.required?.includes(path.split('/').pop()),
    placeholder: schema.examples?.[0] || uischema.options?.placeholder
  }), [schema, uischema, errors, path]);

  return (
    <TextField
      {...fieldProps}
      value={data || ''}
      onChange={handleChange_internal}
      fullWidth
      variant="outlined"
      size="small"
    />
  );
}, (prevProps, nextProps) => {
  // Custom equality check for better performance
  return (
    prevProps.data === nextProps.data &&
    prevProps.errors === nextProps.errors &&
    prevProps.path === nextProps.path &&
    JSON.stringify(prevProps.schema) === JSON.stringify(nextProps.schema) &&
    JSON.stringify(prevProps.uischema) === JSON.stringify(nextProps.uischema)
  );
});

export const OptimizedTextFieldComponent = withJsonFormsControlProps(OptimizedTextField);
```

---

## Common Pitfalls and Solutions

### 1. Memory Leaks in Form Validation

**Problem**: Async validation creating memory leaks with unmounted components.

**Solution**:
```typescript
// Use AbortController for cancellable async validation
const useAsyncValidation = (value: any, validator: (value: any) => Promise<boolean>) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous validation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const validateAsync = async () => {
      try {
        const result = await validator(value);
        if (!abortController.signal.aborted) {
          setIsValid(result);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setIsValid(false);
        }
      }
    };

    validateAsync();

    return () => {
      abortController.abort();
    };
  }, [value, validator]);

  return isValid;
};
```

### 2. Form State Synchronization Issues

**Problem**: Form state getting out of sync with external data changes.

**Solution**:
```typescript
// Use version-based state synchronization
const useVersionedFormState = (externalData: any) => {
  const [formData, setFormData] = useState(externalData);
  const [version, setVersion] = useState(0);
  const externalVersionRef = useRef(0);

  useEffect(() => {
    // Check if external data has changed
    const newExternalVersion = externalVersionRef.current + 1;
    externalVersionRef.current = newExternalVersion;
    
    if (JSON.stringify(externalData) !== JSON.stringify(formData)) {
      setFormData(externalData);
      setVersion(newExternalVersion);
    }
  }, [externalData, formData]);

  const updateFormData = useCallback((newData: any) => {
    setFormData(newData);
    setVersion(prev => prev + 1);
  }, []);

  return {
    formData,
    updateFormData,
    version,
    isStale: version < externalVersionRef.current
  };
};
```

### 3. Schema Validation Performance

**Problem**: Slow schema validation on large forms.

**Solution**:
```typescript
// Implement debounced validation with field-level caching
const useDebouncedValidation = (data: any, schema: any, delay = 300) => {
  const [validationResults, setValidationResults] = useState<any>({});
  const [isValidating, setIsValidating] = useState(false);
  const validationCache = useRef(new Map());

  const debouncedValidate = useMemo(
    () => debounce(async (dataToValidate: any) => {
      setIsValidating(true);
      
      try {
        // Check cache first
        const cacheKey = JSON.stringify(dataToValidate);
        if (validationCache.current.has(cacheKey)) {
          setValidationResults(validationCache.current.get(cacheKey));
          return;
        }

        // Perform validation
        const validator = createTestSuiteValidator();
        const isValid = await validator.validate(schema, dataToValidate);
        const results = {
          isValid,
          errors: validator.errors || []
        };

        // Cache results
        validationCache.current.set(cacheKey, results);
        setValidationResults(results);
      } catch (error) {
        setValidationResults({
          isValid: false,
          errors: [{ message: `Validation error: ${error.message}` }]
        });
      } finally {
        setIsValidating(false);
      }
    }, delay),
    [schema, delay]
  );

  useEffect(() => {
    if (data) {
      debouncedValidate(data);
    }
  }, [data, debouncedValidate]);

  return { validationResults, isValidating };
};
```

---

## Best Practices for Test Suite Implementation

### 1. Schema Design Guidelines

- **Use clear, descriptive field names** that match domain terminology
- **Implement progressive validation** - validate as the user types
- **Design for extensibility** - use `additionalProperties` strategically
- **Provide meaningful error messages** - include context and suggestions
- **Use enums for controlled vocabularies** - maintain consistency

### 2. Performance Considerations

- **Implement field-level validation caching** for expensive operations
- **Use React.memo and useMemo** strategically for complex renderers
- **Debounce validation calls** to prevent excessive API requests
- **Virtualize large forms** with react-window
- **Lazy load validation schemas** for better initial load times

### 3. User Experience Guidelines

- **Provide immediate feedback** on validation errors
- **Implement auto-save functionality** with conflict resolution
- **Support undo/redo operations** for complex forms
- **Show progress indicators** for long-running validations
- **Maintain form state** across navigation and sessions

### 4. Testing Strategies

```typescript
// Example test for custom renderer
import { render, screen, fireEvent } from '@testing-library/react';
import { FileSelectionRenderer } from './FileSelectionRenderer';

describe('FileSelectionRenderer', () => {
  it('should validate file existence on drop', async () => {
    const mockHandleChange = jest.fn();
    const mockFileExists = jest.fn().mockResolvedValue(true);
    
    // Mock electron API
    (window as any).electronAPI = {
      fileExists: mockFileExists
    };

    render(
      <FileSelectionRenderer
        data={[]}
        handleChange={mockHandleChange}
        path="test.files"
        schema={{ format: 'file-paths', fileExtensions: ['.md'] }}
        uischema={{}}
        errors=""
      />
    );

    // Simulate file drop
    const dropZone = screen.getByText(/drag files here/i).closest('div');
    const file = new File(['content'], 'test.md', { type: 'text/markdown' });
    Object.defineProperty(file, 'path', { value: '/path/to/test.md' });

    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(mockFileExists).toHaveBeenCalledWith('/path/to/test.md');
      expect(mockHandleChange).toHaveBeenCalledWith('test.files', ['/path/to/test.md']);
    });
  });
});
```

This comprehensive documentation provides the foundation for implementing advanced JSON Forms patterns in the Test Suite application, with a focus on file selection, validation, state management, and schema evolution while maintaining high performance and excellent user experience.