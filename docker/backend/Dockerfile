FROM alpine
WORKDIR /root
ADD docker/modify.js modify.js
ADD LICENSE LICENSE
ADD packages packages
RUN apk add --no-cache tzdata nodejs yarn && \
    node modify.js hydrooj && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/register $prefix/utils $prefix/hydrooj $prefix/ui-default $prefix/api && \
    yarn cache clean && rm -rf packages modify.js
ENTRYPOINT (test -e .hydro/init.sh && sh .hydro/init.sh && mv .hydro/init.sh .hydro/init.sh.used); \
    pm2-runtime start hydrooj
