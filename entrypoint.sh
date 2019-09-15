#!/bin/bash

cd "$GITHUB_WORKSPACE"

REVIEWDOG_GITHUB_API_TOKEN="$1"
GOLANGCI_LINT_FLAGS="$2"

if [ -z "${REVIEWDOG_GITHUB_API_TOKEN}" ]; then
  echo "GITHUB_TOKEN not found"
  exit 1
fi

golangci-lint run --out-format line-number ${GOLANGCI_LINT_FLAGS} \
  | reviewdog -f=golangci-lint -reporter=github-pr-check
