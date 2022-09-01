FROM ghcr.io/jgsu-acm/oj-compiler:main
WORKDIR /root
ADD docker/modify.js modify.js
ADD LICENSE-AGPL3.txt LICENSE
ADD packages packages
RUN node modify.js hydrooj hydrojudge && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/hydrojudge && \
    yarn cache clean && apt-get autoremove -qq -y --purge curl yarn && rm -rf packages modify.js
ENTRYPOINT pm2 start "ulimit -s unlimited && sandbox" --name hydro-sandbox -- -mount-conf /root/.config/hydro/mount.yaml && \
    pm2-runtime start hydrojudge
