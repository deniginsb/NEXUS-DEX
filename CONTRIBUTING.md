# Contributing to Nexus DEX

First off, thanks for taking the time to contribute! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (transaction hashes, wallet addresses)
- **Describe the behavior you observed and what you expected**
- **Include screenshots** if relevant
- **Note your environment** (browser, OS, wallet extension)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed functionality
- **Explain why this enhancement would be useful**
- **List any similar features** in other DEXs

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing style
6. Issue that pull request!

## Development Process

### Setup Development Environment

```bash
git clone https://github.com/yourusername/nexus-dex.git
cd nexus-dex
yarn install
```

### Run Tests

```bash
# Smart contract tests
cd packages/hardhat
yarn test

# Frontend tests
cd packages/nextjs
yarn test
```

### Code Style

- **TypeScript**: Follow existing patterns
- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **Formatting**: Run `yarn format` before committing
- **Linting**: Run `yarn lint` and fix all errors

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new token to registry
fix: resolve swap calculation bug
docs: update deployment guide
style: format code with prettier
refactor: simplify token registry logic
test: add tests for swap contract
chore: update dependencies
```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Smart Contract Guidelines

### Security First

- Use OpenZeppelin contracts when possible
- Follow checks-effects-interactions pattern
- Add comprehensive tests for edge cases
- Document all external functions
- Consider reentrancy attacks

### Gas Optimization

- Minimize storage reads/writes
- Use `calldata` for function parameters when possible
- Batch operations when feasible
- Cache storage variables in memory

### Testing Requirements

All smart contract changes must include:

1. Unit tests for new functions
2. Integration tests for contract interactions
3. Edge case testing
4. Gas usage reporting

Example test structure:

```typescript
describe("StablecoinSwap", function () {
  describe("swapNEXToToken", function () {
    it("should mint correct amount of tokens", async function () {
      // Test implementation
    });
    
    it("should revert if insufficient NEX sent", async function () {
      // Test implementation
    });
  });
});
```

## Frontend Guidelines

### Component Structure

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for all new code

### State Management

- Use React hooks for local state
- Wagmi hooks for blockchain data
- Keep state as close to where it's used as possible

### Styling

- Use Tailwind CSS utility classes
- Follow DaisyUI component patterns
- Ensure responsive design (mobile-first)
- Test on multiple browsers

## Documentation

### Update These When Changing Code

- README.md - For user-facing changes
- ARCHITECTURE.md - For design changes
- DEPLOYMENT.md - For deployment process changes
- Inline code comments - For complex logic

### Documentation Style

- Write for beginners, not experts
- Include code examples
- Add screenshots for UI changes
- Keep it concise but complete

## Community

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Getting Help

- Check [Documentation](./docs)
- Search existing [Issues](https://github.com/yourusername/nexus-dex/issues)
- Ask in discussions
- Join our Discord (if available)

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Given contributor badge on GitHub

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Nexus DEX! 🚀

