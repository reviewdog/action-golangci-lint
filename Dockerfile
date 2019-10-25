FROM golang:1.13

RUN curl -sfL https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh    | sh -s -- -b $(go env GOPATH)/bin v0.9.13
RUN curl -sfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.21.0

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
