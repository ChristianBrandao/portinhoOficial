// src/components/shared/CheckoutDialog.jsx
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
import { findUserByPhone, reserveNumbersAndCreatePayment, checkPaymentStatus } from '@/services/api';
import { useAppContext } from '@/context/AppContext';

const CheckoutDialog = ({ isOpen, setIsOpen, raffleId, unitPrice, quantity, totalPrice, productName, onPaymentSuccess }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { awardPrize } = useAppContext();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dados retornados pelo backend ao criar a compra PIX
  // Esperado: { purchaseId, paymentId, copyPaste, pix_code, qr_code }
  const [paymentData, setPaymentData] = useState(null);

  const [timer, setTimer] = useState(300);
  const paymentCheckInterval = useRef(null);

  // Contagem regressiva (apenas no passo 3)
  useEffect(() => {
    let countdownInterval;
    if (step === 3 && timer > 0) {
      countdownInterval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && step === 3) {
      toast({
        title: 'Tempo esgotado!',
        description: 'Sua reserva expirou. Por favor, tente novamente.',
        variant: 'destructive',
      });
      handleClose();
    }
    return () => clearInterval(countdownInterval);
  }, [step, timer, toast]);

  // Polling de status enquanto no passo 3
  useEffect(() => {
    if (step === 3 && paymentData?.purchaseId) {
      paymentCheckInterval.current = setInterval(async () => {
        try {
          const result = await checkPaymentStatus(paymentData.purchaseId, user);
          // esperado: { purchaseId, status, numbers?, winningTicket?, ... }
          if (result.status === 'paid') {
            clearInterval(paymentCheckInterval.current);

            if (result.winningTicket) {
              awardPrize(result.winningTicket, user.name);
              onPaymentSuccess?.(result);
            } else {
              toast({
                title: 'Pagamento Confirmado!',
                description: 'Sua compra foi um sucesso! Boa sorte!',
                className: 'bg-green-600 text-white',
              });
              navigate('/pagamento-sucesso', { state: { order: result } });
            }
            handleClose();
          }
        } catch {
          // silencioso
        }
      }, 3000);
    }

    return () => {
      if (paymentCheckInterval.current) clearInterval(paymentCheckInterval.current);
    };
  }, [step, paymentData, user, awardPrize, onPaymentSuccess, navigate, toast]);

  // Passo 1 — Identificação
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const foundUser = await findUserByPhone(phone);
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

  // Passo 2 — Criar reserva + pagamento PIX
  const handleReserve = async () => {
    setIsLoading(true);
    try {
      const orderDetails = {
        raffleId,
        userId: user.id,
        quantity,
        unitPrice, // back calcula total com segurança
        totalPrice,
        productName,
        customer: {
          name: user.name,
          email: 'contato@seudominio.com', // informativo; cobrança usa e-mail fixo no back
        },
      };

      const data = await reserveNumbersAndCreatePayment(orderDetails);
      // deve conter: { purchaseId, copyPaste || pix_code, qr_code? }
      setPaymentData(data);
      setStep(3);
      setTimer(300);
    } catch (error) {
      toast({
        title: 'Erro na Reserva',
        description: error?.message || 'Não foi possível criar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Utilidades
  const copyToClipboard = () => {
    const pix = paymentData?.copyPaste || paymentData?.pix_code || '';
    if (pix) {
      navigator.clipboard.writeText(pix);
      toast({ title: 'Copiado!', description: 'O código PIX foi copiado para a área de transferência.' });
    }
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

  // Render das etapas
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-100">
                <User /> Identificação
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-4">
              <p className="text-gray-400">Digite seu telefone para continuar.</p>
              <InputMask mask="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}>
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    placeholder="(21) 99999-9999"
                    required
                    autoFocus
                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                  />
                )}
              </InputMask>
              <Button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                {isLoading ? (<><Loader className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>) : (<>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>)}
              </Button>
            </form>
          </motion.div>
        );

      case 1.1:
        return (
          <motion.div key="step1.1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-xl text-yellow-400">
                <AlertCircle /> Usuário não encontrado
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 text-center">
              <p className="text-gray-300">Não encontramos uma conta para o número <span className="font-bold">{phone}</span>.</p>
              <p className="text-gray-400">Deseja criar uma nova conta ou tentar outro número?</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button onClick={() => { setStep(1); setPhone(''); }} className="w-full bg-gray-600 hover:bg-gray-500 text-white">Tentar novamente</Button>
                <Button onClick={handleRegisterRedirect} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                  <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-100">
                <ShoppingCart /> Checkout
              </DialogTitle>
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
                {isLoading ? (<><Loader className="mr-2 h-4 w-4 animate-spin" /> Reservando...</>) : (<>Concluir Reserva <ArrowRight className="ml-2 h-4 w-4" /></>)}
              </Button>
              <button onClick={() => setStep(1)} className="w-full text-center text-cyan-400 hover:underline text-sm">Alterar conta</button>
            </div>
          </motion.div>
        );

      case 3: {
        // <<< ENVOLVIDO EM CHAVES PARA PERMITIR const/let
        const qrText = paymentData?.copyPaste || paymentData?.pix_code || '';
        const qrImg  = paymentData?.qr_code; // data:image/... base64 (fallback opcional)

        return (
          <motion.div key="step3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-100">
                <QrCode /> Pague com PIX
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4 text-center">
              <div className="bg-yellow-800 text-yellow-100 p-3 rounded-md">
                <p>Sua reserva expira em: <strong>{formatTime(timer)}</strong></p>
              </div>

              <div className="p-4 bg-white rounded-lg inline-flex items-center justify-center min-w-[208px] min-h-[208px]">
                {qrText ? (
                  <QRCode value={qrText} size={200} />
                ) : qrImg ? (
                  <img src={qrImg} alt="QR Pix" width={200} height={200} />
                ) : (
                  <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse rounded" />
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Loader className="animate-spin h-4 w-4" />
                <span>Aguardando pagamento...</span>
              </div>

              <p className="text-gray-400">Ou use o PIX Copia e Cola:</p>

              <div className="relative">
                <Input
                  readOnly
                  value={qrText}
                  placeholder="Carregando código PIX..."
                  className="bg-gray-700 text-gray-200 pr-10 truncate"
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={copyToClipboard} disabled={!qrText}>
                  <Copy size={16} />
                </Button>
              </div>

              {paymentData?.purchaseId && (
                <p className="text-sm text-gray-400">
                  Compra: <span className="font-mono text-gray-300">{paymentData.purchaseId}</span>
                </p>
              )}

              {/* Números só aparecem após o status "paid" */}
              <p className="text-xs text-gray-500">Após o pagamento, seus números serão confirmados em alguns instantes.</p>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 sm:max-w-md">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-6 w-6" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
