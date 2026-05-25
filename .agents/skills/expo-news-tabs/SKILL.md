```markdown
# expo-news-tabs Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `expo-news-tabs` TypeScript codebase. It covers file naming, import/export styles, commit message habits, and testing patterns. While no formal workflows or frameworks are detected, this guide documents the implicit standards and provides commands for common tasks.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `newsTabList.ts`, `articleDetailView.ts`

### Import Style
- Use **relative imports** for internal modules.
  - Example:
    ```typescript
    import { fetchArticles } from './apiClient';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // In newsTabList.ts
    export function NewsTabList() { ... }
    ```

### Commit Messages
- No strict prefixing; freeform style.
- Average message length: ~63 characters.
  - Example: `Fix article loading bug on tab switch`

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new functionality.
**Command:** `/add-feature`

1. Create a new file using camelCase naming.
2. Write your TypeScript code, using named exports.
3. Use relative imports for any internal dependencies.
4. Add or update relevant test files (`*.test.ts`).
5. Commit with a clear, descriptive message.

### Running Tests
**Trigger:** When you want to verify code correctness.
**Command:** `/run-tests`

1. Locate test files matching `*.test.*`.
2. Use the project's test runner (framework unspecified; likely `npm test` or similar).
3. Review test output and address any failures.

### Refactoring Code
**Trigger:** When improving structure or readability.
**Command:** `/refactor`

1. Rename files using camelCase if necessary.
2. Update imports to remain relative.
3. Ensure all exports remain named.
4. Update or add tests as needed.
5. Commit with a descriptive message.

## Testing Patterns

- Test files follow the `*.test.*` pattern (e.g., `newsTabList.test.ts`).
- Testing framework is not specified; check project scripts or dependencies.
- Tests are typically placed alongside or near the modules they cover.

**Example:**
```typescript
// newsTabList.test.ts
import { NewsTabList } from './newsTabList';

test('renders news tab list', () => {
  // test implementation
});
```

## Commands
| Command       | Purpose                                      |
|---------------|----------------------------------------------|
| /add-feature  | Scaffold and implement a new feature         |
| /run-tests    | Run all test files in the project            |
| /refactor     | Refactor code following project conventions  |
```
