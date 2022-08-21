# Don't use alpine, will cause any submitted code to be accepted
FROM ubuntu
WORKDIR /root
ADD packages packages
ADD docker/modify.js modify.js
ADD LICENSE-AGPL3.txt LICENSE
ADD https://github.com/criyle/go-judge/releases/download/v1.5.1/executorserver_1.5.1_linux_amd64 /usr/bin/sandbox
RUN chmod +x /usr/bin/sandbox && \
    apt-get -qq update && \
    apt-get install -qq -y gcc g++ python3 pypy3 openjdk-11-jdk-headless curl && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash && \
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get -qq update && apt-get -qq -y install nodejs yarn && \
    node modify.js hydrooj hydrojudge && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/hydrojudge && yarn cache clean && \
    apt-get autoremove -qq -y --purge curl yarn && apt-get clean && rm -rf /var/lib/apt/lists/* && rm -rf packages modify.js
ENTRYPOINT pm2 start "ulimit -s unlimited && sandbox" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && \
    pm2-runtime start hydrojudge
