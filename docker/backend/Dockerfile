FROM node:lts-slim
WORKDIR /root
ADD packages packages
ADD LICENSE-AGPL3.txt LICENSE

# Hydro
RUN prefix="file:/root/packages" && \
    yarn global add pm2 \
    $prefix/utils $prefix/hydrooj $prefix/ui-default \
    $prefix/elastic && \
    rm -rf packages

# Entrypoint
ENTRYPOINT (test -e /root/.hydro/init.sh && \
    sh /root/.hydro/init.sh && \
    mv /root/.hydro/init.sh /root/.hydro/init.sh.used); \
    pm2-runtime start hydrooj
