FROM node:lts-alpine
ENV LANG zh_CN.utf8
WORKDIR /root
ADD packages packages
ADD docker/modify.js modify.js
ADD LICENSE-AGPL3.txt LICENSE
RUN apk add tzdata --no-cache
RUN node modify.js hydrooj && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/utils $prefix/hydrooj $prefix/ui-default $prefix/hydro-elastic $prefix/hydro-oicq && \
    rm -rf packages modify.js
ENTRYPOINT (test -e .hydro/init.sh && sh .hydro/init.sh && mv .hydro/init.sh .hydro/init.sh.used); \
    pm2-runtime start hydrooj
