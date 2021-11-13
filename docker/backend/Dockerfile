FROM node:14
WORKDIR /root
ADD docker/backend/entrypoint.sh entrypoint.sh
ADD packages packages
RUN yarn global add pm2 file:/root/packages/utils file:/root/packages/hydrooj file:/root/packages/ui-default && \
    chmod +x entrypoint.sh
ENTRYPOINT /root/entrypoint.sh
