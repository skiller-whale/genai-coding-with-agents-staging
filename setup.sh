# First, get the directory of the current script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Go into app and game directories to set up git
cd "$DIR/app"
git init

cd "$DIR/game"
git init
