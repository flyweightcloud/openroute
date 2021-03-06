
const glob = require("glob");
const yaml = require('js-yaml');
const fs = require('fs/promises')


function findAllYaml() {
    return new Promise((resolve, reject) => {
        glob("**/*.yaml", {nodir: true}, (err, files) => {
            if (err) return reject(err)
            resolve(files)
        })
    })
}

async function main() {
    let files = await findAllYaml()
    for (let i=0; i < files.length; i++) {
        const file = files[i]
        const out = file.replace(/yaml$/, 'ts')
        const doc = yaml.load(await fs.readFile(file, 'utf-8'))
        const content = "// Do not edit this file, it was created from a YAML file\nexport default " + JSON.stringify(doc, null, 2);
        await fs.writeFile(out, content)
        console.log(`Converted ${file} <=> ${out}`)
    }
}


main().then(() => {
    console.log('YAML to JS Conversion complete')
}).catch((err) => {
    console.log("err:", err)
    process.exit(1)
})