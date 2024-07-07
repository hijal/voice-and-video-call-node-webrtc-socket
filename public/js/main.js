import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
// import { getInComingCallDialog } from './elements.js';

const socket = io('/');

wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

// enable copy button and the id of the button is personal_code_copy_button
const copyButton = document.getElementById('personal_code_copy_button');
const personalCodeEl = document.getElementById('personal_code_paragraph');

if (copyButton && personalCodeEl) {
  copyButton.addEventListener('click', () => {
    const socketId = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(socketId);
  });
} else {
  console.error('Could not find copy button or personal code element');
}

// personal code chat button functionality and the id of the button is personal_code_chat_button

const personalCodeChatButtonEl = document.getElementById('personal_code_chat_button');
const personalCodeVideoButtonEl = document.getElementById('personal_video_chat_button');

const personalCodeInputEl = document.getElementById('personal_code_input');

// add event listeners for chat and video buttons

personalCodeChatButtonEl.addEventListener('click', () => {
  const calleePersonalCode = personalCodeInputEl.value;
  const callType = constants.callType.CHAT_PERSONAL_CODE;
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

personalCodeVideoButtonEl.addEventListener('click', () => {
  const calleePersonalCode = personalCodeInputEl.value;
  const callType = constants.callType.VIDEO_PERSONAL_CODE;
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

const micButtonEl = document.getElementById('mic_button');

micButtonEl.addEventListener('click', () => {
  const localStream = store.getState().localStream;
  if (localStream) {
    console.log(localStream.getAudioTracks());
    const micEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;

    ui.updateMicButton(micEnabled);
  }
});

const cameraButtonEl = document.getElementById('camera_button');

cameraButtonEl.addEventListener('click', () => {
  const localStream = store.getState().localStream;
  if (localStream) {
    console.log(localStream.getVideoTracks());
    const cameraAction = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraAction;

    ui.updateCameraButton(cameraAction);
  }
});

const screenSharingButtonEl = document.getElementById('screen_sharing_button');

screenSharingButtonEl.addEventListener('click', () => {
  const screenSharingActive = store.getState().screenSharingActive;

  webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});
