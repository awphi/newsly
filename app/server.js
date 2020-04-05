const http = require('http');
const app = require('./app');
const stories = require('./story-manager');
const hostname = '0.0.0.0';
const port = 3000;

app.set('port', port);

const server = http.createServer(app);

stories
  .load()
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
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
  stories.load();
}
