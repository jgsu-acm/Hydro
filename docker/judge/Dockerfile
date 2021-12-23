FROM node:lts-slim
WORKDIR /root
ADD packages packages
ADD LICENSE-AGPL3.txt LICENSE

# Environment
RUN compiler="gcc g++ python python3 openjdk-11-jre-headless" && \
    build_deps="wget" && \
    apt-get -qq update && \
    apt-get install -y $compiler $build_deps && \
    wget "https://github.com/criyle/go-judge/releases/latest/download/executorserver-amd64" -O /usr/bin/sandbox && \
    chmod +x /usr/bin/sandbox && \
    apt-get purge -y --auto-remove $build_deps && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Hydro
RUN prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrojudge && \
    rm -rf packages

# Entrypoint
ENTRYPOINT pm2 start "ulimit -s unlimited && sandbox" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && pm2-runtime start hydrojudge
