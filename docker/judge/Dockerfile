FROM node:14
WORKDIR /root
# RUN sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list
# RUN sed -i 's/security.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list
RUN apt-get -qq update && \
    apt-get install -y gcc g++ python python3 openjdk-8-jdk-headless \
    fp-compiler \
    php7.0-cli \
    rustc \
    haskell-platform \
    libjavascriptcoregtk-4.0-bin \
    golang \
    ruby \
    mono-runtime \
    mono-mcs

ADD docker/judge/entrypoint.sh entrypoint.sh
ADD docker/judge/judge.yaml judge.yaml
ADD packages/utils packages/utils
ADD packages/hydrooj packages/hydrooj
ADD packages/hydrojudge packages/hydrojudge
RUN yarn global add pm2 file:/root/packages/utils file:/root/packages/hydrooj file:/root/packages/hydrojudge && \
    wget https://s3.undefined.moe/file/executor-amd64 -O /usr/bin/sandbox && \
    chmod +x /usr/bin/sandbox && chmod +x entrypoint.sh
ENTRYPOINT /root/entrypoint.sh
