#!/bin/bash

# Nawaetu Release Script
# Usage: ./scripts/release.sh v1.2.0
# or: npm run release v1.2.0
#
# This script will:
# 1. Validate version format
# 2. Commit version bump changes (if any)
# 3. Auto-generate CHANGELOG from git commits (requires manual review!)
# 4. Create an annotated git tag
# 5. Push commits and tags to GitHub
# 6. Trigger GitHub Actions for build & deploy
#
# 📝 Commit Message Best Practices for Better Changelogs:
# ─────────────────────────────────────────────────────
# Use this format: <type>: <title> - <description>
#
# Examples:
#   feat: Qibla Compass Optimization - major performance improvements for mobile
#   fix: Alignment Feedback - enhanced visual animations with haptic response
#   perf: React.memo implementation - prevent unnecessary re-renders
#   improve: Compass Session Handling - better reinitialization on app reopen
#
# Types: feat, fix, perf, improve, refactor, style, chore
# The script will auto-format these into readable changelog entries!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if version argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Version argument required${NC}"
    echo -e "${BLUE}Usage: $0 <version>${NC}"
    echo -e "${BLUE}Example: $0 v1.2.0${NC}"
    exit 1
fi

VERSION=$1
VERSION_NUMBER="${VERSION#v}"  # Remove 'v' prefix

# Validate version format (vX.Y.Z)
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ Error: Version must match format vX.Y.Z${NC}"
    echo -e "${BLUE}Example: v1.2.0${NC}"
    exit 1
fi

# Check if version already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Tag $VERSION already exists${NC}"
    exit 1
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Must be on 'main' branch to create release${NC}"
    echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}"
    exit 1
fi

# Check git remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No git remote 'origin' configured${NC}"
    exit 1
fi

GITHUB_REPO=$(git remote get-url origin | sed 's/.*://;s/\.git$//')

# Show release info
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Nawaetu Release: $VERSION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Repository: ${CYAN}$GITHUB_REPO${NC}"
echo -e "Branch: ${GREEN}$CURRENT_BRANCH${NC}"
echo -e "Release: ${YELLOW}$VERSION${NC}"
echo ""

# CRITICAL: Update version files BEFORE checking git status
echo -e "${BLUE}📝 Updating version files...${NC}"
CURRENT_DATE=$(date +%Y-%m-%d)
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION_NUMBER\"/" package.json
sed -i '' "s/version: \".*\"/version: \"$VERSION_NUMBER\"/" src/config/app-config.ts
sed -i '' "s/lastUpdated: \".*\"/lastUpdated: \"$CURRENT_DATE\"/" src/config/app-config.ts
echo -e "${GREEN}✅ package.json → $VERSION_NUMBER${NC}"
echo -e "${GREEN}✅ app-config.ts → $VERSION_NUMBER (updated: $CURRENT_DATE)${NC}"

# Update CHANGELOG.md if entry doesn't exist
if ! grep -q "## \[$VERSION_NUMBER\]" CHANGELOG.md; then
    echo -e "${BLUE}📝 Auto-generating CHANGELOG entry from git commits...${NC}"
    
    # Get last release tag
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    # Create temp file with new entry
    TEMP_CHANGELOG=$(mktemp)
    
    # Read header (first 7 lines)
    head -n 7 CHANGELOG.md > "$TEMP_CHANGELOG"
    
    # Add new version entry header
    echo "" >> "$TEMP_CHANGELOG"
    echo "## [$VERSION_NUMBER] - $CURRENT_DATE" >> "$TEMP_CHANGELOG"
    echo "" >> "$TEMP_CHANGELOG"
    
    # Auto-generate from git commits if last tag exists
    if [ -n "$LAST_TAG" ]; then
        # Function to clean and format commit messages into readable changelog entries
        format_commit() {
            local msg="$1"
            # Remove conventional commit prefix (feat:, fix:, etc.)
            msg=$(echo "$msg" | sed 's/^[a-z]*(\?[^)]*)\?:\s*//')
            # Capitalize first letter
            msg="$(echo ${msg:0:1} | tr '[:lower:]' '[:upper:]')${msg:1}"
            # Extract title (before " - " or " – " if exists)
            if echo "$msg" | grep -q " - \| – "; then
                local title=$(echo "$msg" | sed 's/\s*[-–].*$//')
                local desc=$(echo "$msg" | sed 's/^[^-–]*[-–]\s*//')
                echo "- **${title}**: ${desc}"
            else
                echo "- **${msg}**"
            fi
        }
        
        # Parse commits into categories with better formatting
        FEATURES=$(git log --no-merges --pretty=format:"%s" "$LAST_TAG..HEAD" | grep -i "^feat" || true)
        FIXES=$(git log --no-merges --pretty=format:"%s" "$LAST_TAG..HEAD" | grep -i "^fix" || true)
        PERF=$(git log --no-merges --pretty=format:"%s" "$LAST_TAG..HEAD" | grep -i "^perf" || true)
        IMPROVEMENTS=$(git log --no-merges --pretty=format:"%s" "$LAST_TAG..HEAD" | grep -iE "^(refactor|improve|style|chore)" || true)
        
        # Add sections with formatted commits
        if [ -n "$FEATURES" ]; then
            echo "### Added" >> "$TEMP_CHANGELOG"
            while IFS= read -r commit; do
                format_commit "$commit" >> "$TEMP_CHANGELOG"
            done <<< "$FEATURES"
            echo "" >> "$TEMP_CHANGELOG"
        fi
        
        if [ -n "$PERF" ]; then
            echo "### Performance" >> "$TEMP_CHANGELOG"
            while IFS= read -r commit; do
                format_commit "$commit" >> "$TEMP_CHANGELOG"
            done <<< "$PERF"
            echo "" >> "$TEMP_CHANGELOG"
        fi
        
        if [ -n "$IMPROVEMENTS" ]; then
            echo "### Improved" >> "$TEMP_CHANGELOG"
            while IFS= read -r commit; do
                format_commit "$commit" >> "$TEMP_CHANGELOG"
            done <<< "$IMPROVEMENTS"
            echo "" >> "$TEMP_CHANGELOG"
        fi
        
        if [ -n "$FIXES" ]; then
            echo "### Fixed" >> "$TEMP_CHANGELOG"
            while IFS= read -r commit; do
                format_commit "$commit" >> "$TEMP_CHANGELOG"
            done <<< "$FIXES"
            echo "" >> "$TEMP_CHANGELOG"
        fi
        
        # If no categorized commits found, add placeholder
        if [ -z "$FEATURES" ] && [ -z "$FIXES" ] && [ -z "$IMPROVEMENTS" ] && [ -z "$PERF" ]; then
            echo "### Changed" >> "$TEMP_CHANGELOG"
            echo "- Updates and improvements" >> "$TEMP_CHANGELOG"
            echo "" >> "$TEMP_CHANGELOG"
        fi
    else
        # Fallback template if no previous tag
        echo "### Changed" >> "$TEMP_CHANGELOG"
        echo "- **General Updates**: Various improvements and optimizations" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
        echo -e "${YELLOW}⚠️  No previous tag found - please manually edit CHANGELOG.md${NC}"
    fi
    
    # Append rest of changelog
    tail -n +8 CHANGELOG.md >> "$TEMP_CHANGELOG"
    
    # Replace original
    mv "$TEMP_CHANGELOG" CHANGELOG.md
    
    echo -e "${GREEN}✅ CHANGELOG.md → Auto-generated [$VERSION_NUMBER] from commits since $LAST_TAG${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Please review and refine CHANGELOG.md!${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Suggestions for improvement:${NC}"
    echo "  • Add more descriptive details to each change"
    echo "  • Group related changes under clear titles"
    echo "  • Explain user impact and benefits"
    echo "  • Use sub-bullets for technical details"
    echo "  • Match the style of previous changelog entries"
    echo ""
    
    # Open changelog in editor (optional, comment out if not needed)
    if command -v code &> /dev/null; then
        echo -e "${BLUE}📝 Opening CHANGELOG.md in VS Code...${NC}"
        code CHANGELOG.md
        sleep 1
    fi
    
    echo -e "${YELLOW}Press any key after reviewing CHANGELOG.md to continue...${NC}"
    read -n 1 -s -r
    echo ""
else
    echo -e "${GREEN}✅ CHANGELOG.md already has [$VERSION_NUMBER] entry${NC}"
fi
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Found uncommitted changes in working directory${NC}"
    echo ""
    git status --short
    echo ""
    echo -e "${BLUE}This is likely version bump files (package.json, CHANGELOG.md, etc.)${NC}"
    echo -e "${BLUE}Will commit them with message: 'chore: release $VERSION'${NC}"
    echo ""
    
    # Auto-approve if running non-interactively or just assume yes for release flow
    # read -p "Continue and commit these changes? (y/n) " -n 1 -r
    # echo
    # if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    #     echo -e "${RED}❌ Release cancelled${NC}"
    #     exit 1
    # fi
    
    echo -e "${BLUE}📝 Committing version bump changes...${NC}"

    git add .
    git commit -m "chore: release $VERSION" -m "- Update package.json version
- Update CHANGELOG.md
- Update README.md
- Update SECURITY.md"
    echo -e "${GREEN}✅ Changes committed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Working directory is clean${NC}"
fi

# Skip intermediate "unpushed" check because we likely just created a commit above.
# We will push everything (commits + tags) at the end.

# Show what will happen
echo -e "${BLUE}This release will:${NC}"
echo "  1. ✅ Create annotated git tag: $VERSION"
echo "  2. ✅ Push tag to GitHub origin"
echo "  3. ✅ Trigger GitHub Actions workflows:"
echo "     - Run tests"
echo "     - Build optimized bundle"
echo "     - Create GitHub Release (auto from CHANGELOG)"
echo "     - Deploy to Vercel (production)"
echo ""

read -p "Continue with release? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Release cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Creating release tag...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create annotated tag with message
CHANGELOG_SNIPPET=$(sed -n "/## \[$VERSION_NUMBER\]/,/## \[/p" CHANGELOG.md 2>/dev/null | head -n -1 || echo "See CHANGELOG.md for details")

git tag -a "$VERSION" -m "Release $VERSION" -m "$CHANGELOG_SNIPPET"

echo -e "${GREEN}✅ Tag created: $VERSION${NC}"
echo ""

# Push tag to origin
echo -e "${BLUE}📤 Pushing changes and tag to GitHub...${NC}"
git push origin main
git push origin "$VERSION"

echo -e "${GREEN}✅ Changes & Tag pushed to origin${NC}"
echo ""

# Final success
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Release $VERSION successfully created!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}🔗 Resources:${NC}"
echo "  📊 Build Status: https://github.com/$GITHUB_REPO/actions"
echo "  📦 GitHub Release: https://github.com/$GITHUB_REPO/releases/tag/$VERSION"
echo "  🌐 Live Demo: https://nawaetu.com"
echo ""
echo -e "${CYAN}⏳ Deployment Pipeline:${NC}"
echo "  1. GitHub Actions: Running tests & build..."
echo "  2. Creating GitHub Release with changelog..."
echo "  3. Deploying to Vercel (production)..."
echo "  4. ETA: ~3-5 minutes for live deployment"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Monitor build: https://github.com/$GITHUB_REPO/actions"
echo "  • Check deploy status: https://vercel.com"
echo "  • View live site: https://nawaetu.com"
echo ""
