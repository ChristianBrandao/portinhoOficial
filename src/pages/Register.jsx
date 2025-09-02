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

  // se você envia o telefone a partir da tela anterior:
  const prefillPhone = location.state?.phone || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(prefillPhone);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  // endereço
  const [zip, setZip] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [stateUF, setStateUF] = useState('');

  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const phoneDigits = onlyDigits(phone);
    const cpfDigits = onlyDigits(cpf);
    const zipDigits = onlyDigits(zip);

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
    if (!street.trim() || !number.trim() || !district.trim() || !city.trim() || !stateUF.trim()) {
      toast({ title: 'Endereço incompleto', description: 'Preencha todos os campos do endereço.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phoneDigits,
        cpf: cpfDigits,                          // <<=== CPF indo pro backend
        address: {
          zip: zipDigits || undefined,
          street,
          number,
          district,
          city,
          state: stateUF.toUpperCase(),
        },
      });

      toast({ title: 'Cadastro concluído!', description: 'Agora você já pode finalizar sua compra.' });
      // Volta para o fluxo (ex.: para checkout)
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

            <div className="grid gap-3">
              <label className="text-xs text-gray-400">E-mail (opcional)</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
              />
            </div>

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

            {/* CPF OBRIGATÓRIO */}
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

            {/* ENDEREÇO */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-gray-400">CEP</label>
                <InputMask mask="99999-999" value={zip} onChange={(e) => setZip(e.target.value)}>
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      placeholder="00000-000"
                      className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                    />
                  )}
                </InputMask>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <label className="text-xs text-gray-400">Rua</label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Nome da rua"
                  className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-gray-400">Número</label>
                <Input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Nº"
                  className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-gray-400">Bairro</label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Bairro"
                  className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-gray-400">UF</label>
                <Input
                  value={stateUF}
                  onChange={(e) => setStateUF(e.target.value)}
                  maxLength={2}
                  placeholder="UF"
                  className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500 uppercase"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-gray-400">Cidade</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
              />
            </div>

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
