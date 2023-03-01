echo '{"host":"mongo","port":"27017","name":"hydro","username":"","password":""}' >$HOME/.hydro/config.json
echo '["@hydrooj/ui-default","@hydrooj/hydrojudge"]' >$HOME/.hydro/addon.json
yarn install
npx hydrooj cli system set server.port 2333
npx hydrooj cli user create root@hydro.local root rootroot 2
npx hydrooj cli user setSuperAdmin 2
