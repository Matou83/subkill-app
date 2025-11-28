'use client';

import React, { useState } from 'react';
import { ExternalLink, Building2, Loader2 } from 'lucide-react';

interface BankConnectionProps {
    userEmail: string;
    onSuccess?: (itemId: string) => void;
    onClose?: () => void;
}

export default function BankConnection({
    userEmail,
    onSuccess,
    onClose,
}: BankConnectionProps) {
    const [connectUrl, setConnectUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnectBank = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/bridge/connect-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail }),
            });

            if (!response.ok) {
                throw new Error('Failed to create connection session');
            }

            const data = await response.json();
            setConnectUrl(data.connect_url);
        } catch (err) {
            setError('Erreur lors de la connexion à votre banque');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Écouter les messages de l'iframe Bridge
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://connect.bridgeapi.io') return;

            const { type, payload } = event.data;

            if (type === 'connect:item_created') {
                console.log('Bank connected:', payload.item_id);
                onSuccess?.(payload.item_id);
                setConnectUrl(null);
            } else if (type === 'connect:closed') {
                setConnectUrl(null);
                onClose?.();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onSuccess, onClose]);

    if (connectUrl) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] relative">
                    <button
                        onClick={() => setConnectUrl(null)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                    >
                        ✕
                    </button>
                    <iframe
                        src={connectUrl}
                        className="w-full h-full rounded-lg"
                        allow="payment"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Connecter ma banque</h3>
            </div>

            <p className="text-gray-600 mb-6">
                Synchronisez automatiquement vos abonnements en connectant votre compte
                bancaire de manière sécurisée.
            </p>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <button
                onClick={handleConnectBank}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connexion en cours...
                    </>
                ) : (
                    <>
                        <ExternalLink className="w-5 h-5" />
                        Connecter ma banque
                    </>
                )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
                🔒 Connexion sécurisée via Bridge API (certifié PSD2)
            </p>
        </div>
    );
}
