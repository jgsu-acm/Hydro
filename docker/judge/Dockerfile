FROM stagoh/jgsuoj-judge-base
WORKDIR /root
ADD docker/modify.js modify.js
ADD LICENSE LICENSE
ADD packages packages
RUN node modify.js hydrooj hydrojudge && \
    prefix="file:/root/packages" && \
    yarn global add pm2 $prefix/register $prefix/utils $prefix/hydrooj $prefix/hydrojudge && \
    yarn cache clean && rm -rf packages modify.js
ENTRYPOINT pm2 start sandbox --name hydro-sandbox -- -enable-debug -mount-conf /root/.config/hydro/mount.yaml  && \
    pm2-runtime start hydrojudge
