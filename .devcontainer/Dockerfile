FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18-bullseye
ADD https://github.com/criyle/go-judge/releases/download/v1.5.1/executorserver_1.5.1_linux_amd64 /usr/bin/sandbox
RUN npm install -g pm2 && \
    sudo apt-get update && sudo apt-get install gcc g++ && \
    mkdir -p /root/.hydro /data/file && \
    chmod 777 /root /root/.hydro /data/file /usr/bin/sandbox && \
    echo '{"host":"mongo","port":"27017","name":"hydro","username":"","password":""}' > /root/.hydro/config.json && \
    echo '["@hydrooj/ui-default","@hydrooj/hydrojudge","hydro-elastic","hydro-oicq"]' > /root/.hydro/addon.json
ENTRYPOINT pm2 start sandbox && sleep infinity
