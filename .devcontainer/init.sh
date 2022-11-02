git config --global --add safe.directory /workspace
yarn install
npx hydrooj cli system set server.port 2333
npx hydrooj cli system set hydro-elastic.host elastic
npx hydrooj cli user create root@hydro.local root rootroot 2
npx hydrooj cli user setSuperAdmin 2
