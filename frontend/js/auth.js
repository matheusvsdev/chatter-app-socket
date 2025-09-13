/* ====================================================================== */
/* ============================= Constantes ============================= */
/* ====================================================================== */

const API_URL = "http://localhost:3000/api";

const loginContainer = document.getElementById("login-container");
const registerContainer = document.getElementById("register-container");

const loginLink = document.getElementById("link-login");
const registerLink = document.getElementById("link-register");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

const photoInput = document.getElementById("register-photo");
const photoPreview = document.getElementById("photo-preview");

/* ====================================================================== */
/* ============================== Funções =============================== */
/* ====================================================================== */

/* ================= Função para mostrar tela de cadastro =============== */
function showRegister() {
  if (loginContainer && registerContainer) {
    loginContainer.style.display = "none";
    registerContainer.style.display = "flex";
  }
}

/* ================== Função para mostrar tela de login ================= */
function showLogin() {
  if (loginContainer && registerContainer) {
    loginContainer.style.display = "flex";
    registerContainer.style.display = "none";
  }
}

/* =============== Função de requisição para login (API) =============== */
async function login(phone, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro no login");
  }

  return response.json();
}

/* =============== Função de requisição para cadastro (API) ============= */
async function register(formData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    // Tenta ler a mensagem de erro do corpo da resposta
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro no cadastro");
  }

  // Se a resposta for OK, retorna os dados JSON
  return response.json();
}

/* ====================================================================== */
/* ============================== Eventos =============================== */
/* ====================================================================== */

/* =============== Evento de 'click' do link de registro ================ */
registerLink.addEventListener("click", showRegister);

/* ================ Evento de 'click' do link de login ================== */
loginLink.addEventListener("click", showLogin);

/* =============== Evento de 'change' da foto do formulário ============== */
photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.src = e.target.result;
      photoPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    photoPreview.src = "../img/default-profile.jpg";
    photoPreview.style.display = "none";
  }
});

/* ============== Evento de 'submit' do formulário de login ============== */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phone = document.getElementById("login-phone").value;
  const password = document.getElementById("login-password").value;

  try {
    const loginData = await login(phone, password);

    if (loginData && loginData.token) {
      // Salva o token e o objeto do usuário no localStorage
      localStorage.setItem("jwtToken", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      alert("Login realizado com sucesso!");
      window.location.href = "../html/index.html";
    } else {
      console.error("Token não encontrado na resposta da API.");
      alert("Erro no login: Token não recebido.");
    }
  } catch (error) {
    alert(`Erro no login: ${error.message}`);
  }
});

/* =============== Evento de 'submit' do formulário de cadastro ========= */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Pega o arquivo de imagem selecionado
  const photoFile = document.getElementById("register-photo").files[0];
  const name = document.getElementById("register-name").value;
  const phone = document.getElementById("register-phone").value;
  const password = document.getElementById("register-password").value;

  // Cria um novo objeto FormData
  const formData = new FormData();
  formData.append("name", name);
  formData.append("phone", phone);
  formData.append("password", password);

  // Adiciona a foto, se ela existir
  if (photoFile) {
    formData.append("imgUrl", photoFile);
  } else {
    // Se não, busca a imagem padrão no servidor e adiciona ao FormData
    try {
      const defaultImageResponse = await fetch("../img/default-profile.jpg");
      // É crucial adicionar 'await' aqui, pois .blob() também retorna uma Promise
      const blob = await defaultImageResponse.blob();
      formData.append("imgUrl", blob, "default-profile.jpg");
    } catch (error) {
      console.error("Erro ao carregar imagem padrão:", error);
    }
  }

  try {
    // Ideal usar await na chamada de register(formData)
    // já que ela é uma função assíncrona que faz uma requisição
    await register(formData);
    alert("Cadastro efetuado com sucesso!");
    showLogin();
  } catch (error) {
    alert(`Erro no cadastro: ${error.message}`);
  }
});
