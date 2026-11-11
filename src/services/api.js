import { API_URL } from '../config';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let authToken = null;
let onUnauthorized = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const FRIENDLY = {
  0: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Seu perfil não tem acesso a esta ação.',
  404: 'Não encontramos o que você procurava.',
  429: 'Muitas tentativas. Aguarde um minuto e tente de novo.',
  500: 'Erro no servidor. Tente novamente em instantes.',
};

async function request(path, { method = 'GET', body, auth = true, timeout = 15000 } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(FRIENDLY[0], 0);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 && auth && onUnauthorized) onUnauthorized();
    const message = data?.message || FRIENDLY[res.status] || FRIENDLY[500];
    throw new ApiError(message, res.status);
  }
  return data;
}

export const api = {
  login: (Email, Senha) => request('/api/auth/login', { method: 'POST', body: { Email, Senha }, auth: false }),
  register: (payload) => request('/api/auth/registro', { method: 'POST', body: payload }),
  getUser: (id) => request(`/api/auth/user/${id}`),
  updateUser: (id, payload) => request(`/api/auth/user/${id}`, { method: 'PUT', body: payload }),

  listColetas: (user) =>
    request(user.IsAdmin ? '/api/coleta/ObterTodasColetas' : `/api/coleta/ObterColetas/${user.Cadastrarid}`),
  getColeta: (ownerId, id) => request(`/api/coleta/ObterColeta/${ownerId}/${id}`),
  createColeta: (payload) => request('/api/coleta/RegistrarColeta', { method: 'POST', body: payload }),
  updateColeta: (coleta, payload) =>
    request(`/api/coleta/EditarColeta/${coleta.Cadastrarid}/${coleta.Id}`, { method: 'PUT', body: payload }),
  deleteColeta: (coleta) => request(`/api/coleta/DeletarColeta/${coleta.Cadastrarid}/${coleta.Id}`, { method: 'DELETE' }),
};
