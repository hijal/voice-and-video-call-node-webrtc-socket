import * as wss from './wss.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;

let defaultConstraints = {
  audio: true,
  video: true
};

export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode
  };

  if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const data = {
      callType,
      calleePersonalCode
    };

    ui.showCallingDialog(callingDialogRejectHandler);

    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callerSocketId, callType } = data;
  connectedUserDetails = { socketId: callerSocketId, callType };

  if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};

const callingDialogRejectHandler = () => {
  console.log('Rejecting the call');
};

const acceptCallHandler = () => {
  console.log('accepting the call');
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElement(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  console.log('reject the call');
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer
  };

  ui.removeAllDialog();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  console.log('Pre offer Answer received');
  console.log('Pre offer Answer received data: ', data);
  const { callerSocketId, preOfferAnswer } = data;

  ui.removeAllDialog();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog callee not found
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog call unavailable
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    // show dialog rejected
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    // show video call
    ui.showCallElement(connectedUserDetails.callType);
  } else {
    console.log('Unknown preference', callerSocketId);
    console.log('Invalid pre offer answer', preOfferAnswer);
  }
};

export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
    })
    .catch((error) => {
      console.log('Error getting when trying to get an access to the camera');
      console.error(error);
    });
};
