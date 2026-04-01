# Publishing Guide - Zetrix MCP Server

This guide explains how to publish the Zetrix MCP Server to npm and the official MCP Registry.

## Prerequisites

- npm account (sign up at https://www.npmjs.com/)
- GitHub account
- mcp-publisher tool (for MCP Registry submission)

## Step 1: Publish to npm

### 1.1 Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 1.2 Verify package.json

The package.json is already configured with:
- ✅ `name`: "zetrix-mcp-server"
- ✅ `version`: "1.0.0"
- ✅ `mcpName`: "io.github.zetrix-chain/zetrix-mcp-server"
- ✅ `repository`: GitHub URL
- ✅ `files`: Only includes dist/, configs/, README.md, LICENSE
- ✅ `bin`: CLI entry point
- ✅ `engines`: Node.js >= 18.0.0

### 1.3 Build the project

```bash
npm run build
```

### 1.4 Test locally (optional)

```bash
npm pack
# This creates zetrix-mcp-server-1.0.0.tgz
# You can test install with: npm install -g zetrix-mcp-server-1.0.0.tgz
```

### 1.5 Publish to npm

```bash
npm publish
```

This will:
1. Run `prepublishOnly` script (build + test)
2. Package files listed in the `files` field
3. Upload to npm registry

### 1.6 Verify publication

```bash
npm view zetrix-mcp-server
```

Visit: https://www.npmjs.com/package/zetrix-mcp-server

## Step 2: Submit to MCP Registry

### 2.1 Install mcp-publisher

Download from GitHub releases:
```bash
# Visit https://github.com/modelcontextprotocol/registry/releases
# Download the appropriate binary for your OS
# Or build from source:
git clone https://github.com/modelcontextprotocol/registry.git
cd registry
make publisher
```

### 2.2 Verify server.json

The `server.json` file is already configured with:
- ✅ Schema reference
- ✅ Name: "io.github.zetrix-chain/zetrix-mcp-server"
- ✅ Version: "1.0.0"
- ✅ NPM package reference
- ✅ All 42 tools listed
- ✅ Configuration options
- ✅ Categories and tags

### 2.3 Authenticate with GitHub

The namespace `io.github.zetrix-chain/*` requires GitHub authentication.

```bash
# The publisher will prompt for GitHub credentials
# Or set GITHUB_TOKEN environment variable
export GITHUB_TOKEN=your_github_token
```

### 2.4 Submit to registry

```bash
./mcp-publisher publish server.json
```

Or if you built from source:
```bash
./bin/mcp-publisher publish server.json
```

The publisher will:
1. Validate your server.json
2. Verify npm package exists
3. Check GitHub authentication
4. Submit to the registry

### 2.5 Verify submission

Visit the MCP Registry to see your server listed:
- https://mcp.run/ (official registry browser)
- https://github.com/modelcontextprotocol/registry

## Step 3: Add to Community Directories

### 3.1 awesome-mcp-servers

Create a pull request to add your server:
1. Fork https://github.com/wong2/awesome-mcp-servers
2. Add entry to README.md:
   ```markdown
   - [Zetrix MCP Server](https://github.com/Zetrix-Chain/zetrix-mcp-server) - Comprehensive MCP server for Zetrix blockchain with 42 tools
   ```
3. Submit pull request

### 3.2 mcp.so

Visit https://mcp.so/ and follow their submission process.

### 3.3 PulseMCP

Your server should be automatically indexed by PulseMCP once it's on the MCP Registry and npm.

## Step 4: Create GitHub Release

### 4.1 Tag the release

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Initial release"
git push origin v1.0.0
```

### 4.2 Create GitHub Release

1. Go to https://github.com/Zetrix-Chain/zetrix-mcp-server/releases
2. Click "Draft a new release"
3. Choose tag: v1.0.0
4. Release title: "v1.0.0 - Initial Release"
5. Description:
   ```markdown
   # Zetrix MCP Server v1.0.0

   Initial release of the comprehensive MCP server for Zetrix blockchain.

   ## Features
   - 42 MCP tools across 5 categories
   - HTTP RPC (13 tools)
   - WebSocket (10 tools)
   - SDK operations (6 tools)
   - Cryptography (8 tools)
   - Smart contract development (5 tools)

   ## Installation
   ```bash
   npm install -g zetrix-mcp-server
   ```

   ## Documentation
   See README.md for complete documentation and usage examples.
   ```
6. Publish release

## Updating the Package

### For npm updates:

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Build and publish
npm run build
npm publish

# Push tags
git push origin v1.0.1
```

### For MCP Registry updates:

```bash
# Update version in server.json to match package.json
# Submit to registry
./mcp-publisher publish server.json
```

## Version Guidelines

Follow semantic versioning (semver):
- **Patch** (1.0.x): Bug fixes, documentation updates
- **Minor** (1.x.0): New tools, backward-compatible features
- **Major** (x.0.0): Breaking changes to tool signatures or behavior

## Automated Publishing (Optional)

Create `.github/workflows/publish.yml` for automated releases:

```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## Support

- npm package: https://www.npmjs.com/package/zetrix-mcp-server
- GitHub: https://github.com/Zetrix-Chain/zetrix-mcp-server
- MCP Registry: https://github.com/modelcontextprotocol/registry
- Documentation: https://modelcontextprotocol.info/

## Checklist

Before publishing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Version updated in package.json and server.json
- [ ] CHANGELOG.md updated (if exists)
- [ ] README.md is current
- [ ] LICENSE file exists
- [ ] Built successfully (`npm run build`)
- [ ] Logged into npm (`npm whoami`)
- [ ] GitHub token ready for MCP Registry
- [ ] server.json validated
- [ ] Git repository clean and pushed

## Post-Publishing

After publishing:

1. ✅ Verify npm package: `npm view zetrix-mcp-server`
2. ✅ Test installation: `npm install -g zetrix-mcp-server`
3. ✅ Create GitHub release
4. ✅ Submit to MCP Registry
5. ✅ Add to community directories
6. ✅ Announce on social media (optional)
7. ✅ Update documentation website (if exists)

---

For questions or issues with publishing, refer to:
- npm documentation: https://docs.npmjs.com/
- MCP Registry guide: https://modelcontextprotocol.info/tools/registry/publishing/
- GitHub releases: https://docs.github.com/en/repositories/releasing-projects-on-github
