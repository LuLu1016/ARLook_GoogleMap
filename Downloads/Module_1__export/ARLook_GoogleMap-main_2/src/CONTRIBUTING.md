# Contributing to ARLook

Thank you for your interest in contributing to ARLook! This document provides guidelines and information for contributors.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Follow the project's coding standards
- Write clear commit messages

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a branch for your feature: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test thoroughly
7. Commit with clear messages
8. Push to your fork
9. Create a pull request

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define types for all props and data structures
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes

### React/Next.js
- Use functional components with hooks
- Follow Next.js 15 App Router conventions
- Keep components small and focused
- Use meaningful component and variable names

### Styling
- Use Tailwind CSS for styling
- Follow mobile-first approach
- Ensure responsive design
- Maintain consistent spacing and colors

### Code Formatting
- Use Prettier for code formatting
- Use ESLint for linting
- Format code before committing

## Pull Request Process

1. Update README.md if needed
2. Update documentation for new features
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback

## Commit Message Format

Use clear, descriptive commit messages:

```
feat: Add property filtering by price range
fix: Resolve map marker click issue
docs: Update API documentation
style: Format code with Prettier
refactor: Reorganize component structure
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple browsers if applicable
- Test responsive design on different screen sizes

## Questions?

Feel free to open an issue for questions or discussions about the project.

