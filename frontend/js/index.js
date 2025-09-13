/* ================================================================================ */
/* ================================================================================ */
/* ============================= Constantes ======================================= */
/* ================================================================================ */
/* ================================================================================ */

const API = {
  URL: "http://localhost:3000/api",
  STORAGE: "http://localhost:3000",
};

const DOM = {
  profilePhoto: document.getElementById("user-img"),
  userName: document.getElementById("user-name"),
  logoutButton: document.getElementById("logout-btn"),
  searchInput: document.getElementById("search-input"),
  searchButton: document.getElementById("search-btn"),
  searchResult: document.getElementById("search-result"),
  backBtn: document.getElementById("back-btn"),
  closeBtn: document.getElementById("close-btn"),
  sendBtn: document.getElementById("send-btn"),
};

const token = localStorage.getItem("jwtToken");
let currentUser = null;
let currentRecipient = null;
let currentConversationId = null;
let socket = null;

/* ================================================================================ */
/* ================================================================================ */
/* =============================== Funções ======================================== */
/* ================================================================================ */
/* ================================================================================ */

/*======= Função para checar autenticação com presença do token ================= */
function checkAuthentication(token) {
  if (!token) {
    window.location.href = "../html/auth.html";
    return false;
  }
  return true;
}

/* ========================= Função de Logout ===================================== */
function handleLogout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  window.location.href = "../html/auth.html";
}

/* ========================= Função de Voltar ===================================== */
function handleBack() {
  document.querySelector(".chat-area")?.classList.remove("active");
  document.querySelector(".sidebar")?.classList.remove("inactive");
}

/* ========================= Função de Fechar ===================================== */
function handleClose() {
  const chatHeader = document.getElementById("chat-header");
  const chatContactImg = document.getElementById("chat-contact-image");
  const chatContactName = document.getElementById("chat-contact-name");
  const messagesContainer = document.getElementById("messages-container");
  const messageInputArea = document.querySelector(".message-input-area");

  chatContactImg.src = "";
  chatContactImg.alt = "";
  chatContactName.textContent = "";

  chatHeader.classList.add("hidden");
  chatContactImg.classList.add("hidden");
  messagesContainer.classList.add("hidden");
  messageInputArea.classList.add("hidden");
}

/* ================ Função de mostrar dados do usuário ============================ */
function renderUserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  if (DOM.profilePhoto) {
    DOM.profilePhoto.src = `${API.STORAGE}${user.imgUrl}`;
  }
  if (DOM.userName) {
    DOM.userName.textContent = user.name;
  }
}

/* ====================== Função de mostrar usuário ============================== */
function renderSearchResult(user) {
  if (!user || !DOM.searchResult) return;

  const resultDiv = document.createElement("div");
  resultDiv.classList.add("search-item");
  resultDiv.dataset.otherUserId = user.id;

  resultDiv.innerHTML = `
    <img src="${API.STORAGE}${user.imgUrl}" alt="${user.name}" class="profile-img" />
    <div class="user-info">
      <h4>${user.name}</h4>
    </div>
  `;

  resultDiv.addEventListener("click", () => {
    startNewConversation(user);
  });

  DOM.searchResult.appendChild(resultDiv);
}

/* =================== Função de buscar usuário API =============================== */
async function fetchSearchUserByPhone(phone, token) {
  DOM.searchResult.innerHTML = "";

  try {
    const response = await fetch(`${API.URL}/user/${phone}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 404) {
        alert("Usuário não encontrado.");
        return;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na busca.");
      }
    }

    const user = await response.json();

    // Chama função para monstar o DOM
    renderSearchResult(user);
  } catch (err) {
    console.error("Erro na busca:", err);
  }
}

/* =================== Função para criar DOM do chat ============================== */
function renderChatHeader(user) {
  const chatHeader = document.getElementById("chat-header");
  const chatContactImg = document.getElementById("chat-contact-image");
  const chatContactName = document.getElementById("chat-contact-name");
  const messageInputArea = document.querySelector(".message-input-area");

  chatContactImg.src = `${API.STORAGE}${user.imgUrl}`;
  chatContactImg.alt = `Foto de ${user.name}`;
  chatContactName.textContent = user.name;

  chatHeader.classList.remove("hidden");
  chatContactImg.classList.remove("hidden");
  messageInputArea.classList.remove("hidden");
}

/* ====== Função para iniciar um novo chat quando você clica em um usuário ======== */
function startNewConversation(user) {
  currentRecipient = user;
  currentConversationId = null;
  renderChatHeader(user);

  const messagesContainer = document.getElementById("messages-container");
  if (messagesContainer) messagesContainer.innerHTML = "";

  const sidebar = document.querySelector(".sidebar");
  const chatArea = document.querySelector(".chat-area");
  if (window.innerWidth <= 768) {
    if (sidebar) sidebar.classList.add("inactive");
    if (chatArea) chatArea.classList.add("active");
  }
}

/* ===== Função para definir cor das mensagens de quem envia e quem recebe ======= */
function displayMessage(message, isMine) {
  const messagesContainer = document.getElementById("messages-container");
  if (!messagesContainer) return;
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "message",
    isMine ? "my-message" : "other-message"
  );
  messageElement.textContent = message.content;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* =============== Função para definir conversa atual =========================== */
function setActiveConversation(conv) {
  currentRecipient = conv.user;
  currentConversationId = conv.id;
}

/* ================ Função para mostrar tela de chat =========================== */
function renderChatInterface(user) {
  const chatHeader = document.getElementById("chat-header");
  const chatContactImg = document.getElementById("chat-contact-image");
  const chatContactName = document.getElementById("chat-contact-name");
  const messageInputArea = document.querySelector(".message-input-area");

  chatContactImg.src = `${API.STORAGE}${user.imgUrl}`;
  chatContactImg.alt = `Foto de ${user.name}`;
  chatContactName.textContent = user.name;

  chatHeader.classList.remove("hidden");
  chatContactImg.classList.remove("hidden");
  messageInputArea.classList.remove("hidden");

  const sidebar = document.querySelector(".sidebar");
  const chatArea = document.querySelector(".chat-area");
  if (window.innerWidth <= 768) {
    sidebar?.classList.add("inactive");
    chatArea?.classList.add("active");
  }
}

/* ================= Função para carregar mensagens API  ======================= */
async function fetchMessages(conversationId, token) {
  const response = await fetch(
    `${API.URL}/conversations/${conversationId}/messages`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    throw new Error("Erro ao carregar mensagens");
  }
  return response.json();
}

/* ================ Função para carregar tela de chat ========================== */
async function loadChatContainer(conv) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  setActiveConversation(conv);
  renderChatInterface(conv.user);

  const messagesContainer = document.getElementById("messages-container");
  if (!messagesContainer) return;
  messagesContainer.innerHTML = "";

  try {
    const messages = await fetchMessages(conv.id, token);
    messages.forEach((msg) =>
      displayMessage(msg, msg.senderId === currentUser.id)
    );
  } catch (err) {
    console.error("Erro ao carregar mensagens:", err);
  }
}

/* =============== Função para enviar mensagem API ============================ */
async function sendMessage(content, token, conversationId, recipientId) {
  const bodyData = {
    content: content,
    receiverId: recipientId,
  };

  if (conversationId) {
    bodyData.conversationId = conversationId;
  }

  const response = await fetch(`${API.URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || errorData.error || "Erro ao enviar mensagem"
    );
  }

  return response.json();
}

/* =============== Função para montar mensagem para enviar ===================== */
async function handleSendMessage() {
  const input = document.getElementById("message-content");
  const content = input.value.trim();

  if (!content || !currentRecipient) {
    alert("Selecione um contato ou digite uma mensagem.");
    return;
  }

  const receiverId = currentRecipient.id || currentRecipient._id;

  try {
    const data = await sendMessage(
      content,
      token,
      currentConversationId, // Este será null para novas conversas
      receiverId
    );

    input.value = "";
    displayMessage(data.message, true);

    if (!currentConversationId && data.message.conversationId) {
      currentConversationId = data.message.conversationId;
    }

    const conversation = {
      id: currentConversationId,
      user: currentRecipient,
    };

    await loadChatContainer(conversation);
  } catch (err) {
    alert(`Erro ao enviar mensagem: ${err.message}`);
    console.error(err);
  }
}

/* =============== Função para criar DOM da lista de conversas ================== */
function createConversationItem(conv) {
  const li = document.createElement("li");
  li.classList.add("conversation-item");
  li.dataset.conversationId = conv.id;
  li.dataset.otherUserId = conv.user.id;

  li.innerHTML = `
    <img src="${API.STORAGE}${conv.user.imgUrl}" alt="${
    conv.user.name
  }" class="profile-img" />
    <div class="conversation-info">
      <h4>${conv.user.name}</h4>
      <p>${conv.lastMessage ? conv.lastMessage.content : ""}</p>
    </div>
  `;

  li.addEventListener("click", () => loadChatContainer(conv));
  return li;
}

/* ====== Função para mostrar o DOM das conversas (constrói e exibe o HTML)  ==== */
function renderConversations(conversations) {
  const convoList = document.getElementById("conversation-list");
  if (!convoList) return;

  convoList.innerHTML = "";

  conversations.forEach((conv) => {
    const li = createConversationItem(conv);
    convoList.appendChild(li);
  });
}

/* =============== Função para carregar conversas (API) ========================== */
async function fetchConversations(token) {
  const response = await fetch(`${API.URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar conversas");
  }

  return response.json();
}

/* ============ Função que orquestra as duas anteriores ========================= */
async function initConversationList(token) {
  try {
    const data = await fetchConversations(token);
    data.conversations.sort((a, b) => {
      const dateA = new Date(a.lastMessage?.sendAt || 0);
      const dateB = new Date(b.lastMessage?.sendAt || 0);
      return dateB - dateA; // mais recente primeiro
    });

    renderConversations(data.conversations);
  } catch (err) {
    console.error("Erro ao buscar conversas:", err);
  }
}

/* ===================== Função de conexão com socket ============================= */
function connectSocket() {
  if (socket && socket.connected) return;
  socket = io("http://localhost:3000", {
    query: { userId: currentUser.id },
  });
  socket.on("newMessage", (data) => {
    if (data.conversationId === currentConversationId) {
      displayMessage(data.message, data.message.senderId === currentUser.id);
    }
    initConversationList(token);
  });
}

/*====== Função que inicializa carregamento do perfil e conversas =============== */
function initializeApp(token) {
  const userString = localStorage.getItem("user");
  if (!userString) {
    console.warn("Usuário não encontrado no localStorage.");
    return;
  }

  currentUser = JSON.parse(userString);
  renderUserProfile();
  initConversationList(token);
  connectSocket();
}

/* ======== Liga todos os eventos da interface (cliques, botões, etc) ========== */
function bindEventListeners(token) {
  DOM.logoutButton?.addEventListener("click", handleLogout);

  DOM.searchButton?.addEventListener("click", () => {
    const phoneNumber = DOM.searchInput.value;
    fetchSearchUserByPhone(phoneNumber, token);
  });

  document.addEventListener("click", (event) => {
    const searchBar = document.querySelector(".search-bar");
    if (
      searchBar &&
      !searchBar.contains(event.target) &&
      !DOM.searchResult.contains(event.target)
    ) {
      DOM.searchResult.innerHTML = "";
      DOM.searchInput.value = "";
    }
  });

  DOM.backBtn?.addEventListener("click", handleBack);
  DOM.closeBtn?.addEventListener("click", handleClose);
  DOM.sendBtn?.addEventListener("click", handleSendMessage);
}

/* ================================================================================ */
/* ================================================================================ */
/* ========================= INÍCIO DA APLICAÇÃO ================================== */
/* ================================================================================ */
/* ================================================================================ */

// Aguarda o DOM carregar completamente para iniciar a aplicação
document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuthentication(token)) return;

  initializeApp(token);
  bindEventListeners(token);
});
