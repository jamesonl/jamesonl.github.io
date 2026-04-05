#!/bin/sh

set -eu

ROOT_DIR=$(
  CDPATH= cd -- "$(dirname -- "$0")"
  pwd
)

cd "$ROOT_DIR"

if [ -d /opt/homebrew/opt/ruby/bin ]; then
  PATH="/opt/homebrew/opt/ruby/bin:$PATH"
  export PATH
fi

if ! command -v ruby >/dev/null 2>&1; then
  echo "Ruby is not installed or not on PATH."
  exit 1
fi

if ! command -v bundle >/dev/null 2>&1; then
  echo "Bundler is not installed for the active Ruby."
  echo "Install it with: gem install bundler"
  exit 1
fi

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-4000}

echo "Using Ruby: $(ruby -v)"
echo "Using Bundler: $(bundle --version)"

if ! bundle check >/dev/null 2>&1; then
  echo "Installing gem dependencies..."
  if ! bundle install; then
    echo "bundle install failed."
    echo "If this machine is still on the system Ruby, try:"
    echo "  export PATH=\"/opt/homebrew/opt/ruby/bin:\$PATH\""
    exit 1
  fi
fi

echo "Starting Jekyll at http://$HOST:$PORT"
exec bundle exec jekyll serve --livereload --host "$HOST" --port "$PORT" "$@"
