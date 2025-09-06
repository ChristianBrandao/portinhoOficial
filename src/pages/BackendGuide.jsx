
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/shared/Header';
import { Database, Table, Key, Link2, Server } from 'lucide-react';

const Section = ({ title, icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
    >
        <div className="flex items-center mb-4">
            {icon}
            <h2 className="text-2xl font-bold text-gray-100 ml-3">{title}</h2>
        </div>
        {children}
    </motion.div>
);

const TableSchema = ({ name, description, columns }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-cyan-400">{name}</h3>
        <p className="text-gray-400 mb-3">{description}</p>
        <div className="overflow-x-auto rounded-md bg-gray-900">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-700 text-xs text-gray-300 uppercase">
                    <tr>
                        <th className="px-4 py-2">Coluna</th>
                        <th className="px-4 py-2">Tipo Sugerido</th>
                        <th className="px-4 py-2">Descrição</th>
                        <th className="px-4 py-2">Exemplo</th>
                    </tr>
                </thead>
                <tbody>
                    {columns.map((col, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-800">
                            <td className="px-4 py-2 font-mono font-bold text-white">{col.name}</td>
                            <td className="px-4 py-2 font-mono text-cyan-300">{col.type}</td>
                            <td className="px-4 py-2 text-gray-400">{col.desc}</td>
                            <td className="px-4 py-2 font-mono text-gray-500">{col.example}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const BackendGuide = () => {
    const tables = {
        users: {
            name: "Users",
            description: "Armazena as informações de todos os usuários cadastrados.",
            columns: [
                { name: "id", type: "UUID/String", desc: "Identificador único (Chave Primária)", example: "user-abc-123" },
                { name: "fullName", type: "String", desc: "Nome completo do usuário", example: "João da Silva" },
                { name: "socialName", type: "String", desc: "Nome social (opcional)", example: "Jojo" },
                { name: "cpf", type: "String", desc: "CPF do usuário", example: "123.456.789-00" },
                { name: "birthDate", type: "Date", desc: "Data de nascimento", example: "1990-01-15" },
                { name: "email", type: "String", desc: "E-mail (deve ser único)", example: "joao@email.com" },
                { name: "passwordHash", type: "String", desc: "Senha criptografada", example: "hash_super_seguro" },
                { name: "phone", type: "String", desc: "Telefone (deve ser único)", example: "(21) 99999-9999" },
                { name: "address", type: "JSON/String", desc: "Endereço completo (CEP, logradouro, etc.)", example: "{ cep: '...', ... }" },
                { name: "createdAt", type: "Timestamp", desc: "Data de criação do registro", example: "2025-08-27T10:00:00Z" },
            ]
        },
        raffles: {
            name: "Raffles",
            description: "Gerencia os sorteios principais. Cada registro é um sorteio.",
            columns: [
                { name: "id", type: "UUID/String", desc: "Identificador único (Chave Primária)", example: "raffle-xyz-789" },
                { name: "name", type: "String", desc: "Nome do prêmio principal", example: "Adv 2025 0km" },
                { name: "description", type: "String", desc: "Descrição detalhada do sorteio", example: "Moto + iPhone + Capacete" },
                { name: "imageURL", type: "String", desc: "URL da imagem principal do prêmio", example: "https://.../adv.jpg" },
                { name: "pricePerTicket", type: "Number", desc: "Preço de cada número/título", example: "0.02" },
                { name: "status", type: "String", desc: "Status do sorteio (ativo, concluído, em breve)", example: "ativo" },
            ]
        },
        instantPrizes: {
            name: "InstantPrizes",
            description: "Controla os prêmios instantâneos associados a um sorteio.",
            columns: [
                { name: "id", type: "String", desc: "Número premiado (Chave Primária)", example: "1000001" },
                { name: "raffleId", type: "UUID/String", desc: "ID do sorteio principal (Chave Estrangeira para Raffles)", example: "raffle-xyz-789" },
                { name: "prizeName", type: "String", desc: "Nome do prêmio instantâneo", example: "PS5" },
                { name: "isAwarded", type: "Boolean", desc: "Indica se o prêmio já foi ganho", example: "false" },
                { name: "winnerId", type: "UUID/String", desc: "ID do usuário ganhador (Chave Estrangeira para Users)", example: "user-abc-123" },
                { name: "awardedAt", type: "Timestamp", desc: "Data em que o prêmio foi ganho", example: "2025-08-28T14:30:00Z" },
            ]
        },
        purchases: {
            name: "Purchases",
            description: "Registra cada transação de compra de números.",
            columns: [
                { name: "id", type: "UUID/String", desc: "ID da compra/reserva (Chave Primária)", example: "purchase-1234" },
                { name: "userId", type: "UUID/String", desc: "ID do usuário que comprou (Chave Estrangeira para Users)", example: "user-abc-123" },
                { name: "raffleId", type: "UUID/String", desc: "ID do sorteio (Chave Estrangeira para Raffles)", example: "raffle-xyz-789" },
                { name: "quantity", type: "Number", desc: "Quantidade de números comprados", example: "10" },
                { name: "totalPrice", type: "Number", desc: "Valor total pago", example: "0.20" },
                { name: "paymentProviderId", type: "String", desc: "ID da transação no gateway de pagamento", example: "mp-trans-id-5678" },
                { name: "status", type: "String", desc: "Status do pagamento (pending, paid, failed)", example: "paid" },
                { name: "createdAt", type: "Timestamp", desc: "Data da compra", example: "2025-08-28T14:25:00Z" },
            ]
        },
        purchasedNumbers: {
            name: "PurchasedNumbers",
            description: "Associa os números gerados a uma compra específica.",
            columns: [
                { name: "number", type: "String", desc: "O número da sorte gerado (Chave Primária)", example: "1234567" },
                { name: "purchaseId", type: "UUID/String", desc: "ID da compra (Chave Estrangeira para Purchases)", example: "purchase-1234" },
                { name: "userId", type: "UUID/String", desc: "ID do usuário (para facilitar consultas)", example: "user-abc-123" },
                { name: "raffleId", type: "UUID/String", desc: "ID do sorteio (para facilitar consultas)", example: "raffle-xyz-789" },
            ]
        }
    };

    return (
        <>
            <Helmet>
                <title>Guia do Backend - rempdasorte</title>
                <meta name="description" content="Guia de implementação do backend e estrutura de tabelas para o projeto." />
            </Helmet>
            <div className="min-h-screen bg-gray-900 flex flex-col items-center">
                <Header />
                <main className="w-full max-w-5xl px-4 py-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
                        <Database className="mx-auto h-16 w-16 text-cyan-400" />
                        <h1 className="text-4xl font-extrabold text-gray-100 mt-4">Guia de Implementação do Backend</h1>
                        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Um guia completo com a estrutura de dados necessária para o seu backend na AWS, baseado no front-end que construímos.</p>
                    </motion.div>

                    <Section title="Serviço de Banco de Dados (AWS)" icon={<Server className="w-8 h-8 text-yellow-500" />}>
                        <p className="text-gray-300 mb-4">Para hospedar seu banco de dados na AWS, aqui estão duas excelentes opções:</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-bold text-lg text-white">Amazon DynamoDB (Recomendado)</h3>
                                <p className="text-gray-400 text-sm mt-1">Um banco de dados NoSQL gerenciado, ideal para alta performance e escalabilidade. Perfeito para o volume de transações e acessos de um site de sorteios.</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-bold text-lg text-white">Amazon RDS (Alternativa)</h3>
                                <p className="text-gray-400 text-sm mt-1">Serviço de banco de dados relacional (SQL) gerenciado. Use se você prefere a estrutura do SQL com serviços como PostgreSQL ou MySQL.</p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Estrutura das Tabelas" icon={<Table className="w-8 h-8 text-cyan-400" />}>
                       {Object.values(tables).map(table => <TableSchema key={table.name} {...table} />)}
                    </Section>
                    
                    <Section title="Lógica do Backend" icon={<Link2 className="w-8 h-8 text-green-500" />}>
                        <div className="text-gray-300 space-y-3">
                           <p>1. **Cadastro e Login:** Crie endpoints para registrar (`/register`) e autenticar (`/login`) usuários. Lembre-se de sempre armazenar senhas usando um algoritmo de hash seguro (ex: bcrypt).</p>
                           <p>2. **Fluxo de Compra:**
                             <ul className="list-disc list-inside ml-4 mt-2 text-gray-400 space-y-1">
                               <li>O front-end enviará os detalhes da compra para um endpoint (`/purchases`).</li>
                               <li>Seu backend deve criar um registro na tabela `Purchases` com status `pending`.</li>
                               <li>Integre com seu gateway de pagamento (Mercado Pago) para gerar o PIX.</li>
                               <li>Retorne os dados do PIX (QR Code, Copia e Cola) para o front-end.</li>
                             </ul>
                           </p>
                           <p>3. **Confirmação de Pagamento (Webhook):**
                             <ul className="list-disc list-inside ml-4 mt-2 text-gray-400 space-y-1">
                                <li>Configure um webhook no seu gateway de pagamento que notificará um endpoint seu (`/payment-webhook`) quando um pagamento for aprovado.</li>
                                <li>Ao receber a notificação, atualize o status na tabela `Purchases` para `paid`.</li>
                                <li>Gere os números da sorte e salve-os em `PurchasedNumbers`.</li>
                                <li>Verifique se algum número gerado corresponde a um `id` na tabela `InstantPrizes`. Se sim, marque o prêmio como ganho e associe o `winnerId`.</li>
                            </ul>
                           </p>
                           <p>4. **Consulta de Status:** O front-end irá chamar um endpoint (`/purchases/:id/status`) periodicamente para saber se o pagamento foi confirmado. Seu backend deve retornar o status da compra e, se já estiver paga, os números comprados e se houve um prêmio instantâneo.</p>
                        </div>
                    </Section>

                </main>
            </div>
        </>
    );
};

export default BackendGuide;
