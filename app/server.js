const http = require('http');
const app = require('./app');
const stories = require('./stories');
const hostname = '0.0.0.0';
const port = 3000;
// TODO control with environment var
const updateTime = 300;

// Set the timer to update stories on server load
// Every 300 seconds (5 minutes) - update the stories into the cache
setInterval(stories.update, updateTime * 1000);
stories.update();

app.set('port', port);

const server = http.createServer(app);

server.listen(port, hostname);
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
}
