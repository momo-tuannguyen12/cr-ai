#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Function to check if command was successful
check_success() {
  if [ $? -eq 0 ]; then
    print_message "$GREEN" "✓ Success: $1"
  else
    print_message "$RED" "✗ Error: $1"
    exit 1
  fi
}

# Display help message
show_help() {
  echo "Usage: ./publish.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help       Show this help message"
  echo "  -v, --version    Version type to bump (patch, minor, major)"
  echo "  -m, --message    Commit message (default: 'Bump version')"
  echo "  -d, --dry-run    Perform a dry run without publishing"
  echo "  -t, --tag        NPM tag (default: latest)"
  echo "  --no-git         Skip git commit and push"
  echo ""
  echo "Examples:"
  echo "  ./publish.sh -v patch"
  echo "  ./publish.sh -v minor -m 'Add new features'"
  echo "  ./publish.sh -v major -t beta --no-git"
  exit 0
}

# Default values
VERSION_TYPE="patch"
COMMIT_MESSAGE="Bump version"
DRY_RUN=false
NPM_TAG="latest"
SKIP_GIT=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -h|--help)
      show_help
      ;;
    -v|--version)
      VERSION_TYPE="$2"
      shift
      shift
      ;;
    -m|--message)
      COMMIT_MESSAGE="$2"
      shift
      shift
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    -t|--tag)
      NPM_TAG="$2"
      shift
      shift
      ;;
    --no-git)
      SKIP_GIT=true
      shift
      ;;
    *)
      print_message "$RED" "Unknown option: $1"
      show_help
      ;;
  esac
done

# Validate version type
if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
  print_message "$RED" "Invalid version type: $VERSION_TYPE. Must be patch, minor, or major."
  exit 1
fi

# Check if we're in a git repository
if [ "$SKIP_GIT" = false ]; then
  if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_message "$YELLOW" "Warning: Not in a git repository. Git operations will be skipped."
    SKIP_GIT=true
  fi
fi

# Check for uncommitted changes
if [ "$SKIP_GIT" = false ]; then
  if [ -n "$(git status --porcelain)" ]; then
    print_message "$YELLOW" "Warning: You have uncommitted changes."
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_message "$RED" "Publishing aborted."
      exit 1
    fi
  fi
fi

# Start the publishing process
print_message "$BLUE" "Starting publishing process..."

# Run tests if they exist
if grep -q '"test"' package.json; then
  print_message "$BLUE" "Running tests..."
  if [ "$DRY_RUN" = false ]; then
    npm test
    check_success "Tests completed"
  else
    print_message "$YELLOW" "[DRY RUN] Would run: npm test"
  fi
fi

# Update version
print_message "$BLUE" "Updating version ($VERSION_TYPE)..."
if [ "$DRY_RUN" = false ]; then
  npm version $VERSION_TYPE --no-git-tag-version
  check_success "Version updated"
  NEW_VERSION=$(node -p "require('./package.json').version")
  print_message "$GREEN" "New version: $NEW_VERSION"
else
  print_message "$YELLOW" "[DRY RUN] Would run: npm version $VERSION_TYPE --no-git-tag-version"
  NEW_VERSION="x.y.z (dry run)"
fi

# Git commit and tag if not skipped
if [ "$SKIP_GIT" = false ]; then
  print_message "$BLUE" "Committing changes to git..."
  if [ "$DRY_RUN" = false ]; then
    git add package.json package-lock.json
    git commit -m "$COMMIT_MESSAGE: $NEW_VERSION"
    check_success "Changes committed"
    
    git tag "v$NEW_VERSION"
    check_success "Tag created: v$NEW_VERSION"
  else
    print_message "$YELLOW" "[DRY RUN] Would run: git commit and tag for version $NEW_VERSION"
  fi
fi

# Publish to npm
print_message "$BLUE" "Publishing to npm with tag: $NPM_TAG..."
if [ "$DRY_RUN" = false ]; then
  npm publish --tag $NPM_TAG
  check_success "Package published to npm"
else
  print_message "$YELLOW" "[DRY RUN] Would run: npm publish --tag $NPM_TAG"
fi

# Push to git if not skipped
if [ "$SKIP_GIT" = false ]; then
  print_message "$BLUE" "Pushing changes to git..."
  if [ "$DRY_RUN" = false ]; then
    git push
    check_success "Changes pushed"
    
    git push --tags
    check_success "Tags pushed"
  else
    print_message "$YELLOW" "[DRY RUN] Would run: git push and git push --tags"
  fi
fi

print_message "$GREEN" "✨ Publishing process completed successfully! ✨"
print_message "$GREEN" "Package: $(node -p "require('./package.json').name")@$NEW_VERSION"

exit 0
