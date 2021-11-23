FROM node:14
WORKDIR /root
ADD docker/backend/entrypoint.sh entrypoint.sh
ADD packages packages
# 必须组件
RUN yarn global add pm2 file:/root/packages/utils file:/root/packages/hydrooj file:/root/packages/ui-default
# 可选组件
RUN yarn global add file:/root/packages/import-qduoj file:/root/packages/vjudge \
    file:/root/packages/onlyoffice && \
    hydrooj addon add @hydrooj/import-qduoj && hydrooj addon add @hydrooj/vjudge && \
    hydrooj addon add @hydrooj/onlyoffice
RUN chmod +x /root/entrypoint.sh
ENTRYPOINT /root/entrypoint.sh