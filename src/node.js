/*
  eslint-disable no-empty, global-require, import/no-dynamic-require,
  no-console, no-confusing-arrow, prefer-object-spread/prefer-object-spread
*/

const fs = require('fs')
const path = require('path')
const template = require('./content.template')

var args = process.argv.slice(2)
const rootDir = args.find(arg => arg.indexOf('--dir=') === 0).split('--dir=')[1]
const output = args.find(arg => arg.indexOf('--output=') === 0).split('--output=')[1]

if (!rootDir) {
  console.error('Please specify a root directory when running the script from terminal by including `--dir=./root-dir` in your script.')
  return false
}

if (!output) {
  console.error('Please specify an output file when running the script from terminal by including `--output=output-dir/output.js` in your script.')
  return false
}

const traverseDirectoryTree = (root) => fs.readdirSync(root).map((key) => {
  let content
  if (!fs.statSync(path.resolve(root, key)).isDirectory()) {
    try {
      content = path.resolve(root, key)
    } catch (e) {
      console.error(e)
    }
  } else {
    content = traverseDirectoryTree(`${root}/${key}`)
  }

  return {
    content,
    key
  }
})

const content = traverseDirectoryTree(rootDir)

Promise.all(content)
  .then(data => template({ content: data }).replace(/\n\s+\n/g, '\n'))
  .then(data => fs.writeFileSync(path.resolve(output), data, 'utf8'))
  .then(() => {
    console.info(`📦  => Wrote ${output} for @anz/static-cms`)
    process.exit()
  })
  .catch(console.error)
