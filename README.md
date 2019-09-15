# GitHub Action: Run golangci-lint with reviewdog

[![Docker Image CI](https://github.com/reviewdog/action-golangci-lint/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/reviewdog/action-golangci-lint/actions)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/reviewdog/action-golangci-lint)](https://hub.docker.com/r/reviewdog/action-golangci-lint)
[![Docker Pulls](https://img.shields.io/docker/pulls/reviewdog/action-golangci-lint)](https://hub.docker.com/r/reviewdog/action-golangci-lint)

This action runs [golangci-lint](https://github.com/golangci/golangci-lint) with
[reviewdog](https://github.com/reviewdog/reviewdog) on pull requests to improve
code review experience.

## Inputs

### `github-token`

**Required**. Must be in form of `github-token: ${{ secrets.github_token }}`'.

### `golangci-lint-flags`

Optional. golangci-lint flags. (golangci-lint run --out-format=line-number
`<golangci-lint-flags>`)

Note that you can change golangci-lint behavior by [configuration
file](https://github.com/golangci/golangci-lint#configuration) too.

### `tool_name`

Optional. Tool name to use for reviewdog reporter. Useful when running multiple
actions with different config.

### `level`

Optional. Report level for reviewdog [info,warning,error].
It's same as `-level` flag of reviewdog.

## Example usage

### Minimum Usage Example

#### [.github/workflows/reviewdog.yml](.github/workflows/reviewdog.yml)

```yml
name: reviewdog
on: [pull_request]
jobs:
  golangci-lint:
    name: runner / golangci-lint
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v1
      - name: golangci-lint
        uses: docker://reviewdog/action-golangci-lint:v1
        with:
          github_token: ${{ secrets.github_token }}
```

### Advanced Usage Example

#### [.github/workflows/reviewdog.yml](.github/workflows/reviewdog.yml)

```yml
name: reviewdog
on: [pull_request]
jobs:
  # NOTE: golangci-lint doesn't report multiple errors on the same line from
  # different linters and just report one of the errors?

  golangci-lint:
    name: runner / golangci-lint
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v1
      - name: golangci-lint
        uses: docker://reviewdog/action-golangci-lint:v1 # Pre-built image
        # uses: reviewdog/action-golangci-lint@v1 # Build with Dockerfile
        # uses: docker://reviewdog/action-golangci-lint:v1.0.2 # Can use specific version.
        # uses: reviewdog/action-golangci-lint@v1.0.2 # Can use specific version.
        with:
          github_token: ${{ secrets.github_token }}
          # Can pass --config flag to change golangci-lint behavior.
          golangci_lint_flags: "--config=.github/.golangci.yml ./testdata"

  # Use golint via golangci-lint binary with "warning" level.
  golint:
    name: runner / golint
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v1
      - name: golint
        uses: docker://reviewdog/action-golangci-lint:v1
        with:
          github_token: ${{ secrets.github_token }}
          golangci_lint_flags: "--disable-all -E golint ./testdata"
          tool_name: golint # Change reporter name.
          level: warning # GitHub Status Check won't become failure with this level.

  # You can add more and more supported linters with different config.
  errcheck:
    name: runner / errcheck
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v1
      - name: errcheck
        uses: docker://reviewdog/action-golangci-lint:v1
        with:
          github_token: ${{ secrets.github_token }}
          golangci_lint_flags: "--disable-all -E errcheck ./testdata"
          tool_name: errcheck
          level: info
```
