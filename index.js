const fs = require('fs');

const privateKey = fs.readFileSync('ssl-cert/privkey.pem', 'utf8');
const certificate = fs.readFileSync('ssl-cert/fullchain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };
const https = require('https');

const httpsServer = https.createServer(credentials);
httpsServer.listen(8443);

const WebSocketServer = require('ws').Server;
const dispatcher = require('./dispatcher');

const wss = new WebSocketServer({
  server: httpsServer,
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('received: %s', message);
    try {
      const payload = JSON.parse(message);
      dispatcher.dispatch(ws, payload);
    } catch (e) {
      console.log(e);
    }
  });

  ws.send(Date.now());
});
