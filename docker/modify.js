const fs = require("fs")
const PATH = "packages/"+ process.argv[2] +"/package.json"
data_oj = JSON.parse(fs.readFileSync(PATH))
data_ut = JSON.parse(fs.readFileSync("packages/utils/package.json"))
data_oj["dependencies"]["@hydrooj/utils"] = data_ut["version"]
fs.writeFileSync(PATH, JSON.stringify(data_oj, null, 4))