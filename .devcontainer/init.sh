cfgdir="${HOME}/.hydro"
if [ ! -f $cfgdir/config.json ]; then
    echo '{"host":"mongo","port":"27017","name":"hydro","username":"","password":""}' >$cfgdir/config.json
fi
if [ ! -f $cfgdir/addon.json ]; then
    echo '["@hydrooj/ui-default","@hydrooj/hydrojudge"]' >$cfgdir/addon.json
fi
yarn install
npx hydrooj cli system set server.port 2333
npx hydrooj cli user create root@hydro.local root rootroot 2
npx hydrooj cli user setSuperAdmin 2
