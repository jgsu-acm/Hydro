FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18-bullseye
ADD https://github.com/criyle/go-judge/releases/download/v1.6.3/executorserver_1.6.3_linux_amd64 /usr/bin/sandbox
RUN npm install -g pm2 && apt-get update && apt-get install gcc g++ && chmod +x /usr/bin/sandbox
ENTRYPOINT pm2 start sandbox && sleep infinity
