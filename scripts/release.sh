#!/bin/bash

# Nawaetu Release Script
# Usage: ./scripts/release.sh v1.2.0
# or: npm run release -- v1.2.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if version argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Version argument required${NC}"
    echo -e "${BLUE}Usage: $0 <version>${NC}"
    echo -e "${BLUE}Example: $0 v1.2.0${NC}"
    exit 1
fi

VERSION=$1

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

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Error: Working directory has uncommitted changes${NC}"
    echo -e "${YELLOW}Commit or stash changes before releasing${NC}"
    git status
    exit 1
fi

# Check if there are unpushed commits
if [ -z "$(git log origin/main..HEAD)" ]; then
    echo -e "${BLUE}✅ All commits are pushed${NC}"
else
    echo -e "${RED}❌ Error: You have unpushed commits${NC}"
    echo -e "${YELLOW}Push changes first with: git push${NC}"
    git log origin/main..HEAD --oneline
    exit 1
fi

# Confirm version bump
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Nawaetu Release: $VERSION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Current branch: ${GREEN}$CURRENT_BRANCH${NC}"
echo -e "Release version: ${YELLOW}$VERSION${NC}"
echo ""

# Show what will happen
echo -e "${BLUE}This will:${NC}"
echo "  1. Create annotated git tag: $VERSION"
echo "  2. Push tag to origin"
echo "  3. Trigger GitHub Actions workflows"
echo "  4. Auto-create GitHub Release with changelog"
echo "  5. Auto-deploy to Vercel"
echo ""

read -p "Continue with release? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Release cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Creating release tag...${NC}"

# Create annotated tag with message
git tag -a "$VERSION" -m "Release $VERSION"

echo -e "${GREEN}✅ Tag created: $VERSION${NC}"
echo ""

# Push tag to origin
echo -e "${BLUE}📤 Pushing tag to origin...${NC}"
git push origin "$VERSION"

echo -e "${GREEN}✅ Tag pushed to origin${NC}"
echo ""

# Show success info
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Release $VERSION successfully created!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🔗 Resources:${NC}"
echo "  📊 Build Status: https://github.com/$GITHUB_REPOSITORY/actions"
echo "  📦 Release Page: https://github.com/$GITHUB_REPOSITORY/releases/tag/$VERSION"
echo "  🌐 Live Demo: https://nawaetu.com"
echo ""
echo -e "${BLUE}⏳ What's happening:${NC}"
echo "  1. GitHub Actions build workflow starting..."
echo "  2. Tests running..."
echo "  3. Release notes auto-generated from CHANGELOG.md"
echo "  4. Deploying to Vercel in ~2-5 minutes"
echo ""
echo -e "${YELLOW}💡 Tip: Check GitHub Actions for build status${NC}"
