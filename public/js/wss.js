import * as store from './store.js';
import * as ui from './ui.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as strangers from './stranger.js';

let socketIO = null;

export const registerSocketEvents = (socket) => {
  socket.on('connect', () => {
    socketIO = socket;

    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id);
  });

  socket.on('pre-offer', (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  socket.on('pre-offer-answer', (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on('webRTC-signaling', (data) => {
    switch (data.type) {
      case constants.webRTCSignaling.OFFER:
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case constants.webRTCSignaling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.webRTCSignaling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCIceCandidate(data);
        break;
      default:
        console.log('Unknown signaling type', data.type);
        break;
    }
  });

  socket.on('user-hanged-up', (data) => {
    webRTCHandler.handleConnectedUserHangUp(data);
  });

  socket.on('stranger-socket-id', (data) => {
    strangers.connectWithStrangers(data);
  });
};

// emitting to the server
export const sendPreOffer = (data) => {
  socketIO.emit('pre-offer', data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit('pre-offer-answer', data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit('webRTC-signaling', data);
};

// handling the hang up
export const sendUserHangUp = (data) => {
  socketIO.emit('user-hang-up', data);
};

export const changeStrangerConnectionStatus = (data) => {
  socketIO.emit('stranger-connection-status', data);
};

export const getStrangerSocketId = () => {
  socketIO.emit('get-stranger-socket-id');
};
