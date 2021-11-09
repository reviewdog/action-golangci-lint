# GitHub Action: Run golangci-lint with reviewdog

[![release](https://github.com/reviewdog/action-golangci-lint/workflows/release/badge.svg)](https://github.com/reviewdog/action-golangci-lint/actions?query=workflow%3Arelease)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/reviewdog/action-golangci-lint?logo=github&sort=semver)](https://github.com/reviewdog/action-golangci-lint/releases)
[![action-bumpr supported](https://img.shields.io/badge/bumpr-supported-ff69b4?logo=github&link=https://github.com/haya14busa/action-bumpr)](https://github.com/haya14busa/action-bumpr)

This action runs [golangci-lint](https://github.com/golangci/golangci-lint) with
[reviewdog](https://github.com/reviewdog/reviewdog) on pull requests to improve
code review experience.

[![annotation on diff tab example](https://user-images.githubusercontent.com/3797062/64919877-27692780-d7eb-11e9-9791-1e9933fbb132.png)](https://github.com/reviewdog/action-golangci-lint/pull/10/files#annotation_6204126662041266)
[![check tab example](https://user-images.githubusercontent.com/3797062/64919922-d279e100-d7eb-11e9-800d-9cef86c670df.png)](https://github.com/reviewdog/action-golangci-lint/pull/10/checks?check_run_id=222708776)
[![status check example](https://user-images.githubusercontent.com/3797062/64919933-0b19ba80-d7ec-11e9-96cc-f6558f04924f.png)](https://github.com/reviewdog/action-golangci-lint/pull/10)

## Migrating from v1 to v2

In many cases, you need to do nothing. Just use `reviewdog/action-golangci-lint@v2` instead of `reviewdog/action-golangci-lint@v1`.

If your workflow have steps for setting up Go and caching go modules, they are no longer needed.
`reviewdog/action-golangci-lint@v2` now set up Go and cache modules automatically, so remove these steps.

```yaml
on: [pull_request]
jobs:
  golangci-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v2

      # no need with v2
      # - name: Set up Go
      #   uses: actions/setup-go@v2
      #   with:
      #     go-version: '1.17'

      # no need with v2
      # - uses: actions/cache@v2
      #   with:
      #     path: |
      #         ~/.cache/golangci-lint
      #         ~/.cache/go-build
      #         ~/go/pkg/mod
      #     key: ${{ runner.os }}-golangcilint-${{ hashFiles('**/go.sum') }}
      #     restore-keys: |
      #       ${{ runner.os }}-golangcilint-

      - name: golangci-lint
        uses: reviewdog/action-golangci-lint@v2
```

## Inputs

### `github_token`

**Required**. Default is `${{ github.token }}`.

### `golangci_lint_flags`

Optional. golangci-lint flags. (golangci-lint run --out-format=line-number
`<golangci_lint_flags>`)

Note that you can change golangci-lint behavior by [configuration
file](https://github.com/golangci/golangci-lint#configuration) too.

### `tool_name`

Optional. Tool name to use for reviewdog reporter. Useful when running multiple
actions with different config.

### `level`

Optional. Report level for reviewdog [info,warning,error].
It's same as `-level` flag of reviewdog.

### `workdir`

Optional. Working directory relative to the root directory.

### `reporter`

Optional. Reporter of reviewdog command [github-pr-check,github-pr-review].
It's same as `-reporter` flag of reviewdog.

### `filter_mode`

Optional. Filtering mode for the reviewdog command [added,diff_context,file,nofilter].
Default is added.

### `fail_on_error`

Optional. Exit code for reviewdog when errors are found [`true`, `false`]
Default is `false`.

### `reviewdog_flags`

Optional. Additional reviewdog flags

### `go_version`

Optional. Install a specific version of Go.
By default, the latest version of Go 1.x is installed.

### `cache`

Optional. [`true`, `false`]
It enables cache. The action caches `~/.cache/golangci-lint`, `~/.cache/go-build`, `~/go/pkg/mod`.
Default is `true`.

### `reviewdog_version`

Optional. Install a specific version of reviewdog.
By default, the latest version of reviewdog is installed.

### `golangci_lint_version`

Optional. Install a specific version of golangci-lint.
By default, the latest version of golangci-lint is installed.

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
        uses: actions/checkout@v2

      - name: golangci-lint
        uses: reviewdog/action-golangci-lint@v2
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
        uses: actions/checkout@v2
      - name: golangci-lint
        uses: reviewdog/action-golangci-lint@v2
        with:
          # optionally use a specific version of Go rather than the latest one
          go_version: '1.17'

          # Can pass --config flag to change golangci-lint behavior and target
          # directory.
          golangci_lint_flags: '--config=.github/.golangci.yml ./testdata'
          workdir: subdirectory/

  # Use golint via golangci-lint binary with "warning" level.
  golint:
    name: runner / golint
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v2
      - name: golint
        uses: reviewdog/action-golangci-lint@v2
        with:
          golangci_lint_flags: '--disable-all -E golint'
          tool_name: golint # Change reporter name.
          level: warning # GitHub Status Check won't become failure with this level.

  # You can add more and more supported linters with different config.
  errcheck:
    name: runner / errcheck
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v2
      - name: errcheck
        uses: reviewdog/action-golangci-lint@v2
        with:
          golangci_lint_flags: '--disable-all -E errcheck'
          tool_name: errcheck
          level: info

  # Disable cache of golangci-lint result, go build and go dependencies
  with_cache:
    name: runner / errcheck
    runs-on: ubuntu-latest
    steps:
      - name: Check out code into the Go module directory
        uses: actions/checkout@v2

      - name: golangci-lint
        uses: reviewdog/action-golangci-lint@v2
        with:
          cache: false
```

### All-in-one golangci-lint configuration without config file

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
        uses: actions/checkout@v2
      - name: golangci-lint
        uses: reviewdog/action-golangci-lint@v2
        with:
          golangci_lint_flags: '--enable-all --exclude-use-default=false'
```
