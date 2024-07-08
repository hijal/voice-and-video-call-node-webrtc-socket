import * as wss from './wss.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;
let dataChannel;

const defaultConstraints = {
  audio: true,
  video: true
};

const configuration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:13902', 'stun:stun1.l.google.com:13902']
    }
  ]
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
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callerSocketId, callType } = data;

  if (!checkCallPossibility()) {
    return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE, callerSocketId);
  }

  connectedUserDetails = { socketId: callerSocketId, callType };

  store.setCallState(constants.callState.CALL_UNAVAILABLE);

  if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};

const callingDialogRejectHandler = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId
  };
  closePeerConnection();
  wss.sendUserHangUp(data);
};

const acceptCallHandler = () => {
  console.log('accepting the call');

  createPeerConnection();

  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElement(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  console.log('reject the call');
  sendPreOfferAnswer();
  setIncomingCallAvailability();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const sendPreOfferAnswer = (preOfferAnswer, socketId = null) => {
  const callerSocketId = socketId ? socketId : connectedUserDetails.socketId;

  const data = {
    callerSocketId,
    preOfferAnswer
  };

  ui.removeAllDialog();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = async (data) => {
  console.log('Pre offer Answer received');
  console.log('Pre offer Answer received data: ', data);
  const { callerSocketId, preOfferAnswer } = data;

  ui.removeAllDialog();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog callee not found
    ui.showInfoDialog(preOfferAnswer);
    setIncomingCallAvailability();
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog call unavailable
    setIncomingCallAvailability();
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    // show dialog rejected
    setIncomingCallAvailability();
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    // show video call
    ui.showCallElement(connectedUserDetails.callType);

    createPeerConnection();

    await sendWebRTCOffer();
  } else {
    console.log('Unknown preference', callerSocketId);
    console.log('Invalid pre offer answer', preOfferAnswer);
  }
};

const sendWebRTCOffer = async () => {
  console.log('Sending WebRTC Offer');

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
    offer
  });
};

export const handleWebRTCOffer = async (data) => {
  console.log('WebRTC Offer received');
  console.log('WebRTC Offer received data: ', data);
  const { offer } = data;
  // await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  await peerConnection.setRemoteDescription(offer);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.ANSWER,
    answer
  });
};

export const handleWebRTCAnswer = async (data) => {
  console.log('WebRTC Answer received');
  console.log('WebRTC Answer received data: ', data);
  const { answer } = data;
  // await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  await peerConnection.setRemoteDescription(answer);
};

export const handleWebRTCIceCandidate = async (data) => {
  console.log('WebRTC Ice Candidate received');
  console.log('WebRTC Ice Candidate received data: ', data);
  const { candidate } = data;
  try {
    // peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    await peerConnection.addIceCandidate(candidate);
  } catch (error) {
    console.error('Error adding ice candidate', error);
  }
};

export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      store.setCallState(constants.callState.CALL_AVAILABLE);
      ui.updateLocalVideo(stream);
      ui.showVideoCallButtons();
      store.setLocalStream(stream);
    })
    .catch((error) => {
      console.log('Error getting when trying to get an access to the camera');
      console.error(error);
    });
};

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);

  dataChannel = peerConnection.createDataChannel('chat');

  peerConnection.ondatachannel = (event) => {
    console.log('Data Channel created');
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log('Data Channel is open');
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message from data channel: ', message);
      ui.appendMessage(message);
    };
  };

  peerConnection.onicecandidate = (event) => {
    console.log('getting ice candidate from the stun server');
    if (event.candidate) {
      // send our ice candidate to other peer
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ICE_CANDIDATE,
        candidate: event.candidate
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    console.log('connection state changed', peerConnection.connectionState);
    if (peerConnection.connectionState === 'connected') {
      console.log('Peer connection is established');
    }
  };

  const remoteStream = new MediaStream();

  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendMessageUsingDataChannel = (message) => {
  dataChannel.send(JSON.stringify(message));
};

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
  if (screenSharingActive) {
    const localStream = store.getState().localStream;

    const senders = peerConnection.getSenders();
    const sender = senders.find((sender) => sender.track.kind === localStream.getVideoTracks()[0].kind);

    if (sender) {
      const screenSharingStream = store.getState().screenSharingStream;

      if (screenSharingStream) {
        screenSharingStream.getTracks().forEach((track) => track.stop());
      }

      sender.replaceTrack(localStream.getVideoTracks()[0]);
      store.setScreenSharingActive(!screenSharingActive);

      ui.updateLocalVideo(localStream);
    }
  } else {
    console.log('Switching for screen sharing');

    try {
      let screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      store.setScreenSharingStream(screenSharingStream);
      const senders = peerConnection.getSenders();
      const sender = senders.find((sender) => sender.track.kind === screenSharingStream.getVideoTracks()[0].kind);

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);

      ui.updateLocalVideo(screenSharingStream);
    } catch (error) {
      console.error('Error getting screen sharing stream', error);
    }
  }
};

export const handleHangUp = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId
  };

  wss.sendUserHangUp(data);
  closePeerConnection();
};

export const handleConnectedUserHangUp = () => {
  closePeerConnection();
};

const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
    connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
  ) {
    store.getState().localStream.getVideoTracks()[0].enabled = true;
    store.getState().localStream.getAudioTracks()[0].enabled = true;
  }
  ui.updateUIAfterHangUp(connectedUserDetails.callType);
  setIncomingCallAvailability();
  connectedUserDetails = null;
};

const checkCallPossibility = (callType) => {
  const callState = store.getState().callState;

  if (callState === constants.callState.CALL_AVAILABLE) {
    return true;
  }

  if (
    (callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.VIDEO_STRANGER) &&
    callState === constants.callState.CALL_AVAILABLE_ONLY_CHAT
  ) {
    return false;
  }
};

const setIncomingCallAvailability = () => {
  const localStream = store.getState().localStream;

  if (localStream) {
    store.setCallState(constants.callState.CALL_AVAILABLE);
  } else {
    store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
  }
};
