import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Header from "@/components/shared/Header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader,
  Users,
  Ticket,
  DollarSign,
  Trophy,
  Percent,
  CalendarDays,
} from "lucide-react";

const API =
  "https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod/dashboard";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(API);
        if (!res.ok) throw new Error("Erro ao buscar API");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message || "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const brl = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <>
      <Helmet>
        <title>Dashboard - portinhopremios</title>
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Dashboard Completo
            </h1>
          </motion.div>

          {loading && (
            <div className="flex justify-center items-center py-10 text-gray-400">
              <Loader className="animate-spin mr-2 h-6 w-6" /> Carregando...
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-md">
              {error}
            </div>
          )}

          {!loading && stats && (
            <>
              {/* ======== CARDS principais ======== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  icon={<Users className="text-blue-400" />}
                  label="Usuários"
                  value={stats.totals?.totalUsers}
                />
                <MetricCard
                  icon={<DollarSign className="text-green-400" />}
                  label="Vendas"
                  value={brl(stats.totals?.totalSales)}
                />
                <MetricCard
                  icon={<Ticket className="text-purple-400" />}
                  label="Bilhetes"
                  value={stats.totals?.totalTickets}
                />
                <MetricCard
                  icon={<DollarSign className="text-orange-400" />}
                  label="Vendas Afiliados"
                  value={brl(stats.totals?.totalAffiliateSales)}
                />
                <MetricCard
                  icon={<Percent className="text-pink-400" />}
                  label="% Meta (1M bilhetes)"
                  value={(stats.totals?.progressPercent || 0) + "%"}
                />
              </div>

              {/* ======== Top compradores geral ======== */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">
                  Top 10 Compradores (Geral)
                </h2>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full text-left">
                    <thead className="text-gray-400 text-sm">
                      <tr>
                        <th className="px-2 py-1">Usuário</th>
                        <th className="px-2 py-1">Bilhetes</th>
                        <th className="px-2 py-1">Vendas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.topBuyers || []).map((b) => (
                        <tr key={b.userId} className="border-t border-gray-700">
                          <td className="px-2 py-1">
                            {b.name && b.name !== "—" ? b.name : b.userId}
                          </td>
                          <td className="px-2 py-1">{b.tickets}</td>
                          <td className="px-2 py-1">{brl(b.sales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ======== Top 10 por dia ======== */}
              {stats.topBuyersByDay && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <CalendarDays className="h-5 w-5 text-yellow-400" />
                    Top 10 Compradores por Dia
                  </h2>

                  {Object.keys(stats.topBuyersByDay)
                    .sort((a, b) => new Date(b) - new Date(a))
                    .map((day) => (
                      <div key={day} className="border-t border-gray-700 pt-4">
                        <h3 className="text-md font-semibold text-gray-300 mb-2">
                          📅 {new Date(day).toLocaleDateString("pt-BR")}
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="table-auto w-full text-left">
                            <thead className="text-gray-400 text-sm">
                              <tr>
                                <th className="px-2 py-1">Usuário</th>
                                <th className="px-2 py-1">Bilhetes</th>
                                <th className="px-2 py-1">Vendas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(stats.topBuyersByDay[day] || []).map((b) => (
                                <tr
                                  key={b.userId}
                                  className="border-t border-gray-700 hover:bg-gray-700/40"
                                >
                                  <td className="px-2 py-1">
                                    {b.name && b.name !== "—"
                                      ? b.name
                                      : b.userId}
                                  </td>
                                  <td className="px-2 py-1">{b.tickets}</td>
                                  <td className="px-2 py-1">{brl(b.sales)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* ======== Rodapé ======== */}
              <div className="text-center text-gray-500 text-sm pt-4">
                Atualizado em{" "}
                {new Date(stats.generatedAt).toLocaleString("pt-BR")}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

const MetricCard = ({ icon, label, value }) => (
  <Card className="bg-gray-800">
    <CardContent className="p-4 flex items-center gap-3">
      <div className="h-8 w-8 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-xl font-bold">{value ?? "–"}</div>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
