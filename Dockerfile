FROM golang:1.14

ENV REVIEWDOG_VERSION=v0.10.0
ENV GOLANGCI_VERSION=v1.27.0

RUN wget -O - -q https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s -- -b $(go env GOPATH)/bin ${REVIEWDOG_VERSION}
RUN wget -O - -q https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin ${GOLANGCI_VERSION}

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
