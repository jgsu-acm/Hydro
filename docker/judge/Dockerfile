FROM node:lts-slim
WORKDIR /root
ADD packages/utils packages/utils
ADD packages/hydrooj packages/hydrooj
ADD packages/hydrojudge packages/hydrojudge
ADD LICENSE-AGPL3.txt LICENSE-AGPL3.txt

# Environment
ADD docker/judge/judge.yaml judge.yaml
RUN compiler="gcc g++ python python3 openjdk-11-jre-headless" && \
    build_deps="wget" && \
    apt-get -qq update && \
    apt-get install -y $compiler $build_deps && \
    wget https://github.com/criyle/go-judge/releases/download/v1.3.9/executorserver-amd64 -O /usr/bin/sandbox && \
    chmod +x /usr/bin/sandbox && \
    apt-get purge -y --auto-remove $build_deps && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Hydro
RUN prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/hydrojudge && \
    rm -rf packages

# Entrypoint
ADD docker/judge/entrypoint.sh entrypoint.sh
ENTRYPOINT bash /root/entrypoint.sh
