// Minimal amount of secure websocket server
const fs = require('fs');
const registerPlayer = require('./webSocketHelper');
const store = require('./store');

// read ssl certificate
const privateKey = fs.readFileSync('ssl-cert/privkey.pem', 'utf8');
const certificate = fs.readFileSync('ssl-cert/fullchain.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};
const https = require('https');

//pass in your credentials to create an https server
const httpsServer = https.createServer(credentials);
httpsServer.listen(8443);

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({
  server: httpsServer,
});

function announcePeerReady(playerInfo) {
  const { sockets } = store[playerInfo.sessionID];
  const alivePeers = sockets.filter((s) => s.readyState === 1);
  if (alivePeers.length > 1) {
    alivePeers.forEach((s) => s.send(JSON.stringify({type: 'PEER_READY'})));
  }
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    try {
      const payload = JSON.parse(message);
      console.log(payload);
      if (payload.type === 'JOIN_GAME') {

        const playerInfo = registerPlayer(ws, payload);
        console.log(playerInfo);
        ws.send(JSON.stringify(playerInfo));

        announcePeerReady(playerInfo);
      } else {
        ws.send(Date.now())
      }
    } catch (e) {
      console.log(e);
    }
  });

  ws.send(Date.now());
});