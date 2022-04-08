FROM golang:alpine AS builder
ENV version=1.4.5
ADD https://github.com/criyle/go-judge/archive/refs/tags/v${version}.zip /go/judge.zip
RUN apk add --no-cache git && \
    unzip /go/judge.zip -d /go && \
    mv go-judge-${version} go-judge
WORKDIR /go/go-judge
RUN go mod download -x && \
    CGO_ENABLE=0 go build -v -tags nomsgpack -o sandbox ./cmd/executorserver

FROM node:lts-alpine
WORKDIR /root
ADD packages packages
ADD docker/modify.js modify.js
ADD LICENSE-AGPL3.txt LICENSE
COPY --from=builder /go/go-judge/sandbox /bin/sandbox
RUN apk add --no-cache gcc g++ python3 openjdk17-jdk && \
    chmod +x /bin/sandbox
RUN node modify.js hydrojudge && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrojudge && \
    rm -rf packages modify.js
ENTRYPOINT pm2 start "ulimit -s unlimited && sandbox" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && \
    pm2-runtime start hydrojudge
