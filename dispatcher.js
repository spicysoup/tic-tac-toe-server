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

const sendToPeer = ({ sessionID, player }, data) => {
  const peerSocket = store[sessionID].sockets[peer(player)];
  peerSocket.send(JSON.stringify(data));
};

const dispatch = (socket, payload) => {
  if (payload.type === 'JOIN_GAME') {
    console.log('Store before', store);

    const playerInfo = registerPlayer(socket, payload);
    console.log('Allocated session', playerInfo);

    console.log('Store after', store);

    socket.send(JSON.stringify(playerInfo));

    announcePeerReady(playerInfo);
    return;
  }

  if (payload.type === 'NEW_MOVE') {
    sendToPeer(payload, {
      ...payload,
      type: 'PEER_MOVE',
    });
    return;
  }

  if (payload.type === 'RESET_BOARD' || payload.type === 'SET_DIMENSION') {
    sendToPeer(payload, payload);
    return;
  }

  socket.send(Date.now());
};

module.exports = { dispatch };
