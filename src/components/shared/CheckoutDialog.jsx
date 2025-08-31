import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Copy, Loader, QrCode, ShoppingCart, User, X, UserPlus, AlertCircle } from 'lucide-react';
import InputMask from 'react-input-mask';
import QRCode from 'qrcode.react';
// mantém seu findUserByPhone se já existir
import { findUserByPhone } from '@/services/api';
import { useAppContext } from '@/context/AppContext';

const API = 'https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod'; // ajuste se mudar

const CheckoutDialog = ({
  isOpen,
  setIsOpen,
  raffleId,                 // <= passe o id do sorteio
  unitPrice,                // <= passe o preço unitário; se não vier, cai no fallback totalPrice/quantity
  quantity,
  totalPrice,
  productName,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { awardPrize } = useAppContext();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // dados do pagamento/PIX
  const [paymentData, setPaymentData] = useState(null); // { reservationId, purchasedNumbers, qrDataUrl, copyPaste }
  const [timer, setTimer] = useState(300);
  const paymentCheckInterval = useRef(null);

  // calcula unitPrice se não vier por props
  const effectiveUnitPrice = typeof unitPrice === 'number'
    ? unitPrice
    : (quantity > 0 ? Number(totalPrice) / Number(quantity) : 0);

  useEffect(() => {
    let countdownInterval;
    if (step === 3 && timer > 0) {
      countdownInterval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && step === 3) {
      toast({ title: 'Tempo esgotado!', description: 'Sua reserva expirou. Por favor, tente novamente.', variant: 'destructive' });
      handleClose();
    }
    return () => clearInterval(countdownInterval);
  }, [step, timer, toast]);

  useEffect(() => {
    if (step === 3 && paymentData?.reservationId) {
      paymentCheckInterval.current = setInterval(async () => {
        try {
          const r = await fetch(`${API}/purchases/status?purchaseId=${encodeURIComponent(paymentData.reservationId)}`);
          if (!r.ok) return;
          const s = await r.json(); // { purchaseId, status, numbers }
          if (s.status === 'paid') {
            clearInterval(paymentCheckInterval.current);

            // monta o objeto esperado pela sua tela de sucesso:
            const result = {
              status: 'paid',
              reservationId: paymentData.reservationId,
              purchasedNumbers: paymentData.purchasedNumbers || [],
              productName,
              winningTicket: null,
            };

            if (result.winningTicket) {
              awardPrize(result.winningTicket, user?.name || 'Cliente');
              onPaymentSuccess?.(result);
            } else {
              toast({ title: 'Pagamento Confirmado!', description: 'Sua compra foi um sucesso! Boa sorte!', className: 'bg-green-600 text-white' });
              navigate('/pagamento-sucesso', { state: { order: result } });
            }
            handleClose();
          }
        } catch {
          // ignora erros temporários
        }
      }, 3000);
    }

    return () => {
      if (paymentCheckInterval.current) clearInterval(paymentCheckInterval.current);
    };
  }, [step, paymentData, navigate, user, awardPrize, onPaymentSuccess, productName, toast]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const foundUser = await findUserByPhone(phone); // mantém sua busca de usuário
      if (foundUser) {
        setUser(foundUser);
        setStep(2);
      } else {
        setStep(1.1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // chama POST /purchases (PIX) e mapeia retorno
  const handleReserve = async () => {
    setIsLoading(true);
    try {
      if (!raffleId) throw new Error('raffleId não informado.');
      if (!effectiveUnitPrice) throw new Error('Preço unitário inválido.');
      if (!user) throw new Error('Usuário não definido.');

      // MP precisa de e-mail — use do usuário ou fallback
      const payerEmail =
        (user.email && String(user.email).trim().toLowerCase()) ||
        (import.meta.env.VITE_FALLBACK_EMAIL ? String(import.meta.env.VITE_FALLBACK_EMAIL).trim().toLowerCase() : 'contato@seudominio.com');

      const res = await fetch(`${API}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId,
          quantity,
          unitPrice: Number(effectiveUnitPrice),
          customer: { name: user.name || 'Cliente', email: payerEmail },
          userId: user.id || null
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Não foi possível criar o pagamento PIX (${res.status}). ${t}`);
      }

      const data = await res.json();
      // backend: { purchaseId, paymentId, numbers, pix_code, qr_code }
      setPaymentData({
        reservationId: data.purchaseId,
        purchasedNumbers: Array.isArray(data.numbers) ? data.numbers : [],
        qrDataUrl: data.qr_code || '',     // data:image/jpeg;base64,...
        copyPaste: data.pix_code || ''
      });
      setStep(3);
      setTimer(300);
    } catch (error) {
      toast({ title: 'Erro na Reserva', description: error.message || 'Não foi possível criar o pagamento. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const str = paymentData?.copyPaste || '';
    if (!str) return;
    navigator.clipboard.writeText(str);
    toast({ title: 'Copiado!', description: 'O código PIX foi copiado para a área de transferência.' });
  };

  const resetState = () => {
    setStep(1);
    setUser(null);
    setPhone('');
    setPaymentData(null);
    setIsLoading(false);
    setTimer(300);
    if (paymentCheckInterval.current) clearInterval(paymentCheckInterval.current);
  };

  const handleClose = () => setIsOpen(false);

  const onDialogClose = (open) => {
    if (!open) setTimeout(resetState, 300);
    setIsOpen(open);
  };

  const handleRegisterRedirect = () => {
    handleClose();
    navigate('/cadastro', { state: { phone } });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Identificação
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-100"><User /> Identificação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-4">
              <p className="text-gray-400">Digite seu telefone para continuar.</p>
              <InputMask mask="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}>
                {(inputProps) => <Input {...inputProps} placeholder="(21) 99999-9999" required autoFocus className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />}
              </InputMask>
              <Button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          </motion.div>
        );

      case 1.1: // Usuário não encontrado
        return (
          <motion.div key="step1.1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-xl text-yellow-400"><AlertCircle /> Usuário não encontrado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 text-center">
              <p className="text-gray-300">Não encontramos uma conta para o número <span className="font-bold">{phone}</span>.</p>
              <p className="text-gray-400">Deseja criar uma nova conta ou tentar outro número?</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button onClick={() => { setStep(1); setPhone(''); }} className="w-full bg-gray-600 hover:bg-gray-500 text-white">
                  Tentar novamente
                </Button>
                <Button onClick={handleRegisterRedirect} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                  <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 2: // Confirmação da Reserva
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-100"><ShoppingCart /> Checkout</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="bg-green-800 text-green-100 p-3 rounded-md flex items-center gap-3">
                <CheckCircle />
                <p>Você está adquirindo <strong>{quantity}</strong> título(s) do produto <strong>{productName}</strong></p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-md">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center"><User size={32} /></div>
                <div>
                  <p className="font-bold text-lg">{user?.name}</p>
                  <p className="text-gray-400">{user?.phone}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Ao efetuar este pagamento e confirmar a compra deste título de capitalização, declaro que li e concordo com os termos disponíveis na página da campanha.
              </p>
              <Button onClick={handleReserve} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg h-12">
                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Reservando...</> : <>Concluir Reserva <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
              <button onClick={() => setStep(1)} className="w-full text-center text-cyan-400 hover:underline text-sm">
                Alterar conta
              </button>
            </div>
          </motion.div>
        );

      case 3: // Pagamento PIX
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-100"><QrCode /> Pague com PIX</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 text-center">
              <div className="bg-yellow-800 text-yellow-100 p-3 rounded-md">
                <p>Sua reserva expira em: <strong>{formatTime(timer)}</strong></p>
              </div>

              {/* Mostra o QR vindo do backend; se não vier, gera via copia-e-cola */}
              <div className="p-4 bg-white rounded-lg inline-block">
                {paymentData?.qrDataUrl ? (
                  <img src={paymentData.qrDataUrl} alt="QR Code PIX" className="w-52 h-52" />
                ) : paymentData?.copyPaste ? (
                  <QRCode value={paymentData.copyPaste} size={200} />
                ) : null}
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Loader className="animate-spin h-4 w-4" />
                <span>Aguardando pagamento...</span>
              </div>

              <p className="text-gray-400">Ou use o PIX Copia e Cola:</p>
              <div className="relative">
                <Input readOnly value={paymentData?.copyPaste || ''} className="bg-gray-700 text-gray-400 pr-10 truncate" />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={copyToClipboard}>
                  <Copy size={16} />
                </Button>
              </div>

              <div className="text-left text-sm text-gray-300 space-y-1">
                <div><span className="text-gray-400">Compra:</span> <b>{paymentData?.reservationId}</b></div>
                <div><span className="text-gray-400">Números reservados:</span></div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(paymentData?.purchasedNumbers || []).map(n => (
                    <span key={n} className="bg-cyan-700 text-cyan-100 px-2 py-0.5 rounded font-mono text-xs">{n}</span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500">Após o pagamento, seus números serão confirmados em alguns instantes.</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 sm:max-w-md">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
          <X className="h-6 w-6" />
          <span className="sr-only">Fechar</span>
        </DialogClose>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
