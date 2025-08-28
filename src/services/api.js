import { MOCK_PRIZE_DATA } from './mockData';

let prizeData = MOCK_PRIZE_DATA;

const findNextAvailableWinnerTicket = () => {
    const availableWinner = prizeData.winners.find(w => !w.awarded);
    return availableWinner ? availableWinner.id : null;
};

export const findUserByPhone = async (phone) => {
  console.log(`[API MOCK] Buscando usuário com telefone: ${phone}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const MOCK_USER_DATA = {
        '(21) 99999-9999': {
          id: 'user-123',
          name: 'CHRISTIAN XAVIER BRANDAO',
          phone: '(21) 9****-****'
        },
        '(11) 11111-1111': {
          id: 'user-456',
          name: 'Maria Oliveira',
          phone: '(11) 1****-****'
        }
      };
      const user = MOCK_USER_DATA[phone] || null;
      resolve(user);
    }, 1000);
  });
};

export const reserveNumbersAndCreatePayment = async (orderDetails) => {
  console.log('[API MOCK] Reservando números e criando pagamento:', orderDetails);
  return new Promise(resolve => {
    setTimeout(() => {
      const reservationId = `res_${Date.now()}`;
      const pixData = {
        qrCode: `00020126580014br.gov.bcb.pix0136${reservationId}-4b1b-49d3-9b27-2c2a6a4270155204000053039865802BR5925NOME DO VENDEDOR6009SAO PAULO62070503***6304E2D3`,
        copyPaste: `00020126580014br.gov.bcb.pix0136${reservationId}-4b1b-49d3-9b27-2c2a6a4270155204000053039865802BR5925NOME DO VENDEDOR6009SAO PAULO62070503***6304E2D3`,
        reservationId: reservationId,
      };
      resolve(pixData);
    }, 1500);
  });
};

export const checkPaymentStatus = async (reservationId, user) => {
  console.log(`[API MOCK] Verificando status da reserva: ${reservationId}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const isPaid = Math.random() > 0.7; 
      if (isPaid) {
        const winningTicket = findNextAvailableWinnerTicket();
        
        const response = { 
          status: 'paid', 
          reservationId: reservationId,
          purchasedNumbers: ['12345', '67890', '54321', winningTicket || '98765'].filter(Boolean),
          productName: prizeData.name,
          winningTicket: winningTicket, 
        };

        if (winningTicket) {
            console.log(`[API MOCK] Usuário ${user.name} ganhou com o bilhete ${winningTicket}`);
            const winnerIndex = prizeData.winners.findIndex(w => w.id === winningTicket);
            if(winnerIndex !== -1) {
                prizeData.winners[winnerIndex] = { ...prizeData.winners[winnerIndex], awarded: true, name: user.name, date: new Date().toLocaleDateString('pt-BR') };
            }
        }
        
        resolve(response);
      } else {
        resolve({ status: 'pending' });
      }
    }, 2000);
  });
};

export const getPrizeData = async () => {
    return new Promise(resolve => setTimeout(() => resolve(prizeData), 500));
}

export const getWinners = async () => {
    const awarded = prizeData.winners.filter(w => w.awarded);
    return new Promise(resolve => setTimeout(() => resolve(awarded), 500));
}

export const authenticateUser = async (phone, password) => {
  console.log(`[API MOCK] Autenticando usuário: ${phone}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (phone === '(21) 99999-9999' && password === 'password') {
        resolve({
          id: 'user-123',
          name: 'CHRISTIAN XAVIER BRANDAO',
          email: 'christian@example.com',
          token: 'mock-jwt-token'
        });
      } else {
        reject(new Error('Credenciais inválidas.'));
      }
    }, 1000);
  });
};

export const getMyNumbers = async (userId) => {
    console.log(`[API MOCK] Buscando números para o usuário: ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                'Adv 2025 0km': ['12345', '67890', '54321'],
                'iPhone 15 Pro Max': ['99887', '11223']
            });
        }, 1000);
    });
};