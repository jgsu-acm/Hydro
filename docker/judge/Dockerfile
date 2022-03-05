FROM node:lts-slim
WORKDIR /root
ADD packages packages
ADD LICENSE-AGPL3.txt LICENSE
ADD https://github.com/criyle/go-judge/releases/latest/download/executorserver-amd64 /usr/bin/sandbox

# Environment
RUN apt -qq update && \
    apt install -y gcc g++ python3 openjdk-11-jdk-headless && \
    apt clean && rm -rf /var/lib/apt/lists/* && \
    chmod +x /usr/bin/sandbox

# Hydro
RUN prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrojudge && \
    rm -rf packages

# Entrypoint
ENTRYPOINT pm2 start "ulimit -s unlimited && sandbox" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && pm2-runtime start hydrojudge
