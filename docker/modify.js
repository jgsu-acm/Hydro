const fs = require('fs');
const PATH = `packages/${process.argv[2]}/package.json`;
const data_oj = JSON.parse(fs.readFileSync(PATH).toString());
const data_ut = JSON.parse(fs.readFileSync('packages/utils/package.json').toString());
data_oj['dependencies']['@hydrooj/utils'] = data_ut['version'];
fs.writeFileSync(PATH, JSON.stringify(data_oj, null, 4));
