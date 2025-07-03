# ESLint and Prettier Configuration

## Overview

This project uses ESLint and Prettier for code linting and formatting to maintain consistent code quality and style across the cutting planner application.

## Configuration Files

### ESLint Configuration (`eslint.config.mjs`)

The project uses the new flat config format (ESLint 9+) with comprehensive rules for:

#### React-specific rules:
- ✅ JSX formatting and best practices
- ✅ React Hooks rules enforcement
- ✅ Modern React patterns (no React import needed)
- ✅ Component structure and naming conventions

#### JavaScript/ES6 rules:
- ✅ Modern JavaScript features
- ✅ Code complexity limits
- ✅ Import/export best practices
- ✅ Variable naming and scoping

#### Accessibility rules:
- ✅ Basic accessibility checks
- ✅ ARIA attributes validation
- ✅ Interactive element requirements

#### Project-specific rules:
- ✅ Cutting optimization algorithm constraints
- ✅ Component complexity limits
- ✅ Magic number detection
- ✅ Function parameter limits

### Prettier Configuration (`.prettierrc`)

Prettier handles code formatting with these settings:
- **Print Width**: 140 characters (optimized for modern screens)
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes for strings
- **JSX Quotes**: Single quotes in JSX
- **Semicolons**: Always add semicolons
- **Trailing Commas**: None (for better git diffs)
- **Bracket Spacing**: Enabled
- **Arrow Parens**: Avoid when possible

## File-Specific Rules

### Source Files (`src/**/*.{js,jsx}`)
- Standard React and JavaScript rules apply

### Utility Functions (`src/utils/**/*.js`)
- **Stricter complexity rules**: Maximum complexity of 8
- **Parameter limits**: Maximum 4 parameters per function
- **Magic numbers**: More restrictive (only 0, 1, -1, 2 allowed)

### Components (`src/components/**/*.jsx`)
- **JSX depth limits**: Maximum 5 levels of nesting
- **Component definition**: Named components as function declarations

### Pages (`src/pages/**/*.jsx`)
- **File size limits**: Maximum 500 lines (excluding comments and blank lines)

## NPM Scripts

### Linting Scripts
```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix

# Check linting with zero warnings allowed
npm run lint:check
```

### Formatting Scripts
```bash
# Format all supported files
npm run prettier

# Check if files are properly formatted
npm run prettier:check

# Format and fix linting (combined)
npm run format

# Check formatting and linting (CI-friendly)
npm run format:check

# Complete code quality check (format + lint + build)
npm run code-quality
```

## VS Code Integration

### Required Extensions
1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)

### Automatic Features
- ✅ **Format on Save**: Automatically formats files when saving
- ✅ **Format on Paste**: Formats pasted code
- ✅ **Auto-fix on Save**: Runs ESLint auto-fix when saving
- ✅ **Organize Imports**: Automatically organizes import statements

### Editor Settings
- Single quotes preferred for JavaScript/TypeScript
- LF line endings (Unix-style)
- Trim trailing whitespace
- Insert final newline
- 2-space indentation

## Ignored Files

### ESLint Ignores (`.eslintignore`)
- `node_modules/`
- `build/` and `dist/`
- Generated files (`*.min.js`, `*.min.css`)
- Configuration files
- Third-party vendor code

### Prettier Ignores (`.prettierignore`)
- Same as ESLint ignores
- Additionally ignores lock files and public assets
- Configuration files that need specific formatting

## Best Practices

### Code Organization
1. **Import Order**: External libraries → Internal modules → Relative imports
2. **Component Structure**: Props → State → Effects → Handlers → Render
3. **File Naming**: PascalCase for components, camelCase for utilities
4. **Function Complexity**: Keep functions under 10 complexity points

### React Patterns
1. **Function Components**: Preferred over class components
2. **Hooks**: Use ESLint rules to ensure proper hook usage
3. **Props**: Destructure props for better readability
4. **JSX**: Multi-line JSX should be wrapped in parentheses

### Performance Considerations
1. **Magic Numbers**: Define constants for repeated numeric values
2. **Complex Logic**: Extract complex calculations to utility functions
3. **Component Size**: Keep components under 200 lines when possible
4. **Prop Spreading**: Use judiciously and document when necessary

## Cutting Planner Specific Rules

### Algorithm Functions (`src/utils/CuttingOptimizationService.js`)
- **High Complexity Allowed**: Cutting algorithms are inherently complex
- **Documented Magic Numbers**: Geometric calculations may need specific values
- **Performance Critical**: Optimization algorithms prioritize speed

### Visualization Components (`src/components/CuttingPlanVisualization.jsx`)
- **SVG Elements**: Special handling for SVG-specific attributes
- **Canvas Operations**: Performance-oriented code patterns allowed
- **Mathematical Calculations**: Geometric formulas may need specific formatting

### Translation Files (`src/i18n/`)
- **Object Structure**: Consistent nested object patterns
- **Key Naming**: Consistent naming conventions for translation keys
- **String Formatting**: Proper escaping and interpolation

## Troubleshooting

### Common Issues

1. **ESLint vs Prettier Conflicts**
   - Solution: The config integrates Prettier rules into ESLint
   - Use `npm run format` to apply both formatting and linting

2. **VS Code Not Auto-formatting**
   - Check that Prettier extension is installed and enabled
   - Verify `.vscode/settings.json` is present
   - Restart VS Code if needed

3. **Complex Function Warnings**
   - Break down complex functions into smaller utilities
   - Use early returns to reduce nesting
   - Extract calculation logic to separate functions

4. **Import/Export Errors**
   - Use consistent import patterns
   - Prefer named exports for utilities
   - Use default exports for React components

### Performance Tips

1. **Large Files**: Consider splitting large components
2. **Complex Calculations**: Move to utility functions with proper documentation
3. **Repetitive Code**: Extract common patterns to reusable functions
4. **Magic Numbers**: Define constants for geometric calculations

## CI/CD Integration

### Pre-commit Hooks (Recommended)
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run format:check"
```

### GitHub Actions (Example)
```yaml
- name: Code Quality Check
  run: |
    npm ci
    npm run format:check
    npm run build
```

## Configuration Updates

### Adding New Rules
1. Update `eslint.config.mjs` with new rules
2. Test with `npm run lint:check`
3. Update this documentation
4. Communicate changes to the team

### Prettier Updates
1. Modify `.prettierrc`
2. Run `npm run format` to apply changes
3. Commit formatted changes

## Team Guidelines

### Code Reviews
- ✅ All code must pass `npm run format:check`
- ✅ No ESLint warnings in production code
- ✅ Complex functions must have documentation
- ✅ New utilities must have appropriate test coverage

### Development Workflow
1. Write code with VS Code auto-formatting enabled
2. Run `npm run format` before committing
3. Ensure `npm run code-quality` passes before pull requests
4. Address any linting warnings promptly

## Resources

- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [React Hooks ESLint Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [JSX A11y ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
