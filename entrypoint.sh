#!/bin/bash

cd "$GITHUB_WORKSPACE"

export REVIEWDOG_GITHUB_API_TOKEN="$1"
GOLANGCI_LINT_FLAGS="$2"
TOOL_NAME="$3"
LEVEL="$4"

if [ -z "${REVIEWDOG_GITHUB_API_TOKEN}" ]; then
  if [ -z "${INPUT_GITHUB_TOKEN}" ]; then
    echo "INPUT_GITHUB_TOKEN not found"
    exit 1
  else
    export REVIEWDOG_GITHUB_API_TOKEN="${INPUT_GITHUB_TOKEN}"
  fi
fi

golangci-lint run --out-format line-number ${GOLANGCI_LINT_FLAGS} \
  | reviewdog -f=golangci-lint -name="${TOOL_NAME}" -reporter=github-pr-check -level="${LEVEL}"
