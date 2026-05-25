```markdown
# expo-news-tabs Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill covers the core development patterns and conventions used in the `expo-news-tabs` TypeScript codebase. While no specific framework is detected, the repository emphasizes clear file organization, consistent import/export styles, and a straightforward approach to testing. This guide will help you quickly understand and contribute to the project by following its established patterns.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `newsTabComponent.ts`, `articleList.tsx`

### Imports
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { fetchArticles } from './apiClient';
    import { NewsTab } from '../components/newsTabComponent';
    ```

### Exports
- Prefer **named exports** over default exports.
  - Example:
    ```typescript
    // Good
    export function fetchArticles() { ... }
    export const NewsTab = () => { ... }

    // Avoid
    // export default NewsTab;
    ```

### Commit Messages
- Freeform style, sometimes with prefixes.
- Average commit message length: ~63 characters.
- Example:
  ```
  Add support for multiple news sources in tabs
  ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new functionality.
**Command:** `/add-feature`

1. Create a new file using camelCase naming.
2. Write your feature using TypeScript.
3. Use relative imports to include dependencies.
4. Export your functions or components using named exports.
5. Write corresponding tests in a `.test.ts` or `.test.tsx` file.
6. Commit your changes with a clear, descriptive message.

### Fixing a Bug
**Trigger:** When resolving a reported issue or bug.
**Command:** `/fix-bug`

1. Locate the relevant file(s) using camelCase naming.
2. Apply your fix, maintaining code style conventions.
3. Update or add tests to cover the bug fix.
4. Commit with a message describing the fix.

### Writing Tests
**Trigger:** When adding or updating tests for a feature or bug fix.
**Command:** `/write-test`

1. Create or update a test file matching `*.test.ts` or `*.test.tsx`.
2. Write tests using the project's preferred (undetected) testing framework.
3. Use relative imports for modules under test.
4. Run tests to ensure correctness.

## Testing Patterns

- Test files follow the pattern: `*.test.ts` or `*.test.tsx`.
- The specific testing framework is not detected; follow existing test file patterns.
- Place test files alongside or near the code they test.
- Example test file name: `newsTabComponent.test.tsx`

## Commands
| Command      | Purpose                                |
|--------------|----------------------------------------|
| /add-feature | Start the workflow for adding features  |
| /fix-bug     | Start the workflow for fixing bugs      |
| /write-test  | Start the workflow for writing tests    |
```