
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader, UserPlus } from 'lucide-react';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import InputMask from 'react-input-mask';
import { authenticateUser } from '@/services/api';

const Login = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userData = await authenticateUser(phone, password);
            toast({
                title: `Bem-vindo, ${userData.name}!`,
                description: 'Login realizado com sucesso.',
            });
            // Aqui você pode salvar o token/sessão do usuário (ex: em localStorage)
            // e atualizar um contexto de autenticação.
            // Por enquanto, apenas redirecionamos.
            navigate('/meus-numeros');
        } catch (error) {
            toast({
                title: 'Erro no Login',
                description: error.message || 'Não foi possível fazer o login. Verifique suas credenciais.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Login - Portinho</title>
                <meta name="description" content="Acesse sua conta para ver seus números e participar de sorteios." />
            </Helmet>
            <div className="min-h-screen bg-gray-900 flex flex-col items-center">
                <Header />
                <main className="w-full max-w-md px-4 py-8 flex-grow flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gray-800 rounded-lg shadow-xl p-8 w-full"
                    >
                        <div className="text-center mb-8">
                            <LogIn className="mx-auto h-12 w-12 text-cyan-400" />
                            <h1 className="text-2xl font-bold text-gray-100 mt-4">Acessar Conta</h1>
                            <p className="text-gray-400">Entre para ver seus números da sorte.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                                <InputMask
                                    mask="(99) 99999-9999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isLoading}
                                >
                                    {(inputProps) => (
                                        <Input
                                            {...inputProps}
                                            id="phone"
                                            required
                                            className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500 mt-1"
                                        />
                                    )}
                                </InputMask>
                            </div>
                            <div>
                                <Label htmlFor="password"  className="text-gray-300">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="bg-gray-700 text-gray-100 border-gray-600 mt-1"
                                />
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3">
                                {isLoading ? <Loader className="animate-spin" /> : 'Entrar'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Não tem uma conta?{' '}
                                <Link to="/cadastro" className="font-medium text-cyan-400 hover:underline">
                                    Cadastre-se aqui <UserPlus className="inline h-4 w-4" />
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default Login;
