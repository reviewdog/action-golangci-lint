#!/bin/sh

cd "$GITHUB_WORKSPACE" || exit 1

export REVIEWDOG_GITHUB_API_TOKEN="${INPUT_GITHUB_TOKEN}"

git config --global url."https://${ORG_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"

# shellcheck disable=SC2086
golangci-lint run --out-format line-number ${INPUT_GOLANGCI_LINT_FLAGS} \
  | reviewdog -f=golangci-lint -name="${INPUT_TOOL_NAME}" -reporter="${INPUT_REPORTER:-github-pr-check}" -level="${INPUT_LEVEL}"
