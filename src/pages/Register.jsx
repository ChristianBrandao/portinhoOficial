
import React, { useState, useEffect } from 'react';
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

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: '',
    socialName: '',
    cpf: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    confirmPhone: '',
    cep: '',
    address: '',
    number: '',
    neighborhood: '',
    complement: '',
    uf: '',
    city: '',
    reference: '',
  });

  const [cities, setCities] = useState([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.phone) {
      setFormData(prev => ({ ...prev, phone: location.state.phone, confirmPhone: location.state.phone }));
    }
  }, [location.state]);


  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const fetchCities = async (uf) => {
    if (!uf) return;
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data = await response.json();
      setCities(data.map(city => city.nome).sort());
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      toast({ title: 'Erro', description: 'Não foi possível carregar as cidades.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (formData.uf) {
      fetchCities(formData.uf);
    }
  }, [formData.uf]);

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, cep: e.target.value });

    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
          toast({ title: 'CEP não encontrado', description: 'Por favor, verifique o CEP digitado.', variant: 'destructive' });
        } else {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            uf: data.uf,
          }));
          await fetchCities(data.uf);
        }
      } catch (error) {
        toast({ title: 'Erro ao buscar CEP', description: 'Tente novamente mais tarde.', variant: 'destructive' });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (name, value) => {
     setFormData({ ...formData, [name]: value });
     if (name === 'uf') {
        setFormData(prev => ({ ...prev, city: '' }));
     }
  };

  const registerUser = async (userData) => {
    console.log("Enviando para o backend:", userData);
    
    // Simulação da chamada para o backend
    // Substitua este bloco pelo seu fetch para a API da AWS
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular sucesso ou falha
        if (userData.email.includes("fail")) {
          reject(new Error("Este e-mail já está em uso."));
        } else {
          resolve({ success: true, message: "Usuário cadastrado com sucesso!" });
        }
      }, 1500);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Erro de Validação', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    if (formData.phone !== formData.confirmPhone) {
      toast({ title: 'Erro de Validação', description: 'Os números de telefone não coincidem.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { confirmPassword, confirmPhone, ...apiData } = formData;
      const response = await registerUser(apiData);

      toast({
        title: 'Cadastro Concluído!',
        description: response.message,
      });

      // Redireciona para a home ou para a página de 'meus números' após o sucesso
      navigate('/'); 

    } catch (error) {
      toast({
        title: 'Erro no Cadastro',
        description: error.message || 'Não foi possível completar o cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Cadastro - Caikmisera</title>
        <meta name="description" content="Crie sua conta para participar dos sorteios." />
        <meta property="og:title" content="Cadastro - Caikmisera" />
        <meta property="og:description" content="Crie sua conta para participar dos sorteios." />
      </Helmet>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-3xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center shadow-lg mb-4">
                <User className="w-20 h-20 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-100">Crie sua Conta</h1>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="fullName" className="text-gray-100">Nome completo</Label>
                    <Input id="fullName" value={formData.fullName} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="socialName" className="text-gray-100">Nome Social</Label>
                    <Input id="socialName" value={formData.socialName} onChange={handleChange} className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="cpf" className="text-gray-100">CPF</Label>
                    <InputMask mask="999.999.999-99" value={formData.cpf} onChange={handleChange}>
                        {(inputProps) => <Input {...inputProps} id="cpf" required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="birthDate" className="text-gray-100">Data de nascimento</Label>
                    <Input id="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                 <div>
                    <Label htmlFor="email" className="text-gray-100">E-mail</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="exemplo@exemplo.com" className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div></div>
                <div>
                    <Label htmlFor="password" className="text-gray-100">Senha</Label>
                    <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="confirmPassword" className="text-gray-100">Repita a senha</Label>
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="phone" className="text-gray-100">Telefone</Label>
                    <InputMask mask="(99) 99999-9999" value={formData.phone} onChange={handleChange}>
                        {(inputProps) => <Input {...inputProps} id="phone" required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="confirmPhone" className="text-gray-100">Confirmar telefone</Label>
                    <InputMask mask="(99) 99999-9999" value={formData.confirmPhone} onChange={handleChange}>
                        {(inputProps) => <Input {...inputProps} id="confirmPhone" required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="cep" className="text-gray-100">CEP</Label>
                     <InputMask mask="99999-999" value={formData.cep} onChange={handleCepChange} disabled={loadingCep}>
                        {(inputProps) => <Input {...inputProps} id="cep" required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />}
                    </InputMask>
                </div>
                 <div>
                    <Label htmlFor="address" className="text-gray-100">Logradouro</Label>
                    <Input id="address" value={formData.address} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="number" className="text-gray-100">Número</Label>
                    <Input id="number" value={formData.number} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="neighborhood" className="text-gray-100">Bairro</Label>
                    <Input id="neighborhood" value={formData.neighborhood} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                 <div>
                    <Label htmlFor="complement" className="text-gray-100">Complemento</Label>
                    <Input id="complement" value={formData.complement} onChange={handleChange} className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
                <div>
                    <Label htmlFor="uf" className="text-gray-100">UF</Label>
                    <Select onValueChange={(value) => handleSelectChange('uf', value)} value={formData.uf}>
                        <SelectTrigger id="uf" className="bg-gray-700 text-gray-100 border-gray-600">
                            <SelectValue placeholder="-- UF --" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                            {ufs.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="city" className="text-gray-100">Cidade</Label>
                    <Select onValueChange={(value) => handleSelectChange('city', value)} value={formData.city} disabled={!formData.uf || cities.length === 0}>
                        <SelectTrigger id="city" className="bg-gray-700 text-gray-100 border-gray-600">
                            <SelectValue placeholder={!formData.uf ? "Selecione o estado" : "Selecione a cidade"} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                             {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="reference" className="text-gray-100">Ponto de referência</Label>
                    <Input id="reference" value={formData.reference} onChange={handleChange} className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-gray-700 px-8 py-3 rounded-lg w-32">
                      {isSubmitting ? <Loader className="animate-spin" /> : 'Salvar'}
                  </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Register;
