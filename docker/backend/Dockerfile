FROM node:14
WORKDIR /root
ADD docker/backend/entrypoint.sh entrypoint.sh
ADD docker/modify.js modify.js
ADD packages packages
RUN node modify.js hydrooj --production && \
    yarn global add pm2 file:/root/packages/utils file:/root/packages/hydrooj file:/root/packages/ui-default && \
    chmod +x entrypoint.sh
ENTRYPOINT /root/entrypoint.sh
