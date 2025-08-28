
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, Home, List, Tag, User, Trophy, FileText, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';

const Logo = () => (
  <svg width="200" height="40" viewBox="0 0 250 50" xmlns="http://www.w3.org/2000/svg" className="text-white">
    <text
      x="50%"
      y="50%"
      dy=".35em"
      textAnchor="middle"
      fontFamily="'Impact', 'Arial Black', sans-serif"
      fontSize="38"
      fill="white"
      stroke="black"
      strokeWidth="2.5"
      paintOrder="stroke"
      letterSpacing="1"
    >
      @PORTINHO
    </text>
    <path d="M4,25 A20,20 0 1,1 46,25" fill="none" stroke="white" strokeWidth="3" />
    <path d="M4,25 A20,20 0 1,0 46,25" fill="none" stroke="black" strokeWidth="6" />
    <path d="M4,25 A20,20 0 1,1 46,25" fill="none" stroke="white" strokeWidth="3" />
    
    <path d="M246,25 A20,20 0 1,0 204,25" fill="none" stroke="white" strokeWidth="3" />
    <path d="M246,25 A20,20 0 1,1 204,25" fill="none" stroke="black" strokeWidth="6" />
    <path d="M246,25 A20,20 0 1,0 204,25" fill="none" stroke="white" strokeWidth="3" />
  </svg>
);

const Header = () => {
  const { toast } = useToast();
  const location = useLocation();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀"
    });
  };

  const menuItems = [
    { name: "Início", icon: <Home className="h-6 w-6" />, link: "/" },
    { name: "Sorteios", icon: <List className="h-6 w-6" />, link: "/sorteios" },
    { name: "Meus números", icon: <Tag className="h-6 w-6" />, link: "/meus-numeros" },
    { name: "Cadastro", icon: <User className="h-6 w-6" />, link: "/cadastro" },
    { name: "Ganhadores", icon: <Trophy className="h-6 w-6" />, link: "/ganhadores" },
    { name: "Termos de uso", icon: <FileText className="h-6 w-6" />, action: handleFeatureClick },
    { name: "Entrar em contato", icon: <Mail className="h-6 w-6" />, action: handleFeatureClick },
  ];

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-black text-white py-2 px-6 w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center">
            <Logo />
          </motion.div>
        </Link>
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800" onClick={handleFeatureClick}>
            <ShoppingCart className="h-6 w-6" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black text-white p-0 border-none w-full max-w-sm">
              <SheetHeader className="relative h-20 flex flex-row items-center justify-between px-6 py-4">
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                    <Logo />
                </div>
                <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col px-6">
                {menuItems.map((item, index) => {
                  const isActive = item.link === location.pathname;
                  return (
                    <React.Fragment key={index}>
                      {item.link ? (
                         <SheetClose asChild>
                           <Link to={item.link} className={`flex items-center space-x-4 py-4 px-2 rounded-md transition-colors ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
                              {item.icon}
                              <span className="text-lg font-medium">{item.name}</span>
                            </Link>
                         </SheetClose>
                      ) : (
                        <button 
                          onClick={item.action} 
                          className="flex items-center space-x-4 py-4 px-2 w-full text-left rounded-md hover:bg-gray-800 transition-colors">
                          {item.icon}
                          <span className="text-lg font-medium">{item.name}</span>
                        </button>
                      )}
                      <div className="border-b border-gray-800" />
                    </React.Fragment>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
