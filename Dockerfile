FROM golangci/golangci-lint:v1.24-alpine

ENV REVIEWDOG_VERSION=v0.9.17

RUN wget -O - -q https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s -- -b $(go env GOPATH)/bin ${REVIEWDOG_VERSION}

RUN apk --no-cache add git

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
