const net = require('net')
const cluster = require('cluster')

module.exports = (laneID = 'default') => {
  const joinMsg = `lanes-${laneID}:join`
  const connectionMsg = `lanes-${laneID}:connection`
  const server = net.createServer({ pauseOnConnect: true }, route)
  let workers = []

  return { listen, join }

  function route(connection) {
    const worker = workerForIP(connection.remoteAddress)
    if (worker) {
      worker.send(connectionMsg, connection)
    }
  }

  function listen(...args) {
    cluster
      .on('message', (worker, msg, handle) => {
        if (msg === joinMsg) {
          workers.push(worker)
        }
      })
      .on('disconnect', (worker) => {
        const index = workers.indexOf(worker)
        if (index != -1) {
          workers.splice(index, 1)
        }
      })
    return server.listen(...args)
  }

  function join(server, done) {
    server.listen(0, 'localhost', done)
    process.send(joinMsg)
    process.on('message', (msg, conn) => {
      if (msg !== connectionMsg) return;
      server.emit('connection', conn)
      conn.resume()
    })
  }

  function workerForIP(ip) {
    const ipLen = ip.length
    let s = ''
    for (var i = 0; i < ipLen; i++) {
      if (!isNaN(ip[i])) {
        s += ip[i]
      }
    }
    return workers[Number(s) % workers.length]
  }
}
