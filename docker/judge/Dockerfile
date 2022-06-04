FROM alpine
WORKDIR /root
ADD packages packages
ADD docker/modify.js modify.js
ADD LICENSE-AGPL3.txt LICENSE
ADD https://github.com/criyle/go-judge/releases/download/v1.4.7/executorserver_1.4.7_linux_amd64.apk sandbox.apk
RUN apk add --no-cache sandbox.apk --allow-untrusted && \
    apk add --no-cache gcc g++ openjdk11-jdk python3 nodejs yarn && \
    node modify.js hydrooj hydrojudge && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/hydrojudge && \
    yarn cache clean && apk del yarn && rm -rf packages modify.js sandbox.apk
ENTRYPOINT pm2 start "ulimit -s unlimited && executorserver" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && \
    pm2-runtime start hydrojudge
