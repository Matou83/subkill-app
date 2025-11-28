'use client';

import React from 'react';
import { ExternalLink, Mail, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { findServiceInfo, ServiceInfo } from '@/lib/servicesData';

interface CancellationWizardProps {
    serviceName: string;
    onClose?: () => void;
}

export default function CancellationWizard({ serviceName, onClose }: CancellationWizardProps) {
    const serviceInfo = findServiceInfo(serviceName);

    if (!serviceInfo) {
        return (
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Search size={20} className="text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Comment résilier {serviceName} ?</h3>
                        <p className="text-sm text-gray-500">Nous n'avons pas d'instructions précises pour ce service.</p>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                        La plupart des services permettent de résilier via :
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        <li>Les paramètres du compte (section "Abonnement" ou "Facturation")</li>
                        <li>Le magasin d'applications (Apple App Store / Google Play)</li>
                        <li>Le support client par chat ou email</li>
                    </ul>
                </div>

                <a
                    href={`https://www.google.com/search?q=comment+résilier+${serviceName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                    Rechercher sur Google <ExternalLink size={16} />
                </a>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
            ${serviceInfo.cancellationMethod === 'letter' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}
          `}>
                        {serviceInfo.cancellationMethod === 'letter' ? <Mail size={24} /> : <ExternalLink size={24} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">Résilier {serviceInfo.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide
              ${serviceInfo.cancellationMethod === 'letter' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
            `}>
                            Via {serviceInfo.cancellationMethod === 'letter' ? 'Lettre Recommandée' : 'Site Officiel'}
                        </span>
                    </div>
                </div>
            </div>

            {serviceInfo.tips && serviceInfo.tips.length > 0 && (
                <div className="mb-6 space-y-3">
                    {serviceInfo.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            )}

            {serviceInfo.cancellationMethod === 'online' && serviceInfo.cancellationUrl && (
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Ce service permet la résiliation directe en ligne. Cliquez ci-dessous pour accéder directement à la page de désabonnement.
                    </p>
                    <a
                        href={serviceInfo.cancellationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-sm hover:shadow-md"
                    >
                        Aller sur {serviceInfo.name} <ExternalLink size={20} />
                    </a>
                </div>
            )}

            {serviceInfo.cancellationMethod === 'letter' && serviceInfo.letterAddress && (
                <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl font-mono text-sm text-gray-700">
                        <p className="font-bold">{serviceInfo.letterAddress.name}</p>
                        <p>{serviceInfo.letterAddress.street}</p>
                        <p>{serviceInfo.letterAddress.postalCode} {serviceInfo.letterAddress.city}</p>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                        Ce service nécessite souvent une lettre recommandée avec accusé de réception.
                    </p>

                    <button
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold text-lg shadow-sm"
                        onClick={() => alert("Générateur de lettre bientôt disponible !")}
                    >
                        <Mail size={20} /> Générer ma lettre
                    </button>
                </div>
            )}
        </div>
    );
}
