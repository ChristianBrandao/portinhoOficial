// src/services/api.js

// Troque pela URL do seu API Gateway ou use variável de ambiente (recomendado)
const RAW_API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod";

// Remove barra final, se houver
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

/* ----------------------------------------------------------
 * utilitários
 * -------------------------------------------------------- */
const toQuery = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

const tryParseJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    const txt = await res.text();
    return txt ? { message: txt } : null;
  } catch {
    return null;
  }
};

const handleResponse = async (response) => {
  if (response.ok) {
    const data = await tryParseJson(response);
    return data ?? {};
  }
  const data = await tryParseJson(response);
  const msg =
    (data && (data.message || data.error || data.detail)) ||
    `Erro na requisição (${response.status})`;
  const err = new Error(msg);
  err.status = response.status;
  err.data = data;
  throw err;
};

/* ----------------------------------------------------------
 * Autenticação
 * -------------------------------------------------------- */
export const authenticateUser = async (phone, password) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  return handleResponse(res);
};

/* ----------------------------------------------------------
 * Usuário
 * -------------------------------------------------------- */
export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

export const findUserByPhone = async (phone) => {
  const qs = toQuery({ phone });
  const res = await fetch(`${API_BASE_URL}/user?${qs}`, { method: "GET" });

  if (res.status === 404) {
    // backend pode retornar 404 quando não encontrar
    return null;
  }
  return handleResponse(res);
};

/* ----------------------------------------------------------
 * Compras / Pagamentos
 * -------------------------------------------------------- */
/**
 * Inicia a compra: reserva os números e cria o pagamento PIX.
 * Esperado (exemplo de retorno):
 * { purchaseId, paymentId, copyPaste, pix_code, qr_code, numbers? }
 */
export const reserveNumbersAndCreatePayment = async (orderDetails) => {
  const res = await fetch(`${API_BASE_URL}/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderDetails),
  });
  return handleResponse(res);
};

/**
 * Verifica status de pagamento. Usa a rota correta:
 * GET /purchases/status?purchaseId=...
 * Retorno esperado: { purchaseId, status, numbers? }
 */
export const checkPaymentStatus = async (purchaseId) => {
  const qs = toQuery({ purchaseId });
  const res = await fetch(`${API_BASE_URL}/purchases/status?${qs}`, {
    method: "GET",
  });
  return handleResponse(res);
};

/* ----------------------------------------------------------
 * Meus números / Raffles / Prêmios instantâneos
 * -------------------------------------------------------- */
export const getMyNumbers = async (userId) => {
  const qs = toQuery({ userId });
  const res = await fetch(`${API_BASE_URL}/meus-numeros?${qs}`, {
    method: "GET",
  });
  return handleResponse(res);
};

export const getRaffles = async () => {
  const res = await fetch(`${API_BASE_URL}/raffles`, { method: "GET" });
  return handleResponse(res);
};

export const getInstantPrizes = async (raffleId) => {
  if (!raffleId) return [];
  const qs = toQuery({ raffleId });
  const res = await fetch(`${API_BASE_URL}/instantprizes?${qs}`, {
    method: "GET",
  });
  return handleResponse(res);
};

// (Opcional) export para usar a base URL em outras partes do app
export { API_BASE_URL };
