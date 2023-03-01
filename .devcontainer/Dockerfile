FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18-bullseye
ADD https://github.com/criyle/go-judge/releases/download/v1.6.3/executorserver_1.6.3_linux_amd64 /usr/bin/sandbox
RUN apt-get update && apt-get install gcc g++ && chmod +x /usr/bin/sandbox && \
    mkdir -p /home/node/.hydro /data/file && chown -R node:node /home/node/.hydro /data/file
ENTRYPOINT sandbox
