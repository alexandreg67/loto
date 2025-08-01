# CRUSH Configuration

## Build Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Lint/Format Commands
- `pnpm lint` - Run ESLint
- `pnpm lint --fix` - Run ESLint with auto-fix

## Test Commands
- No tests configured yet

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` alias when possible
- Sort imports: built-in, external, internal
- Use named imports over default imports

### Formatting
- Follow Next.js core web vitals ESLint config
- Use TypeScript strict mode
- Use Tailwind CSS for styling

### Types
- Use TypeScript for all files
- Define types in `types.ts` or colocated files
- Prefer interfaces over types for objects

### Naming Conventions
- Use PascalCase for components
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

### Error Handling
- Use try/catch blocks for async operations
- Log errors appropriately
- Handle API errors gracefully

### Component Structure
- Use functional components with arrow functions
- Use TypeScript interfaces for props
- Implement proper component composition