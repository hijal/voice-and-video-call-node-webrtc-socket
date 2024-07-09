import * as webRTCHandler from './webRTCHandler.js';
import * as wss from './wss.js';
import * as ui from './ui.js';

let strangerCallType;

export const changeStrangerConnectionStatus = (status) => {
  const data = { status };

  wss.changeStrangerConnectionStatus(data);
};

export const getStrangerSocketIdAndConnection = (callType) => {
  strangerCallType = callType;
  console.log('getStrangerSocketIdAndConnection called', callType);
  wss.getStrangerSocketId();
};

export const connectWithStrangers = (data) => {
  const { strangerSocketId } = data;
  console.log('Stranger socket data: ', data);
  if (strangerSocketId) {
    webRTCHandler.sendPreOffer(strangerCallType, strangerSocketId);
  } else {
    ui.showNoStrangerAvailableDialog()
  }
};
