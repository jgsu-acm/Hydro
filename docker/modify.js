const fs = require('fs');
for (let i = 2; i < process.argv.length; i++) {
    const path = `packages/${process.argv[i]}/package.json`;
    const data_target = JSON.parse(fs.readFileSync(path).toString());
    const data_utils = JSON.parse(fs.readFileSync('packages/utils/package.json').toString());
    data_target['dependencies']['@hydrooj/utils'] = data_utils['version'];
    fs.writeFileSync(path, JSON.stringify(data_target, null, 4));
}
