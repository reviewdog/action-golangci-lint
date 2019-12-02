#!/bin/bash

cd "$GITHUB_WORKSPACE"

export REVIEWDOG_GITHUB_API_TOKEN="${INPUT_GITHUB_TOKEN}"

golangci-lint run --out-format line-number ${INPUT_GOLANGCI_LINT_FLAGS} \
  | reviewdog -f=golangci-lint -name="${INPUT_TOOL_NAME}" -reporter=${INPUT_REPORTER} -level="${INPUT_LEVEL}"
