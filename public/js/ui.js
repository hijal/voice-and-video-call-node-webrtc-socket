import * as constants from './constants.js';
import * as elements from './elements.js';

export const updatePersonalCode = (code) => {
  const personalCodeEl = document.getElementById('personal_code_paragraph');
  if (personalCodeEl) {
    personalCodeEl.innerHTML = code;
  } else {
    console.error('Could not find personal code element');
    personalCodeEl.innerHTML = '';
  }
};

export const showIncomingCallDialog = (callType, acceptHandler, rejectHandler) => {
  const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? 'chat' : 'video';

  const inComingCallDialog = elements.getInComingCallDialog(callTypeInfo, acceptHandler, rejectHandler);

  const dialogEl = document.getElementById('dialog');
  // remove all the elements
  dialogEl.querySelectorAll('*').forEach((dialog) => dialog.remove());
  dialogEl.appendChild(inComingCallDialog);
};

export const showCallingDialog = (rejectHandler) => {
  const callingDialog = elements.getCallingDialog(rejectHandler);

  const dialogEl = document.getElementById('dialog');
  // remove all the elements
  dialogEl.querySelectorAll('*').forEach((dialog) => dialog.remove());
  dialogEl.appendChild(callingDialog);
};

export const removeAllDialog = () => {
  const dialogEl = document.getElementById('dialog');
  // remove all the elements
  dialogEl.querySelectorAll('*').forEach((dialog) => dialog.remove());
};

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;
  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      'Callee not found',
      'The person you are trying to reach is not currently online. Please check their availability and try again.'
    );
  }
  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = elements.getInfoDialog(
      'Call unavailable',
      'The person you are trying to reach is currently busy. Please try again later.'
    );
  }
  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      'Call rejected',
      'The person you are trying to reach rejected your call. Please try again.'
    );
  }

  if (infoDialog) {
    const dialogEl = document.getElementById('dialog');
    // remove all the elements
    dialogEl.querySelectorAll('*').forEach((dialog) => dialog.remove());
    dialogEl.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialog();
    }, 4000);
  }
};

export const showCallElement = (callType) => {
  if (callType === constants.callType.CHAT_PERSONAL_CODE) {
    showChatCallElements();
  }

  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    showVideoCallElements();
  }
};

const showChatCallElements = () => {
  const finishConnectionChatButtonContainerEl = document.getElementById('finish_chat_button_container');
  showElement(finishConnectionChatButtonContainerEl);

  const newMessageInputEl = document.getElementById('new_message');
  showElement(newMessageInputEl);

  disableDashboard();
};

const showVideoCallElements = () => {
  const allButtonsEl = document.getElementById('call_buttons');
  showElement(allButtonsEl);

  const placeholderEl = document.getElementById('video_placeholder');
  hideElement(placeholderEl);

  const remoteVideoEl = document.getElementById('remote_video');
  showElement(remoteVideoEl);

  const newMessageInputEl = document.getElementById('new_message');
  showElement(newMessageInputEl);

  disableDashboard();
};

const enableDashboard = () => {
  const dashboardBlocker = document.getElementById('dashboard_blur');

  if (!dashboardBlocker.classList.contains('display_none')) {
    dashboardBlocker.classList.add('display_none');
  }
};

const disableDashboard = () => {
  const dashboardBlocker = document.getElementById('dashboard_blur');

  if (dashboardBlocker.classList.contains('display_none')) {
    dashboardBlocker.classList.remove('display_none');
  }
};

const hideElement = (element) => {
  if (!element.classList.contains('display_none')) {
    element.classList.add('display_none');
  }
};

const showElement = (element) => {
  if (element.classList.contains('display_none')) {
    element.classList.remove('display_none');
  }
};

export const updateLocalVideo = (stream) => {
  const localVideoEl = document.getElementById('local_video');
  localVideoEl.srcObject = stream;
  
  localVideoEl.addEventListener('loadedmetadata', () => {
    localVideoEl.play();
  });
};
