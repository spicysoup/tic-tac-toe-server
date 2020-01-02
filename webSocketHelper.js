const store = require('./store');
const type = 'GAME_JOINED';
const registerPlayer = (socket) => {
  console.log(store);
  const idleSessions = Object.keys(store).filter((k) => store[k] && store[k].players.length < 2);
  if (idleSessions.length > 0) {
    store[idleSessions[0]].players.push(1);
    store[idleSessions[0]].sockets.push(socket);
    return { type, sessionID: idleSessions[0], player: 1, };
  }

  const sessionID = Date.now();
  store[sessionID] = {players: [0], sockets: [socket]};
  return { type, sessionID, player: 0 };
};

module.exports = registerPlayer;
