# How to Package Living Docs as an Executable

## ✅ Option 1: Global NPM Command (RECOMMENDED - Already Done!)

This is the **easiest and fastest** way. I've already set this up for you!

### Install Globally

```bash
cd /home/user/versionContolAPP
npm link
```

### Use Anywhere

```bash
# Now you can use 'living-docs' from ANY directory!
living-docs --help
living-docs list
living-docs add "My Doc" -c "Content"
living-docs scan
living-docs watch
```

### Uninstall

```bash
npm unlink living-docs
```

---

## Option 2: Standalone Executables with `pkg`

Create platform-specific executables that don't require Node.js.

### Setup

```bash
# Install pkg globally (already done)
npm install -g pkg

# Build for your platform
npm run build:linux      # Linux x64
npm run build:mac        # macOS x64
npm run build:windows    # Windows x64
npm run build:all        # All platforms
```

### What You Get

```
dist/
├── living-docs-linux      # Linux executable (~50MB)
├── living-docs-macos      # macOS executable
└── living-docs-win.exe    # Windows executable
```

### Use the Executable

```bash
# Linux/Mac
./dist/living-docs-linux --help
./dist/living-docs-linux list
./dist/living-docs-linux watch

# Windows
dist\living-docs-win.exe --help
```

### Add to PATH (Linux/Mac)

```bash
# Copy to /usr/local/bin
sudo cp dist/living-docs-linux /usr/local/bin/living-docs
sudo chmod +x /usr/local/bin/living-docs

# Now use from anywhere
living-docs --help
```

---

## Option 3: Install from NPM (Local)

Install as a local package.

### Create Package

```bash
cd /home/user/versionContolAPP
npm pack
```

This creates: `living-docs-1.0.0.tgz`

### Install Globally

```bash
npm install -g ./living-docs-1.0.0.tgz
```

### Use

```bash
living-docs --help
living-docs list
```

---

## Option 4: Bash Wrapper Script

Create a simple wrapper script.

### Create Script

```bash
cat > /usr/local/bin/living-docs << 'EOF'
#!/bin/bash
node /home/user/versionContolAPP/src/cli.js "$@"
EOF

chmod +x /usr/local/bin/living-docs
```

### Use

```bash
living-docs --help
living-docs list
```

---

## Option 5: Alias in Shell

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias living-docs='node /home/user/versionContolAPP/src/cli.js'
```

Then:
```bash
source ~/.bashrc  # or source ~/.zshrc
living-docs --help
```

---

## Comparison

| Method | Size | Speed | Requires Node.js | Portability |
|--------|------|-------|------------------|-------------|
| **npm link** | Small | Fast | ✅ Yes | Low |
| **pkg executable** | ~50MB | Fast | ❌ No | High |
| **npm pack** | Small | Fast | ✅ Yes | Medium |
| **Bash wrapper** | Tiny | Fast | ✅ Yes | Low |
| **Alias** | Tiny | Fast | ✅ Yes | Low |

---

## Recommended Approach

### For Personal Use (Local Machine)
✅ **Use `npm link`** - Already done! It works perfectly.

```bash
cd /home/user/versionContolAPP
npm link
living-docs --help  # Works from anywhere!
```

### For Distribution (Share with Others)
✅ **Use `pkg` to create executables** - No Node.js required!

```bash
npm run build:all
# Share dist/living-docs-linux with Linux users
# Share dist/living-docs-macos with Mac users
# Share dist/living-docs-win.exe with Windows users
```

### For Development
✅ **Use direct command** - Most flexible

```bash
cd /home/user/versionContolAPP
node src/cli.js --help
```

---

## Current Status

✅ **npm link is ACTIVE** - You can use `living-docs` from anywhere right now!

Try it:
```bash
cd ~
living-docs --version
living-docs list
```

---

## Building Standalone Executables

If you want to create executables (takes 5-10 minutes):

```bash
# For Linux only (current platform)
npm run build:linux

# For all platforms (Windows, Mac, Linux)
npm run build:all
```

The executables will be in `dist/` directory:
- `dist/living-docs-linux` - Linux
- `dist/living-docs-macos` - macOS
- `dist/living-docs-win.exe` - Windows

---

## Test Your Setup

```bash
# Test the global command
living-docs --version
living-docs --help

# Go to any directory
cd /tmp

# Still works!
living-docs list
living-docs stats

# Initialize a new project anywhere
mkdir my-docs
cd my-docs
living-docs init
living-docs add "Test" -c "Hello World"
living-docs build
cat docs/master.md
```

---

## Quick Reference

```bash
# Check installation
which living-docs
living-docs --version

# All commands work from anywhere
living-docs init              # Initialize project
living-docs add "Topic" -c "Content"  # Add chunk
living-docs list              # List all chunks
living-docs scan              # Scan for changes
living-docs assess            # Assess impact
living-docs pull              # Accept changes
living-docs history           # View commits
living-docs stats             # Statistics
living-docs build             # Build master
living-docs watch             # Start monitoring
living-docs export json       # Export to JSON

# Uninstall if needed
npm unlink living-docs
```

---

## 🎉 You're All Set!

The `living-docs` command is ready to use from anywhere on your system!

**Current status:** ✅ Global command active via `npm link`

**Next steps:**
1. Use it: `living-docs --help`
2. Test it: `cd /tmp && living-docs --version`
3. Build executables (optional): `npm run build:all`
