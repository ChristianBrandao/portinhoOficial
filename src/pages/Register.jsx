import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import InputMask from 'react-input-mask';

import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { User, Loader } from 'lucide-react';

const API_BASE_URL = "https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod";
const normalizePhone = (s="") => s.replace(/\D/g, "");

const ufs = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function Register() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = React.useState({
    fullName: '',
    phone: '',
    uf: '',
    city: '',
    neighborhood: '',
    street: '',
    cep: '',
    number: ''
  });

  const [cities, setCities] = React.useState([]);
  const [loadingCep, setLoadingCep] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (location.state?.phone) {
      setForm(p => ({ ...p, phone: location.state.phone }));
    }
  }, [location.state]);

  const fetchCities = async (uf) => {
    if (!uf) return;
    try {
      const r = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data = await r.json();
      setCities(data.map(c => c.nome).sort());
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro', description: 'Não foi possível carregar as cidades.', variant: 'destructive' });
    }
  };
  React.useEffect(() => { if (form.uf) fetchCities(form.uf); }, [form.uf]);

  const handleCepChange = async (e) => {
    const masked = e.target.value;
    const cep = masked.replace(/\D/g, '');
    setForm(p => ({ ...p, cep: masked }));

    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const d = await r.json();
        if (!d?.erro) {
          setForm(p => ({
            ...p,
            uf: d.uf || p.uf,
            city: d.localidade || p.city,
            neighborhood: d.bairro || p.neighborhood,
            street: d.logradouro || p.street
          }));
          if (d.uf) await fetchCities(d.uf);
        } else {
          toast({ title: 'CEP não encontrado', description: 'Verifique o CEP.', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Erro ao buscar CEP', description: 'Tente novamente.', variant: 'destructive' });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleInput = (e) => {
    const { id, value } = e.target;
    setForm(p => ({ ...p, [id]: value }));
  };
  const handleSelect = (name, value) => setForm(p => ({ ...p, [name]: value, ...(name === 'uf' ? { city: '' } : {}) }));

  const registerUser = async ({ name, phone, address }) => {
    const res = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, address })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) return toast({ title: 'Nome obrigatório', variant: 'destructive' });
    if (normalizePhone(form.phone).length < 10) return toast({ title: 'Telefone inválido', variant: 'destructive' });
    if (!form.uf || !form.city || !form.neighborhood || !form.street || !form.cep || !form.number) {
      return toast({ title: 'Complete todos os campos', description: 'Rua, Número, Bairro, Cidade, UF e CEP são obrigatórios.', variant: 'destructive' });
    }

    const address = `${form.street}, Nº ${form.number}, ${form.neighborhood} — ${form.city}/${form.uf} — CEP ${form.cep}`;

    setIsSubmitting(true);
    try {
      await registerUser({
        name: form.fullName.trim(),
        phone: normalizePhone(form.phone),
        address
      });

      toast({ title: 'Cadastro concluído!', description: 'Agora você já pode participar do sorteio.' });
      const next = location.state?.next || '/';
      navigate(next);
    } catch (err) {
      toast({ title: 'Erro no cadastro', description: err.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro - Portinho</title>
        <meta name="description" content="Cadastro rápido para participar dos sorteios." />
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-3xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div className="flex flex-col items-center mb-6">
              <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center shadow-lg mb-4">
                <User className="w-16 h-16 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-100">Cadastro rápido</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName" className="text-gray-100">Nome completo</Label>
                  <Input id="fullName" value={form.fullName} onChange={handleInput} required className="bg-gray-700 text-gray-100 border-gray-600" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="phone" className="text-gray-100">Telefone</Label>
                  <InputMask mask="(99) 99999-9999" value={form.phone} onChange={handleInput}>
                    {(inputProps) => <Input {...inputProps} id="phone" required className="bg-gray-700 text-gray-100 border-gray-600" />}
                  </InputMask>
                </div>

                <div>
                  <Label htmlFor="cep" className="text-gray-100">CEP</Label>
                  <InputMask mask="99999-999" value={form.cep} onChange={handleCepChange} disabled={loadingCep}>
                    {(inputProps) => <Input {...inputProps} id="cep" required className="bg-gray-700 text-gray-100 border-gray-600" />}
                  </InputMask>
                </div>

                <div>
                  <Label className="text-gray-100">UF</Label>
                  <Select onValueChange={(v) => handleSelect('uf', v)} value={form.uf}>
                    <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                      <SelectValue placeholder="-- UF --" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                      {ufs.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-100">Cidade</Label>
                  <Select onValueChange={(v) => handleSelect('city', v)} value={form.city} disabled={!form.uf || cities.length === 0}>
                    <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                      <SelectValue placeholder={!form.uf ? "Selecione a UF" : "Selecione a cidade"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                      {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="neighborhood" className="text-gray-100">Bairro</Label>
                  <Input id="neighborhood" value={form.neighborhood} onChange={handleInput} required className="bg-gray-700 text-gray-100 border-gray-600" />
                </div>

                <div>
                  <Label htmlFor="street" className="text-gray-100">Rua</Label>
                  <Input id="street" value={form.street} onChange={handleInput} required className="bg-gray-700 text-gray-100 border-gray-600" />
                </div>

                <div>
                  <Label htmlFor="number" className="text-gray-100">Número</Label>
                  <Input id="number" value={form.number} onChange={handleInput} required className="bg-gray-700 text-gray-100 border-gray-600" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-gray-700 px-8 py-3 rounded-lg w-40">
                  {isSubmitting ? <Loader className="animate-spin" /> : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
}
