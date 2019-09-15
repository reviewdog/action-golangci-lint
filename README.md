# GitHub Action: Run golangci-lint with reviewdog

This action Run golangci-lint with reviewdog on pull requests to improve code review experience.

## Inputs

### `github-token`

**Required**. Must be in form of `github-token: ${{ secrets.github_token }}`'.

### `golangci-lint-flags`

Optional. golangci-lint flags. (golangci-lint run --out-format=line-number <golangci-lint-flags>)

## Example usage

```yml
uses: reviewdog/action-golang-ci-lint@master
with:
  github-token: ${{ secrets.github_token }}
```
