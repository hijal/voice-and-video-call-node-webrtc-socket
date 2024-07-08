export const getInComingCallDialog = (callTypeInfo, acceptCallHandler, rejectCallHandler) => {
  const dialog = document.createElement('div');
  dialog.classList.add('dialog_wrapper');

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('dialog_content');

  dialog.appendChild(dialogContent);

  const title = document.createElement('p');
  title.classList.add('dialog_title');
  title.innerHTML = `Incoming ${callTypeInfo} call`;
  dialogContent.appendChild(title);

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('dialog_image_container');

  const image = document.createElement('img');
  const imagePath = '../images/dialogAvatar.png';
  image.src = imagePath;
  image.alt = 'dialogAvatar';

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('dialog_button_container');

  const acceptButton = document.createElement('button');
  acceptButton.classList.add('dialog_accept_call_button');
  const acceptButtonImage = document.createElement('img');
  acceptButtonImage.src = '../images/acceptCall.png';
  acceptButtonImage.classList.add('dialog_button_image');
  acceptButton.appendChild(acceptButtonImage);

  const rejectButton = document.createElement('button');
  rejectButton.classList.add('dialog_reject_call_button');
  const rejectButtonImage = document.createElement('img');
  rejectButtonImage.src = '../images/rejectCall.png';
  rejectButtonImage.classList.add('dialog_button_image');
  rejectButton.appendChild(rejectButtonImage);

  imageContainer.appendChild(image);
  dialogContent.appendChild(imageContainer);
  buttonContainer.appendChild(acceptButton);
  buttonContainer.appendChild(rejectButton);
  dialogContent.appendChild(buttonContainer);

  acceptButton.addEventListener('click', () => {
    acceptCallHandler();
  });

  rejectButton.addEventListener('click', () => {
    rejectCallHandler();
  });

  return dialog;
};

export const getCallingDialog = (rejectCallHandler) => {
  const dialog = document.createElement('div');
  dialog.classList.add('dialog_wrapper');

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('dialog_content');

  dialog.appendChild(dialogContent);

  const title = document.createElement('p');
  title.classList.add('dialog_title');
  title.innerHTML = 'Calling';
  dialogContent.appendChild(title);

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('dialog_image_container');

  const image = document.createElement('img');
  const imagePath = '../images/dialogAvatar.png';
  image.src = imagePath;
  image.alt = 'dialogAvatar';

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('dialog_button_container');

  const rejectButton = document.createElement('button');
  rejectButton.classList.add('dialog_reject_call_button');
  const rejectButtonImage = document.createElement('img');
  rejectButtonImage.src = '../images/rejectCall.png';
  rejectButtonImage.classList.add('dialog_button_image');
  rejectButton.appendChild(rejectButtonImage);

  imageContainer.appendChild(image);
  dialogContent.appendChild(imageContainer);
  buttonContainer.appendChild(rejectButton);
  dialogContent.appendChild(buttonContainer);

  rejectButton.addEventListener('click', () => {
    rejectCallHandler();
  });

  return dialog;
};

export const getInfoDialog = (title, message) => {
  const dialog = document.createElement('div');
  dialog.classList.add('dialog_wrapper');

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('dialog_content');

  dialog.appendChild(dialogContent);

  const titleEl = document.createElement('p');
  titleEl.classList.add('dialog_title');
  titleEl.innerHTML = title;
  dialogContent.appendChild(titleEl);

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('dialog_image_container');

  const image = document.createElement('img');
  const imagePath = '../images/dialogAvatar.png';
  image.src = imagePath;
  image.alt = 'dialogAvatar';

  imageContainer.appendChild(image);
  dialogContent.appendChild(imageContainer);

  const messageParagraph = document.createElement('p');
  messageParagraph.classList.add('dialog_description');
  messageParagraph.innerHTML = message;

  dialogContent.appendChild(messageParagraph);

  return dialog;
};

export const getLeftMessage = (message) => {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message_left_container');

  const messageText = document.createElement('p');
  messageText.classList.add('message_left_paragraph');
  messageText.innerHTML = message;
  messageContainer.appendChild(messageText);

  return messageContainer;
};

export const getRightMessage = (message) => {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message_right_container');

  const messageText = document.createElement('p');
  messageText.classList.add('message_right_paragraph');
  messageText.innerHTML = message;
  messageContainer.appendChild(messageText);

  return messageContainer;
};
