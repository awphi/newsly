const http = require('http');
const app = require('./app/app');
const storyManager = require('./app/story-manager');
const nodeCleanup = require('node-cleanup');

const hostname = '0.0.0.0';
const port = 3000;

app.set('port', port);

const server = http.createServer(app);

storyManager
  .loadAll()
  .then(() => server.listen(port, hostname))
  .catch((e) => console.error(e));

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  if (error.code === 'EACCES') {
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
  } else if (error.code === 'EADDRINUSE') {
    console.error(bind + ' is already in use');
    process.exit(1);
  } else {
    throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

nodeCleanup(function (exitCode, signal) {
  if (signal) {
    storyManager.saveAll().then(() => {
      process.kill(process.pid, signal);
    });
    nodeCleanup.uninstall(); // don't call cleanup handler again
    return false;
  }
});
