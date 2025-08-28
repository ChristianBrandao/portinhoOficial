import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WinnerAnnouncementDialog = ({ isOpen, setIsOpen, winner }) => {
    if (!winner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white border-none p-0 overflow-hidden">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="p-8 text-center relative"
                >
                    <Trophy className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 text-white opacity-20" />
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold text-white tracking-tight">PARABÉNS!</DialogTitle>
                        <DialogDescription className="text-yellow-200 mt-2 text-lg">Você é um ganhador!</DialogDescription>
                    </DialogHeader>

                    <div className="my-8">
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Gift className="h-32 w-32 mx-auto text-white" />
                        </motion.div>
                    </div>

                    <p className="text-xl">Você ganhou:</p>
                    <p className="text-2xl font-bold mb-6">{winner.prize}</p>
                    <p className="text-sm text-yellow-200">Com o bilhete premiado:</p>
                    <p className="text-2xl font-mono font-bold bg-black/30 inline-block px-4 py-2 rounded-lg">{winner.id}</p>

                    <Button asChild className="mt-8 w-full bg-white text-orange-500 font-bold hover:bg-yellow-100 text-lg py-6">
                        <Link to="/meus-numeros">
                            Ver meus prêmios <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default WinnerAnnouncementDialog;