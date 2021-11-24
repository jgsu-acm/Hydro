#!/bin/sh

ROOT=/root/.hydro
mkdir -p $ROOT

if [ ! -f "$ROOT/addon.json" ]; then
    hydrooj addon add @hydrooj/ui-default
    hydrooj addon add @hydrooj/import-qduoj
    hydrooj addon add @hydrooj/vjudge
    hydrooj addon add @hydrooj/onlyoffice
    hydrooj addon add @hydrooj/sonic
fi

if [ ! -f "$ROOT/config.json" ]; then
    # TODO 变成变量
    echo '{"host": "oj-mongo", "port": "27017", "name": "hydro", "username": "", "password": ""}' >"$ROOT/config.json"
fi

if [ ! -f "$ROOT/first" ]; then
    echo "for marking use only!" >"$ROOT/first"
    hydrooj cli system set file.accessKey "$ACCESS_KEY"
    hydrooj cli system set file.secretKey "$SECRET_KEY"
    hydrooj cli system set file.endPoint http://oj-minio:9000/
    hydrooj cli system set sonic.host oj-sonic

    hydrooj cli user create systemadmin@systemjudge.local root rootroot 2
    hydrooj cli user setSuperAdmin 2
    hydrooj cli user create systemjudge@systemjudge.local judger judgerjudger 3
    hydrooj cli user setJudge 3
fi

pm2-runtime start hydrooj
