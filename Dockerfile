FROM golangci/golangci-lint:v1.30-alpine

ENV REVIEWDOG_VERSION=v0.10.1

RUN wget -O - -q https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s -- -b $(go env GOPATH)/bin ${REVIEWDOG_VERSION}

RUN apk --no-cache add git

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
