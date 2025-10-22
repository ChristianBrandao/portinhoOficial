import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import Home from '@/pages/Home';
import PrizeDetail from '@/pages/PrizeDetail';
import Raffles from '@/pages/Raffles';
import MyNumbers from '@/pages/MyNumbers';
import Register from '@/pages/Register';
import Winners from '@/pages/Winners';
import PaymentSuccess from '@/pages/PaymentSuccess';
import Login from '@/pages/Login';
import BackendGuide from '@/pages/BackendGuide';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from "@/pages/adm";


function App() {


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("affiliateId", ref);
      console.log("Afiliado capturado:", ref);
    }
  }, []);

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<PrizeDetail  />} />
        <Route path="/prize/:id" element={<PrizeDetail />} />
        <Route path="/sorteios" element={<Raffles />} />
        <Route path="/meus-numeros" element={<MyNumbers />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ganhadores" element={<Winners />} />
        <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
        <Route path="/guia-backend" element={<BackendGuide />} />
        <Route path="/admsecret1234hjahjf" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </AppProvider>
  );
}

export default App;