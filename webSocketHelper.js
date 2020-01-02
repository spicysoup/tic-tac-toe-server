const store = require('./store');
const type = 'GAME_JOINED';
const registerPlayer = (socket, payload) => {
  console.log(store);

  const {sessionID, player} = payload;
  if (sessionID && player && store[sessionID]) {
    store[sessionID].sockets[player] = socket;
    return { type, sessionID, player };
  }

  const idleSessions = Object.keys(store).filter((k) => store[k] && store[k].players.length < 2);
  if (idleSessions.length > 0) {
    store[idleSessions[0]].players.push(1);
    store[idleSessions[0]].sockets.push(socket);
    return { type, sessionID: idleSessions[0], player: 1, };
  }

  const newSessionID = Date.now();
  store[newSessionID] = {players: [0], sockets: [socket]};
  return { type, sessionID: newSessionID, player: 0 };
};

module.exports = registerPlayer;
