FROM ubuntu
WORKDIR /root
ADD packages packages
ADD docker/modify.js modify.js
ADD LICENSE-AGPL3.txt LICENSE
ADD https://github.com/criyle/go-judge/releases/latest/download/executorserver-amd64 /usr/bin/sandbox
RUN chmod +777 /usr/bin/sandbox && \
    apt-get update && \
    apt-get install -y gcc g++ python3 openjdk-11-jdk-headless curl && \
    curl -sL https://deb.nodesource.com/setup_16.x | sh && \
    apt-get install -y nodejs && \
    apt-get autoremove -y --purge curl && \
    apt clean && rm -rf /var/lib/apt/lists/* && \
    npm install -g yarn
RUN node modify.js hydrooj hydrojudge && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/hydrojudge && \
    rm -rf packages modify.js
ENTRYPOINT pm2 start "ulimit -s unlimited && sandbox" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && \
    pm2-runtime start hydrojudge
