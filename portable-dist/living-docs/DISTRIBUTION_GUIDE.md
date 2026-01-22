# Living Docs - Distribution Guide

## 📦 What You're Building

Three standalone executables that **don't require Node.js**:

```
dist/
├── living-docs-linux      # ~50MB - Linux x64
├── living-docs-macos      # ~50MB - macOS x64
└── living-docs-win.exe    # ~50MB - Windows x64
```

---

## 🚀 How to Distribute

### Option 1: Direct File Sharing

**1. Zip the executables:**
```bash
cd dist
zip living-docs-linux.zip living-docs-linux
zip living-docs-macos.zip living-docs-macos
zip living-docs-windows.zip living-docs-win.exe
```

**2. Share via:**
- Email
- Cloud storage (Google Drive, Dropbox)
- File transfer services
- Internal network share

**3. User Instructions:**

**Linux/Mac:**
```bash
# Extract and make executable
unzip living-docs-linux.zip
chmod +x living-docs-linux

# Test it
./living-docs-linux --version

# Install globally (optional)
sudo mv living-docs-linux /usr/local/bin/living-docs
```

**Windows:**
```cmd
# Extract the .exe
# Double-click or run from Command Prompt
living-docs-win.exe --version

# Add to PATH (optional)
# Copy to C:\Windows\System32\ or any folder in PATH
```

---

### Option 2: Create Installer Package

#### Linux - Create .deb package

```bash
mkdir -p living-docs_1.0.0/usr/local/bin
cp dist/living-docs-linux living-docs_1.0.0/usr/local/bin/living-docs
chmod +x living-docs_1.0.0/usr/local/bin/living-docs

mkdir -p living-docs_1.0.0/DEBIAN
cat > living-docs_1.0.0/DEBIAN/control << EOF
Package: living-docs
Version: 1.0.0
Architecture: amd64
Maintainer: Your Name
Description: Lightweight living documentation system
EOF

dpkg-deb --build living-docs_1.0.0
```

Users install with:
```bash
sudo dpkg -i living-docs_1.0.0.deb
living-docs --help
```

#### macOS - Create .app bundle

```bash
mkdir -p LivingDocs.app/Contents/MacOS
cp dist/living-docs-macos LivingDocs.app/Contents/MacOS/living-docs
chmod +x LivingDocs.app/Contents/MacOS/living-docs

cat > LivingDocs.app/Contents/Info.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
"http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>living-docs</string>
    <key>CFBundleName</key>
    <string>Living Docs</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
</dict>
</plist>
EOF

zip -r LivingDocs.app.zip LivingDocs.app
```

#### Windows - Create installer with Inno Setup

Download Inno Setup and create `setup.iss`:

```ini
[Setup]
AppName=Living Docs
AppVersion=1.0.0
DefaultDirName={pf}\LivingDocs
OutputBaseFilename=LivingDocsSetup

[Files]
Source: "dist\living-docs-win.exe"; DestDir: "{app}"

[Icons]
Name: "{commonprograms}\Living Docs"; Filename: "{app}\living-docs-win.exe"
```

---

### Option 3: Host on Internal Server

```bash
# On your server
mkdir /var/www/downloads/living-docs
cp dist/* /var/www/downloads/living-docs/

# Create download page
cat > /var/www/downloads/living-docs/index.html << EOF
<html>
<head><title>Living Docs Downloads</title></head>
<body>
  <h1>Living Docs v1.0.0</h1>
  <ul>
    <li><a href="living-docs-linux">Linux (x64)</a></li>
    <li><a href="living-docs-macos">macOS (x64)</a></li>
    <li><a href="living-docs-win.exe">Windows (x64)</a></li>
  </ul>
</body>
</html>
EOF
```

Users download with:
```bash
# Linux/Mac
curl -O http://yourserver/downloads/living-docs/living-docs-linux
chmod +x living-docs-linux

# Windows
# Open browser and download
```

---

### Option 4: GitHub Releases

If your repo is public/accessible:

```bash
# Create release
git tag v1.0.0
git push origin v1.0.0

# Upload executables to GitHub Releases
# Through GitHub web interface or using gh CLI:
gh release create v1.0.0 \
  dist/living-docs-linux \
  dist/living-docs-macos \
  dist/living-docs-win.exe \
  --title "Living Docs v1.0.0" \
  --notes "Initial release"
```

Users download:
```bash
# Linux
wget https://github.com/user/repo/releases/download/v1.0.0/living-docs-linux
chmod +x living-docs-linux

# Or use gh CLI
gh release download v1.0.0
```

---

## 📝 User Quick Start Guide

Include this with your distribution:

```markdown
# Living Docs - Quick Start

## Installation

### Linux/Mac
1. Download the file for your platform
2. Make it executable: `chmod +x living-docs-linux`
3. Run it: `./living-docs-linux --help`
4. (Optional) Move to PATH: `sudo mv living-docs-linux /usr/local/bin/living-docs`

### Windows
1. Download `living-docs-win.exe`
2. Run it from Command Prompt or PowerShell
3. (Optional) Add to PATH or copy to C:\Windows\System32\

## First Steps

```bash
# Initialize a new project
living-docs init

# Add your first chunk
living-docs add "Getting Started" -c "# Welcome to our docs"

# Build master document
living-docs build

# View the result
cat docs/master.md
```

## Common Commands

- `living-docs add <name> -c "content"` - Add documentation
- `living-docs list` - List all chunks
- `living-docs scan` - Check for changes
- `living-docs pull` - Accept changes
- `living-docs build` - Generate master document
- `living-docs watch` - Start auto-monitoring
- `living-docs --help` - Show all commands

## Support

For full documentation, see the README.md file or visit:
[Your documentation URL]
```

---

## 🔒 Security Considerations

### Code Signing (Recommended)

**macOS:**
```bash
codesign --sign "Developer ID" dist/living-docs-macos
```

**Windows:**
```powershell
signtool sign /f certificate.pfx /p password dist\living-docs-win.exe
```

### Checksums

Provide checksums for verification:

```bash
cd dist
sha256sum * > SHA256SUMS
```

Users verify with:
```bash
sha256sum -c SHA256SUMS
```

---

## 📊 Size Optimization (Optional)

If 50MB is too large, consider:

### Option 1: Compress executables

```bash
upx --best dist/living-docs-linux
upx --best dist/living-docs-macos
upx --best dist/living-docs-win.exe
```

This can reduce size by ~60% (to ~20MB).

### Option 2: Create smaller wrapper

Instead of bundling Node.js, create a small script that:
1. Checks if Node.js is installed
2. If not, offers to install it
3. Then runs your app

---

## 🎯 Best Distribution Method

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| **Direct files** | Small teams | Simple, fast | Manual process |
| **Installers** | Enterprise | Professional, PATH setup | More complex |
| **Server hosting** | Internal teams | Central location | Needs server |
| **GitHub Releases** | Open source | Versioning, public | Requires GitHub |
| **npm global** | Developers | Easy updates | Requires Node.js |

---

## 🔄 Updates

When you release v2.0.0:

```bash
# Update version in package.json
# Rebuild executables
npm run build:all

# Redistribute new executables
# Users replace old files with new ones
```

---

## ✅ Verification Checklist

Before distributing:

- [ ] Test each executable on target platform
- [ ] Verify `--version` shows correct version
- [ ] Test `init`, `add`, `list`, `build` commands
- [ ] Include README or quick start guide
- [ ] Provide checksums (SHA256SUMS file)
- [ ] Test on clean system without Node.js
- [ ] Document any prerequisites
- [ ] Include license information

---

## 📞 Support Plan

Provide users with:

1. **Documentation**: README, QUICKSTART, this guide
2. **Examples**: Sample projects
3. **Contact**: Email or issue tracker
4. **FAQ**: Common questions
5. **Version info**: Changelog

---

## 🎉 Ready to Distribute!

Once the build completes:

1. Test the executables
2. Choose your distribution method
3. Package with documentation
4. Share with users
5. Collect feedback

**Current executables will be in:** `dist/` directory

**Current documentation:** All .md files in project root
