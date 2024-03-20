const fs = require('fs');

const dataRegister = JSON.parse(fs.readFileSync('packages/register/package.json').toString());
const dataUtils = JSON.parse(fs.readFileSync('packages/utils/package.json').toString());
for (let i = 2; i < process.argv.length; i++) {
    const path = `packages/${process.argv[i]}/package.json`;
    const dataTarget = JSON.parse(fs.readFileSync(path).toString());
    dataTarget['dependencies']['@hydrooj/utils'] = dataUtils['version'];
    fs.writeFileSync(path, JSON.stringify(dataTarget, null, 4));
}
dataUtils['dependencies']['@hydrooj/register'] = dataRegister['version'];
fs.writeFileSync('packages/utils/package.json', JSON.stringify(dataUtils, null, 4));
