# Lanes

Simple, generic, sticky routing for clustered Node.js apps, compatible with:

- Express
- Socket.io
- SockJS
- Cluster
- probably everything else

```js
const lanes = require('lanes')()
const throng = require('throng')

// Use Cluster however you want
// I use the 'throng' module to fork clustered workers
throng({ workers: 3, master: master, start: worker })

function master() {
  // listen() in the master process (this is the router)
  lanes.listen(process.env.PORT || 5000, () => {
    console.log(`Master listening on ${PORT}`))
  }
}

function worker(id) {
  const server = http.createServer((req, res) => {
    res.end(`Hello from worker ${id}`)
  })

  // join() your server to the router in the worker process
  // (where you would normally run `server.listen()`)
  lanes.join(server, () => {
    console.log(`Worker ${id} joined`)
  })
}
```

## API

### listen(port, callback)

Starts listening on `port` in the master process

### join(server, callback)

Starts routing requests to `server` in a worker process
