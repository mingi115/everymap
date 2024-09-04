function animateTyping(messageElementId, message = '', typeSpeed = 10){
  if (document.querySelector(messageElementId) === null) {
    console.error('messageElementId not found');
  }

  const cardBody = document.querySelector(messageElementId);
  const config = { childList: true, subtree: true };
  observer.observe(cardBody, config);
  message = message.trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
  var typingInstance = new Typed(messageElementId, { strings: [ message ], typeSpeed, showCursor: false, });
}
function cardWrapperScrollToBottom(){
  const chatContainer = document.querySelector(".card-body-wrapper");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
const observer = new MutationObserver(cardWrapperScrollToBottom);


function createNewChatCard(cardId){
  const cardBody = document.createElement("div");
  cardBody.classList.add('card-body');
  const lxImg = document.createElement("img");
  lxImg.src = "/image/lx.jpg";
  lxImg.alt = "avatar 1";
  lxImg.style.width = "45px";
  lxImg.style.height = "100%";
  cardBody.appendChild(lxImg);

  const flexCardBody = document.createElement("div");
  flexCardBody.classList.add('d-flex');
  flexCardBody.classList.add('flex-row');
  flexCardBody.classList.add('justify-content-start');
  flexCardBody.classList.add('mb-4');

  const card = document.createElement("div");
  card.classList.add('p-3');
  card.classList.add('ms-3');
  card.style.borderRadius = "15px";
  card.style.backgroundColor = "rgba(1, 152, 129, .2)";
  const cardContents = document.createElement("p");
  cardContents.id = `${cardId}`;
  cardContents.classList.add('small');
  cardContents.classList.add('mb-0');
  card.appendChild(cardContents);
  flexCardBody.appendChild(card);
  cardBody.appendChild(flexCardBody);

  const chatContainer = document.querySelector(".card-body-wrapper");
  chatContainer.appendChild(cardBody);

  return cardBody;
}

let loadingChatCard;
let loadingTyped;
function addLoadingChatCard(){
  if(!loadingChatCard){
    loadingChatCard = createNewChatCard('chat-loading');
  }

  loadingTyped = new Typed('#chat-loading',
      { strings: [ '▪▪▪', '▪' ],
        typeSpeed: 100,
        showCursor: false,
        loop:true,
        startDelay: 0,
        backDelay: 100,
        onLastStringBackspaced  : () =>  document.querySelector('#chat-loading').innerHTML = '▪'
      });
}
function deleteLoadingChatCard(){
  if(loadingChatCard) {
    loadingTyped.destroy();
    loadingChatCard.remove()
  }
}

let chatCardId=0;
function addNewChatCard(cardText){
  chatCardId++;
  createNewChatCard(`chat-${chatCardId}`);
  animateTyping(`#chat-${chatCardId}`, cardText, 30);
}
