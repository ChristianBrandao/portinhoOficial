// Substitua esta URL pela URL base da sua API no API Gateway
const API_BASE_URL = 'https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod';

/**
 * Função para lidar com erros de resposta da API
 * @param {Response} response A resposta da requisição.
 * @returns {Promise<any>} O corpo da resposta, ou um erro se a resposta não for OK.
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // tenta ler JSON; se falhar, usa texto simples
    let errorMessage = 'Erro na requisição.';
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorMessage;
    } catch {
      try {
        errorMessage = await response.text();
      } catch {}
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * Autentica um usuário com telefone e senha.
 * @param {string} phone O telefone do usuário.
 * @param {string} password A senha do usuário.
 * @returns {Promise<object>} Os dados do usuário logado.
 */
export const authenticateUser = async (phone, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw error;
  }
};

/**
 * Cadastra um novo usuário.
 * @param {object} userData Os dados do novo usuário.
 * @returns {Promise<object>} A mensagem de sucesso do cadastro.
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
};

/**
 * Busca um usuário pelo número de telefone.
 * @param {string} phone O número de telefone a ser buscado.
 * @returns {Promise<object|null>} Os dados do usuário, ou null se não for encontrado.
 */
export const findUserByPhone = async (phone) => {
  try {
    const url = `${API_BASE_URL}/user?phone=${encodeURIComponent(phone)}`;
    const response = await fetch(url, { method: 'GET' });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário por telefone:', error);
    // Se a API padroniza "não encontrado" na message, trate como null
    if (String(error.message).toLowerCase().includes('não encontrado')) {
      return null;
    }
    throw error;
  }
};

/**
 * Inicia uma nova compra, reservando os números e criando o pagamento.
 * @param {object} orderDetails Os detalhes da compra.
 * @returns {Promise<object>} Os dados de pagamento e o ID da reserva.
 */
export const reserveNumbersAndCreatePayment = async (orderDetails) => {
  try {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderDetails),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro ao iniciar a compra:', error);
    throw error;
  }
};

/**
 * Verifica o status de uma compra pelo ID.
 * IMPORTANTE: usa a rota com QUERY, que é a publicada no Gateway:
 *   GET /purchases/status?purchaseId=...
 * @param {string} purchaseId O ID da compra (ex.: "purchase-172...").
 * @returns {Promise<object>} O status da compra e, se pago, os números comprados.
 */
export const checkPaymentStatus = async (purchaseId) => {
  if (!purchaseId) {
    throw new Error('purchaseId ausente no checkPaymentStatus');
  }
  const url = `${API_BASE_URL}/purchases/status?purchaseId=${encodeURIComponent(purchaseId)}`;
  try {
    // console.log('[checkPaymentStatus] GET', url); // debug opcional
    const response = await fetch(url, { method: 'GET' });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro ao verificar o status do pagamento:', error);
    throw error;
  }
};

/**
 * Busca os números comprados por um usuário.
 * @param {string} userId O ID do usuário.
 * @returns {Promise<object>} Os números comprados, agrupados por sorteio.
 */
export const getMyNumbers = async (userId) => {
  try {
    const url = `${API_BASE_URL}/meus-numeros?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url, { method: 'GET' });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar números do usuário:', error);
    throw error;
  }
};

/**
 * Busca os dados dos sorteios disponíveis.
 * @returns {Promise<Array>} Uma lista com os sorteios.
 */
export const getRaffles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/raffles`, {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar os sorteios:', error);
    throw error;
  }
};

/**
 * Busca os prêmios instantâneos de um sorteio específico.
 * @param {string} raffleId O ID do sorteio.
 * @returns {Promise<Array>} Uma lista com os prêmios instantâneos.
 */
export const getInstantPrizes = async (raffleId) => {
  if (!raffleId) {
    console.error('ID do sorteio não fornecido para buscar prêmios.');
    return [];
  }
  try {
    const url = `${API_BASE_URL}/instantprizes?raffleId=${encodeURIComponent(raffleId)}`;
    const response = await fetch(url, { method: 'GET' });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar os prêmios instantâneos:', error);
    throw error;
  }
};
