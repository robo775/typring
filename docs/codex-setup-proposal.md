# Codex Environment Setup Proposal

If the Codex execution environment does not expose `node` and `npm`, use a setup step equivalent to the following before validation.

```powershell
# Install Node.js 20 LTS if it is not already available.
winget install OpenJS.NodeJS.LTS --version 20.19.0

# Confirm runtime availability.
node --version
npm --version

# Install project dependencies.
npm install

# Validate the project.
npm run lint
npm run build
```

Expected runtime:

- Node.js: 20.x LTS
- npm: bundled with Node.js 20.x

If `winget` is unavailable, install Node.js 20 LTS through the official installer or a managed runtime already approved for the environment.

