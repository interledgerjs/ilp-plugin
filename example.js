const plugin = require('.')()

async function run () {
  await plugin.connect()
  await plugin.sendData(/* ... */)
  process.exit(0)
}

run()