FROM node:lts-slim
WORKDIR /root
ADD packages packages
ADD LICENSE-AGPL3.txt LICENSE

# Hydro
RUN prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/ui-default \
    hydro-pdf-preview \
    $prefix/vjudge \
    $prefix/onlyoffice \
    $prefix/sonic && \
    rm -rf packages

# Entrypoint
ADD docker/backend/entrypoint.sh entrypoint.sh
ENTRYPOINT bash /root/entrypoint.sh
