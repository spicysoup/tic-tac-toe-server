const store = require('./store');

const type = 'GAME_JOINED';

const peer = (self) => 1 - self;

const announcePeerReady = (playerInfo) => {
  const { sockets } = store[playerInfo.sessionID];
  const alivePeers = sockets.filter((s) => s.readyState === 1);
  if (alivePeers.length > 1) {
    alivePeers.forEach((s) => s.send(JSON.stringify({ type: 'PEER_READY' })));
  }
};

const registerPlayer = (socket, payload) => {
  const { sessionID } = payload;
  const player = parseInt(payload.player, 10);
  // eslint-disable-next-line no-restricted-globals
  if (sessionID && !isNaN(player) && store[sessionID]) {
    store[sessionID].sockets[player] = socket;
    return { type, sessionID, player };
  }

  const idleSessions = Object.keys(store)
    .filter((k) => store[k] && store[k].players.length < 2);
  if (idleSessions.length > 0) {
    store[idleSessions[0]].players.push(1);
    store[idleSessions[0]].sockets.push(socket);
    return { type, sessionID: idleSessions[0], player: 1 };
  }

  const newSessionID = Date.now();
  store[newSessionID] = { players: [0], sockets: [socket] };
  return { type, sessionID: newSessionID, player: 0 };
};

const dispatch = (socket, payload) => {
  if (payload.type === 'JOIN_GAME') {
    console.log('Store before', store);

    const playerInfo = registerPlayer(socket, payload);
    console.log('Allocated session', playerInfo);

    console.log('Store after', store);

    socket.send(JSON.stringify(playerInfo));

    announcePeerReady(playerInfo);
  }
  if (payload.type === 'NEW_MOVE') {
    const peerSocket = store[payload.sessionID].sockets[peer(payload.player)];
    peerSocket.send(JSON.stringify({
      ...payload,
      type: 'PEER_MOVE',
    }));
  } else {
    socket.send(Date.now());
  }
};

module.exports = { dispatch };
