#!/bin/bash

cd "$GITHUB_WORKSPACE"

export REVIEWDOG_GITHUB_API_TOKEN="$1"
GOLANGCI_LINT_FLAGS="$2"
TOOL_NAME="$3"

if [ -z "${REVIEWDOG_GITHUB_API_TOKEN}" ]; then
  echo "GITHUB_TOKEN not found"
  exit 1
fi

golangci-lint run --out-format line-number ${GOLANGCI_LINT_FLAGS} \
  | reviewdog -f=golangci-lint -name="${TOOL_NAME}" -reporter=github-pr-check
