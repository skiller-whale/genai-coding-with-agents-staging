# First, get the directory of the current script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set git to use 'main' as the default branch name to avoid warnings
git config --global init.defaultBranch main

# Go into app and flowers directories to set up git
cd "$DIR/app"
git init

cd "$DIR/flowers"
git init
