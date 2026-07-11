# Coding Conventions

## General principles

- Keep changes focused and minimal
- Match existing patterns in the codebase
- Prefer readability over cleverness

## Error handling

Always return structured errors from API routes:

```typescript
throw new HttpException(
  { code: "VALIDATION_ERROR", message: "Invalid input", details: errors },
  HttpStatus.BAD_REQUEST,
);
```

## Naming

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions and variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

## Testing

- Unit tests for business logic
- Integration tests for API endpoints
- Name test files `*.spec.ts` or `*.test.ts`
