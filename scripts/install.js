const fs = require('fs')
const path = require('path')

const destination = path.join(process.cwd(), 'public')
const source = path.join(__dirname, '../public/worker.js')
if (fs.existsSync(destination) === false) {
  console.error('distination dirctory does not exists:', destination)
}

fs.copyFileSync(source, path.join(destination, 'worker.js'))

console.log('media recorder worker installed')
