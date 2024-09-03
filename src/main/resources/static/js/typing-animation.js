function animateTyping(messageElementId, message = '', typeSpeed = 10){
  if (document.querySelector(messageElementId) === null) {
    console.error('messageElementId not found');
  }

  message = message.trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
  var typingInstance = new Typed(messageElementId, { strings: [ message ], typeSpeed, showCursor: false, });
}
