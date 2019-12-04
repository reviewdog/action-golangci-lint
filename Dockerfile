FROM golangci/golangci-lint:v1.21-alpine

RUN curl -sfL https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh    | sh -s -- -b $(go env GOPATH)/bin v0.9.14

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
