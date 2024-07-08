import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as recording from './recording.js';

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

const newMessageInputEl = document.getElementById('new_message_input');

newMessageInputEl?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const message = event.target.value;

    if (message) {
      webRTCHandler.sendMessageUsingDataChannel(message);
      ui.appendMessage(message, true);
      event.target.value = '';
    }
  }
});

const sendMessageButtonEl = document.getElementById('send_message_button');

sendMessageButtonEl?.addEventListener('click', () => {
  const message = newMessageInputEl?.value;

  if (message) {
    webRTCHandler.sendMessageUsingDataChannel(message);
    ui.appendMessage(message, true);
    newMessageInputEl.value = '';
  }
});

const startRecordingButton = document.getElementById('start_recording_button');

startRecordingButton?.addEventListener('click', () => {
  recording.startRecording();
  ui.showRecordingPanel();
});

const stopRecordingButton = document.getElementById('stop_recording_button');

stopRecordingButton?.addEventListener('click', () => {
  recording.stopRecording();
  ui.resetRecordingButtons();
});

const pauseRecordingButtonEl = document.getElementById('pause_recording_button');

pauseRecordingButtonEl?.addEventListener('click', () => {
  recording.pauseRecording();
  ui.switchRecordingButtons(true);
});

const resumeRecordingButtonEl = document.getElementById('resume_recording_button');

resumeRecordingButtonEl?.addEventListener('click', () => {
  recording.resumeRecording();
  ui.switchRecordingButtons(false);
});

const hangupButtonEl = document.getElementById('hang_up_button');

hangupButtonEl?.addEventListener('click', () => {
  webRTCHandler.handleHangUp();
});

const hangUpChatButtonEl = document.getElementById('finish_chat_call_button');

hangUpChatButtonEl?.addEventListener('click', () => {
  webRTCHandler.handleHangUp();
  // ui.showDashboard();
});
