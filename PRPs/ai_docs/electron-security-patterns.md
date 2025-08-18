# Electron Security Patterns and File Operations for GTMS Test Suite

## Overview

This document provides comprehensive security patterns and file operation guidelines specifically for the GTMS Test Suite Electron application. It covers IPC security, file system operations, and React integration patterns while highlighting common vulnerabilities and their prevention.

## Table of Contents

1. [IPC Security Patterns](#ipc-security-patterns)
2. [File System Security](#file-system-security)
3. [Advanced File Operations](#advanced-file-operations)
4. [React Integration Patterns](#react-integration-patterns)
5. [Security Implementation Examples](#security-implementation-examples)
6. [Common Vulnerabilities & Prevention](#common-vulnerabilities--prevention)

## IPC Security Patterns

### Context Isolation Best Practices

**Core Principle**: Never expose Node.js APIs directly to the renderer process.

```typescript
// ✅ SECURE: Preload script with context isolation
import { contextBridge, ipcRenderer } from 'electron';

// Expose a limited, validated API
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations with validation
  saveTestCase: (testCase: TestCase, filePath: string): Promise<boolean> => {
    // Validate inputs before sending to main process
    if (!testCase || typeof filePath !== 'string') {
      return Promise.reject(new Error('Invalid parameters'));
    }
    return ipcRenderer.invoke('save-test-case', testCase, filePath);
  },
  
  // Directory operations with constraints
  openDirectory: (): Promise<string | null> => 
    ipcRenderer.invoke('open-directory'),
    
  // Event listeners with cleanup
  onProjectSelected: (callback: (projectPath: string) => void) => {
    const wrappedCallback = (event: any, projectPath: string) => {
      // Validate event data
      if (typeof projectPath === 'string') {
        callback(projectPath);
      }
    };
    ipcRenderer.on('project-selected', wrappedCallback);
    
    // Return cleanup function
    return () => ipcRenderer.removeListener('project-selected', wrappedCallback);
  }
});

// ❌ INSECURE: Never do this
contextBridge.exposeInMainWorld('nodeAPI', {
  fs: require('fs'),           // Direct Node.js API exposure
  process: process,            // Process access
  require: require            // Arbitrary module loading
});
```

### Secure Preload Script Patterns

```typescript
// Enhanced validation and error handling
import { contextBridge, ipcRenderer } from 'electron';
import { TestCase } from '../types/test-case';

// Input validation helpers
const validateFilePath = (path: string): boolean => {
  if (typeof path !== 'string' || path.length === 0) return false;
  
  // Prevent directory traversal
  if (path.includes('..') || path.includes('~')) return false;
  
  // Ensure path ends with .md for test cases
  if (!path.endsWith('.md')) return false;
  
  return true;
};

const validateTestCase = (testCase: any): testCase is TestCase => {
  return testCase &&
         typeof testCase === 'object' &&
         testCase.metadata &&
         typeof testCase.metadata.id === 'string' &&
         typeof testCase.metadata.title === 'string';
};

// Secure API exposure
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations with comprehensive validation
  saveTestCase: async (testCase: TestCase, filePath: string): Promise<boolean> => {
    try {
      if (!validateTestCase(testCase)) {
        throw new Error('Invalid test case data');
      }
      
      if (!validateFilePath(filePath)) {
        throw new Error('Invalid file path');
      }
      
      return await ipcRenderer.invoke('save-test-case', testCase, filePath);
    } catch (error) {
      console.error('Save test case error:', error);
      return false;
    }
  },
  
  loadTestCase: async (filePath: string): Promise<TestCase | null> => {
    try {
      if (!validateFilePath(filePath)) {
        throw new Error('Invalid file path');
      }
      
      return await ipcRenderer.invoke('load-test-case', filePath);
    } catch (error) {
      console.error('Load test case error:', error);
      return null;
    }
  },
  
  // Directory operations with timeout
  openDirectory: (): Promise<string | null> => {
    return Promise.race([
      ipcRenderer.invoke('open-directory'),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Directory operation timeout')), 30000)
      )
    ]);
  }
});
```

### Input Validation Strategies

```typescript
// Main process validation patterns
import * as path from 'path';
import * as fs from 'fs/promises';

// Path sanitization utility
class PathValidator {
  private static readonly ALLOWED_EXTENSIONS = ['.md', '.json'];
  private static readonly BLOCKED_PATTERNS = ['..', '~', '<', '>', '|', '&'];
  
  static sanitizePath(inputPath: string, baseDir: string): string | null {
    try {
      // Normalize and resolve path
      const normalizedPath = path.normalize(inputPath);
      const resolvedPath = path.resolve(baseDir, normalizedPath);
      
      // Ensure path is within base directory
      if (!resolvedPath.startsWith(path.resolve(baseDir))) {
        throw new Error('Path outside allowed directory');
      }
      
      // Check for blocked patterns
      if (this.BLOCKED_PATTERNS.some(pattern => 
          normalizedPath.includes(pattern))) {
        throw new Error('Path contains blocked characters');
      }
      
      // Validate extension
      const ext = path.extname(resolvedPath);
      if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error('Invalid file extension');
      }
      
      return resolvedPath;
    } catch (error) {
      console.error('Path validation failed:', error);
      return null;
    }
  }
  
  static async validateFileAccess(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
      const stats = await fs.stat(filePath);
      
      // Prevent directory access
      if (stats.isDirectory()) return false;
      
      // File size limits (10MB max for test cases)
      if (stats.size > 10 * 1024 * 1024) return false;
      
      return true;
    } catch {
      return false;
    }
  }
}

// IPC handler with validation
ipcMain.handle('save-test-case', async (event, testCase: TestCase, filePath: string): Promise<boolean> => {
  try {
    // Validate and sanitize file path
    const projectDir = getProjectDirectory(); // Get current project directory
    const sanitizedPath = PathValidator.sanitizePath(filePath, projectDir);
    
    if (!sanitizedPath) {
      throw new Error('Invalid file path');
    }
    
    // Validate test case structure
    if (!validateTestCaseStructure(testCase)) {
      throw new Error('Invalid test case structure');
    }
    
    // Generate markdown with sanitization
    const markdown = generateSecureMarkdown(testCase);
    
    // Atomic file write
    await writeFileAtomic(sanitizedPath, markdown);
    
    return true;
  } catch (error) {
    console.error('Save test case error:', error);
    return false;
  }
});
```

## File System Security

### Path Validation and Sanitization

```typescript
// Comprehensive path security utilities
class SecureFileSystem {
  private static readonly MAX_PATH_LENGTH = 260; // Windows limitation
  private static readonly RESERVED_NAMES = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  static validateFileName(fileName: string): boolean {
    // Length check
    if (fileName.length === 0 || fileName.length > 255) return false;
    
    // Reserved names check (Windows)
    const nameWithoutExt = path.parse(fileName).name.toUpperCase();
    if (this.RESERVED_NAMES.includes(nameWithoutExt)) return false;
    
    // Invalid characters for Windows/Unix
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(fileName)) return false;
    
    // Prevent hidden files and relative paths
    if (fileName.startsWith('.') || fileName.includes('..')) return false;
    
    return true;
  }
  
  static async secureCreateDirectory(dirPath: string, baseDir: string): Promise<string | null> {
    try {
      const sanitizedPath = PathValidator.sanitizePath(dirPath, baseDir);
      if (!sanitizedPath) return null;
      
      // Check if path already exists
      try {
        const stats = await fs.stat(sanitizedPath);
        if (stats.isDirectory()) return sanitizedPath;
        if (stats.isFile()) throw new Error('Path exists as file');
      } catch (error) {
        // Directory doesn't exist, proceed with creation
      }
      
      // Create directory with proper permissions (755)
      await fs.mkdir(sanitizedPath, { recursive: true, mode: 0o755 });
      
      return sanitizedPath;
    } catch (error) {
      console.error('Secure directory creation failed:', error);
      return null;
    }
  }
}
```

### Directory Traversal Prevention

```typescript
// Security-focused directory operations
class SecureDirectoryTraversal {
  static async listDirectorySecure(
    dirPath: string, 
    baseDir: string,
    options: {
      maxDepth?: number;
      allowedExtensions?: string[];
      maxFiles?: number;
    } = {}
  ): Promise<string[]> {
    const { maxDepth = 5, allowedExtensions = ['.md'], maxFiles = 1000 } = options;
    const files: string[] = [];
    
    const traverseDirectory = async (currentDir: string, depth: number): Promise<void> => {
      if (depth > maxDepth || files.length >= maxFiles) return;
      
      // Validate current directory is within base
      const resolvedCurrent = path.resolve(currentDir);
      const resolvedBase = path.resolve(baseDir);
      
      if (!resolvedCurrent.startsWith(resolvedBase)) {
        throw new Error('Directory traversal attempt detected');
      }
      
      try {
        const items = await fs.readdir(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          if (files.length >= maxFiles) break;
          
          const itemPath = path.join(currentDir, item.name);
          
          // Validate item name
          if (!SecureFileSystem.validateFileName(item.name)) continue;
          
          if (item.isDirectory()) {
            // Recursively traverse subdirectories
            await traverseDirectory(itemPath, depth + 1);
          } else if (item.isFile()) {
            // Check file extension
            const ext = path.extname(item.name);
            if (allowedExtensions.includes(ext)) {
              files.push(itemPath);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${currentDir}:`, error);
        // Don't throw - continue with other directories
      }
    };
    
    await traverseDirectory(dirPath, 0);
    return files;
  }
}
```

### Safe File Operations Patterns

```typescript
// Atomic and secure file operations
import * as crypto from 'crypto';

class AtomicFileOperations {
  static async writeFileAtomic(filePath: string, content: string): Promise<void> {
    // Generate temporary file name
    const tempPath = `${filePath}.tmp.${crypto.randomBytes(6).toString('hex')}`;
    
    try {
      // Write to temporary file first
      await fs.writeFile(tempPath, content, { 
        encoding: 'utf8',
        mode: 0o644,
        flag: 'w'
      });
      
      // Atomic rename
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Cleanup on failure
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error;
    }
  }
  
  static async readFileSecure(filePath: string, maxSize = 10 * 1024 * 1024): Promise<string> {
    // Validate file first
    const stats = await fs.stat(filePath);
    
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }
    
    if (stats.size > maxSize) {
      throw new Error('File too large');
    }
    
    // Check file permissions
    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch {
      throw new Error('No read permission');
    }
    
    return await fs.readFile(filePath, 'utf8');
  }
  
  static async backupFile(filePath: string): Promise<string | null> {
    try {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.error('Backup creation failed:', error);
      return null;
    }
  }
}
```

## Advanced File Operations

### Concurrent Access Patterns

```typescript
// File locking and concurrent access management
class FileAccessManager {
  private static locks = new Map<string, Promise<any>>();
  
  static async withFileLock<T>(
    filePath: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const normalizedPath = path.resolve(filePath);
    
    // Wait for existing operation to complete
    if (this.locks.has(normalizedPath)) {
      await this.locks.get(normalizedPath);
    }
    
    // Create new operation promise
    const operationPromise = this.executeWithTimeout(operation, 30000);
    this.locks.set(normalizedPath, operationPromise);
    
    try {
      const result = await operationPromise;
      return result;
    } finally {
      this.locks.delete(normalizedPath);
    }
  }
  
  private static async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }
}

// Usage in IPC handlers
ipcMain.handle('save-test-case', async (event, testCase: TestCase, filePath: string): Promise<boolean> => {
  return FileAccessManager.withFileLock(filePath, async () => {
    // Your save operation here
    const sanitizedPath = PathValidator.sanitizePath(filePath, getProjectDirectory());
    if (!sanitizedPath) return false;
    
    const markdown = generateMarkdown(testCase);
    await AtomicFileOperations.writeFileAtomic(sanitizedPath, markdown);
    return true;
  });
});
```

### File Watching with Chokidar

```typescript
// Secure file watching implementation
import chokidar from 'chokidar';

class SecureFileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private watchedPaths = new Set<string>();
  
  startWatching(projectPath: string, callback: (event: string, filePath: string) => void): void {
    // Stop existing watcher
    this.stopWatching();
    
    // Validate project path
    const resolvedPath = path.resolve(projectPath);
    
    this.watcher = chokidar.watch(path.join(resolvedPath, 'tests'), {
      // Security options
      followSymlinks: false,        // Prevent symlink attacks
      ignoreInitial: true,          // Don't emit events for existing files
      depth: 5,                     // Limit recursion depth
      awaitWriteFinish: {           // Prevent partial file events
        stabilityThreshold: 100,
        pollInterval: 50
      },
      
      // Performance options
      usePolling: false,
      interval: 1000,
      binaryInterval: 3000,
      
      // File filtering
      ignored: [
        /(^|[\/\\])\../, // Hidden files
        /node_modules/,  // Dependencies
        /\.tmp$/,        // Temporary files
        /\.backup$/      // Backup files
      ]
    });
    
    // Event handlers with validation
    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath, callback))
      .on('change', (filePath) => this.handleFileEvent('change', filePath, callback))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath, callback))
      .on('error', (error) => {
        console.error('File watcher error:', error);
        this.stopWatching();
      });
  }
  
  private handleFileEvent(
    event: string, 
    filePath: string, 
    callback: (event: string, filePath: string) => void
  ): void {
    try {
      // Validate file path
      const resolvedPath = path.resolve(filePath);
      
      // Only process markdown files
      if (!resolvedPath.endsWith('.md')) return;
      
      // Validate file name
      const fileName = path.basename(resolvedPath);
      if (!SecureFileSystem.validateFileName(fileName)) return;
      
      this.watchedPaths.add(resolvedPath);
      callback(event, resolvedPath);
    } catch (error) {
      console.error('File event handling error:', error);
    }
  }
  
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.watchedPaths.clear();
  }
}
```

### Directory Structure Management

```typescript
// Intelligent directory structure operations
class DirectoryStructureManager {
  static async ensureTestStructure(projectPath: string): Promise<boolean> {
    try {
      const testDirs = [
        'tests',
        'tests/core',
        'tests/integration',
        'tests/performance',
        'tests/security'
      ];
      
      for (const dir of testDirs) {
        const fullPath = path.join(projectPath, dir);
        const sanitizedPath = await SecureFileSystem.secureCreateDirectory(fullPath, projectPath);
        
        if (!sanitizedPath) {
          throw new Error(`Failed to create directory: ${dir}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Directory structure creation failed:', error);
      return false;
    }
  }
  
  static async organizeTestCases(projectPath: string): Promise<{
    organized: number;
    errors: string[];
  }> {
    const result = { organized: 0, errors: [] };
    
    try {
      const testFiles = await SecureDirectoryTraversal.listDirectorySecure(
        path.join(projectPath, 'tests'),
        projectPath,
        { maxFiles: 500 }
      );
      
      for (const filePath of testFiles) {
        try {
          const testCase = await this.loadTestCaseMetadata(filePath);
          if (testCase) {
            const newLocation = this.determineTestLocation(testCase, projectPath);
            if (newLocation !== filePath) {
              await this.moveTestCaseSecurely(filePath, newLocation);
              result.organized++;
            }
          }
        } catch (error) {
          result.errors.push(`${filePath}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Directory organization failed: ${error.message}`);
    }
    
    return result;
  }
  
  private static async moveTestCaseSecurely(
    oldPath: string, 
    newPath: string
  ): Promise<void> {
    // Ensure target directory exists
    const targetDir = path.dirname(newPath);
    await fs.mkdir(targetDir, { recursive: true });
    
    // Atomic move operation
    await FileAccessManager.withFileLock(oldPath, async () => {
      await fs.rename(oldPath, newPath);
    });
  }
}
```

## React Integration Patterns

### Renderer Process Communication

```typescript
// Secure React hooks for Electron IPC
import { useState, useEffect, useCallback, useRef } from 'react';

interface ElectronAPI {
  saveTestCase: (testCase: TestCase, filePath: string) => Promise<boolean>;
  loadTestCase: (filePath: string) => Promise<TestCase | null>;
  listTestCases: (projectPath: string) => Promise<string[]>;
  openDirectory: () => Promise<string | null>;
  onProjectSelected: (callback: (path: string) => void) => () => void;
  onNewTestCase: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Custom hook for file operations
export const useFileOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const saveTestCase = useCallback(async (testCase: TestCase, filePath: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Client-side validation
      if (!testCase || !filePath) {
        throw new Error('Invalid parameters');
      }
      
      const result = await window.electronAPI.saveTestCase(testCase, filePath);
      
      if (!result) {
        throw new Error('Save operation failed');
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const loadTestCase = useCallback(async (filePath: string): Promise<TestCase | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!filePath) {
        throw new Error('File path required');
      }
      
      const testCase = await window.electronAPI.loadTestCase(filePath);
      return testCase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load test case';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    saveTestCase,
    loadTestCase,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// Project management hook
export const useProjectManager = () => {
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<string[]>([]);
  const cleanupRef = useRef<(() => void)[]>([]);
  
  useEffect(() => {
    // Set up event listeners
    const projectSelectedCleanup = window.electronAPI.onProjectSelected((path: string) => {
      setProjectPath(path);
      refreshTestCases(path);
    });
    
    const newTestCaseCleanup = window.electronAPI.onNewTestCase(() => {
      // Handle new test case event
      if (projectPath) {
        refreshTestCases(projectPath);
      }
    });
    
    cleanupRef.current = [projectSelectedCleanup, newTestCaseCleanup];
    
    // Cleanup on unmount
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
    };
  }, [projectPath]);
  
  const refreshTestCases = useCallback(async (path: string) => {
    try {
      const cases = await window.electronAPI.listTestCases(path);
      setTestCases(cases);
    } catch (error) {
      console.error('Failed to refresh test cases:', error);
      setTestCases([]);
    }
  }, []);
  
  const openProject = useCallback(async (): Promise<boolean> => {
    try {
      const path = await window.electronAPI.openDirectory();
      if (path) {
        setProjectPath(path);
        await refreshTestCases(path);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to open project:', error);
      return false;
    }
  }, [refreshTestCases]);
  
  return {
    projectPath,
    testCases,
    openProject,
    refreshTestCases: () => projectPath ? refreshTestCases(projectPath) : Promise.resolve()
  };
};
```

### Event Handling Patterns

```typescript
// Secure event handling for file operations
import { useReducer, useCallback, useEffect } from 'react';

interface FileState {
  selectedFile: string | null;
  fileContent: TestCase | null;
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

type FileAction = 
  | { type: 'SELECT_FILE'; payload: string }
  | { type: 'LOAD_CONTENT'; payload: TestCase }
  | { type: 'UPDATE_CONTENT'; payload: Partial<TestCase> }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: Date }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const fileReducer = (state: FileState, action: FileAction): FileState => {
  switch (action.type) {
    case 'SELECT_FILE':
      return {
        ...state,
        selectedFile: action.payload,
        fileContent: null,
        isDirty: false,
        error: null
      };
      
    case 'LOAD_CONTENT':
      return {
        ...state,
        fileContent: action.payload,
        isDirty: false,
        error: null
      };
      
    case 'UPDATE_CONTENT':
      return {
        ...state,
        fileContent: state.fileContent ? {
          ...state.fileContent,
          ...action.payload
        } : null,
        isDirty: true,
        error: null
      };
      
    case 'SAVE_START':
      return {
        ...state,
        isAutoSaving: true,
        error: null
      };
      
    case 'SAVE_SUCCESS':
      return {
        ...state,
        isDirty: false,
        isAutoSaving: false,
        lastSaved: action.payload,
        error: null
      };
      
    case 'SAVE_ERROR':
      return {
        ...state,
        isAutoSaving: false,
        error: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

export const useFileManager = () => {
  const [state, dispatch] = useReducer(fileReducer, {
    selectedFile: null,
    fileContent: null,
    isDirty: false,
    isAutoSaving: false,
    lastSaved: null,
    error: null
  });
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Auto-save functionality
  useEffect(() => {
    if (state.isDirty && state.selectedFile && state.fileContent) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new auto-save timeout
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          dispatch({ type: 'SAVE_START' });
          
          const success = await window.electronAPI.saveTestCase(
            state.fileContent!,
            state.selectedFile!
          );
          
          if (success) {
            dispatch({ type: 'SAVE_SUCCESS', payload: new Date() });
          } else {
            dispatch({ type: 'SAVE_ERROR', payload: 'Auto-save failed' });
          }
        } catch (error) {
          dispatch({ 
            type: 'SAVE_ERROR', 
            payload: error instanceof Error ? error.message : 'Auto-save error' 
          });
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.isDirty, state.selectedFile, state.fileContent]);
  
  const selectFile = useCallback(async (filePath: string) => {
    try {
      dispatch({ type: 'SELECT_FILE', payload: filePath });
      
      const content = await window.electronAPI.loadTestCase(filePath);
      if (content) {
        dispatch({ type: 'LOAD_CONTENT', payload: content });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load file content' });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'File loading error' 
      });
    }
  }, []);
  
  const updateContent = useCallback((updates: Partial<TestCase>) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: updates });
  }, []);
  
  const saveFile = useCallback(async (): Promise<boolean> => {
    if (!state.selectedFile || !state.fileContent) return false;
    
    try {
      dispatch({ type: 'SAVE_START' });
      
      const success = await window.electronAPI.saveTestCase(
        state.fileContent,
        state.selectedFile
      );
      
      if (success) {
        dispatch({ type: 'SAVE_SUCCESS', payload: new Date() });
        return true;
      } else {
        dispatch({ type: 'SAVE_ERROR', payload: 'Save operation failed' });
        return false;
      }
    } catch (error) {
      dispatch({ 
        type: 'SAVE_ERROR', 
        payload: error instanceof Error ? error.message : 'Save error' 
      });
      return false;
    }
  }, [state.selectedFile, state.fileContent]);
  
  return {
    ...state,
    selectFile,
    updateContent,
    saveFile,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };
};
```

### Error Boundaries

```typescript
// Error boundary for Electron integration
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ElectronErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Electron integration error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Report to main process for logging
    if (window.electronAPI) {
      // Could add error reporting IPC if needed
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>An error occurred in the application.</p>
          <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Common Vulnerabilities & Prevention

### 1. Node.js API Exposure

**Vulnerability**: Exposing Node.js APIs directly to renderer process.

```typescript
// ❌ VULNERABLE
contextBridge.exposeInMainWorld('nodeAPI', {
  fs: require('fs'),
  exec: require('child_process').exec
});

// ✅ SECURE
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content: string, path: string) => 
    ipcRenderer.invoke('save-file', content, path)
});
```

### 2. Path Traversal Attacks

**Vulnerability**: Allowing unchecked file paths.

```typescript
// ❌ VULNERABLE
ipcMain.handle('read-file', async (event, filePath) => {
  return fs.readFile(filePath, 'utf8'); // Can access any file!
});

// ✅ SECURE
ipcMain.handle('read-file', async (event, filePath) => {
  const sanitizedPath = PathValidator.sanitizePath(filePath, baseDirectory);
  if (!sanitizedPath) throw new Error('Invalid path');
  return fs.readFile(sanitizedPath, 'utf8');
});
```

### 3. Code Injection

**Vulnerability**: Executing user-provided code.

```typescript
// ❌ VULNERABLE
ipcMain.handle('execute-command', async (event, command) => {
  return exec(command); // Remote code execution!
});

// ✅ SECURE
ipcMain.handle('validate-test-case', async (event, testCase) => {
  return validateTestCaseSchema(testCase); // Structured validation only
});
```

### 4. Data Validation Bypass

**Vulnerability**: Trusting renderer process data.

```typescript
// ❌ VULNERABLE
ipcMain.handle('save-test-case', async (event, data) => {
  return fs.writeFile(data.path, data.content); // No validation!
});

// ✅ SECURE
ipcMain.handle('save-test-case', async (event, testCase, filePath) => {
  if (!validateTestCase(testCase)) throw new Error('Invalid test case');
  if (!validateFilePath(filePath)) throw new Error('Invalid file path');
  
  const sanitizedPath = PathValidator.sanitizePath(filePath, baseDir);
  const sanitizedContent = sanitizeMarkdown(generateMarkdown(testCase));
  
  return AtomicFileOperations.writeFileAtomic(sanitizedPath, sanitizedContent);
});
```

### 5. Context Isolation Bypass

**Vulnerability**: Disabling context isolation.

```typescript
// ❌ VULNERABLE
new BrowserWindow({
  webPreferences: {
    contextIsolation: false,  // Dangerous!
    nodeIntegration: true     // Even worse!
  }
});

// ✅ SECURE
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,   // Always enabled
    nodeIntegration: false,   // Always disabled
    sandbox: true,            // Additional protection
    webSecurity: true         // Enforce web security
  }
});
```

## Security Implementation Examples

### Complete Secure IPC Setup

```typescript
// main/security.ts - Main process security utilities
export class SecurityManager {
  private static projectDirectory: string | null = null;
  
  static setProjectDirectory(path: string): boolean {
    try {
      const resolvedPath = path.resolve(path);
      // Validate project directory structure
      if (this.validateProjectStructure(resolvedPath)) {
        this.projectDirectory = resolvedPath;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
  
  static getProjectDirectory(): string {
    if (!this.projectDirectory) {
      throw new Error('Project directory not set');
    }
    return this.projectDirectory;
  }
  
  private static validateProjectStructure(path: string): boolean {
    // Add your project structure validation logic
    return true;
  }
}

// Complete secure IPC handlers
ipcMain.handle('save-test-case', async (event, testCase: TestCase, filePath: string): Promise<boolean> => {
  return FileAccessManager.withFileLock(filePath, async () => {
    // 1. Validate inputs
    if (!validateTestCaseStructure(testCase)) {
      throw new Error('Invalid test case structure');
    }
    
    // 2. Sanitize file path
    const projectDir = SecurityManager.getProjectDirectory();
    const sanitizedPath = PathValidator.sanitizePath(filePath, projectDir);
    if (!sanitizedPath) {
      throw new Error('Invalid file path');
    }
    
    // 3. Validate file access
    if (!await PathValidator.validateFileAccess(sanitizedPath)) {
      throw new Error('File access denied');
    }
    
    // 4. Generate secure content
    const markdown = generateSecureMarkdown(testCase);
    
    // 5. Create backup
    if (await fs.access(sanitizedPath).then(() => true).catch(() => false)) {
      await AtomicFileOperations.backupFile(sanitizedPath);
    }
    
    // 6. Atomic write
    await AtomicFileOperations.writeFileAtomic(sanitizedPath, markdown);
    
    return true;
  });
});
```

### Secure Content Generation

```typescript
// Content sanitization utilities
class ContentSanitizer {
  private static readonly ALLOWED_HTML_TAGS = ['code', 'pre', 'em', 'strong', 'ul', 'ol', 'li'];
  private static readonly BLOCKED_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /data:text\/html/gi
  ];
  
  static sanitizeMarkdown(content: string): string {
    let sanitized = content;
    
    // Remove blocked patterns
    this.BLOCKED_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Escape potentially dangerous characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized;
  }
  
  static validateTestCaseContent(testCase: TestCase): boolean {
    const requiredFields = ['metadata', 'content'];
    const metadataFields = ['id', 'title', 'description', 'category'];
    
    // Check required top-level fields
    for (const field of requiredFields) {
      if (!(field in testCase)) return false;
    }
    
    // Check metadata fields
    for (const field of metadataFields) {
      if (!(field in testCase.metadata)) return false;
      if (typeof testCase.metadata[field] !== 'string') return false;
    }
    
    // Validate ID format
    if (!/^[A-Z]+-\d{3}$/.test(testCase.metadata.id)) return false;
    
    return true;
  }
}
```

## Best Practices Summary

### Security Checklist

1. **IPC Security**:
   - ✅ Always use context isolation
   - ✅ Never expose Node.js APIs directly
   - ✅ Validate all inputs in main process
   - ✅ Use structured IPC patterns
   - ✅ Implement timeouts for operations

2. **File System Security**:
   - ✅ Sanitize and validate all file paths
   - ✅ Prevent directory traversal
   - ✅ Use atomic file operations
   - ✅ Implement file locking for concurrent access
   - ✅ Validate file permissions and sizes

3. **Content Security**:
   - ✅ Sanitize all user content
   - ✅ Validate data structures
   - ✅ Escape dangerous characters
   - ✅ Implement content size limits

4. **Error Handling**:
   - ✅ Use error boundaries in React
   - ✅ Log security events
   - ✅ Fail securely (deny by default)
   - ✅ Provide meaningful error messages

5. **Performance & Reliability**:
   - ✅ Implement operation timeouts
   - ✅ Use file locking for consistency
   - ✅ Create backups before modifications
   - ✅ Limit resource consumption

This documentation provides a comprehensive foundation for secure Electron development specifically tailored to the GTMS Test Suite application, focusing on real-world security patterns and file operation best practices.