// src/pages/Register.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import InputMask from 'react-input-mask';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { registerUser } from '@/services/api';

const onlyDigits = (s) => String(s || '').replace(/\D/g, '');

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const prefillPhone = location.state?.phone || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(prefillPhone);
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const phoneDigits = onlyDigits(phone);
    const cpfDigits = onlyDigits(cpf);

    if (!/^\d{10,11}$/.test(phoneDigits)) {
      toast({ title: 'Telefone inválido', description: 'Use DDD + número.', variant: 'destructive' });
      return;
    }
    if (!/^\d{11}$/.test(cpfDigits)) {
      toast({ title: 'CPF inválido', description: 'Informe 11 dígitos.', variant: 'destructive' });
      return;
    }
    if (!name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        phone: phoneDigits,
        cpf: cpfDigits,
      });

      toast({ title: 'Cadastro concluído!', description: 'Agora você já pode finalizar sua compra.' });
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao cadastrar',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Criar cadastro</title>
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-2xl px-4 py-8">
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 space-y-5"
          >
            <h1 className="text-xl font-bold text-gray-100">Finalize seu cadastro</h1>

            {/* Nome */}
            <div className="grid gap-3">
              <label className="text-xs text-gray-400">Nome completo</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome completo"
                className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
              />
            </div>

            {/* Telefone */}
            <div className="grid gap-3">
              <label className="text-xs text-gray-400">Telefone</label>
              <InputMask mask="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}>
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    required
                    placeholder="(00) 00000-0000"
                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                  />
                )}
              </InputMask>
            </div>

            {/* CPF */}
            <div className="grid gap-3">
              <label className="text-xs text-gray-400">CPF</label>
              <InputMask mask="999.999.999-99" value={cpf} onChange={(e) => setCpf(e.target.value)}>
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    required
                    placeholder="000.000.000-00"
                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                  />
                )}
              </InputMask>
            </div>

            {/* Botão */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                {loading ? 'Salvando...' : 'Salvar cadastro'}
              </Button>
            </div>
          </motion.form>
        </main>
      </div>
    </>
  );
};

export default Register;
