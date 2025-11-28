
export interface ServiceInfo {
    name: string;
    category: 'streaming' | 'music' | 'telecom' | 'gym' | 'software' | 'other';
    cancellationMethod: 'online' | 'letter' | 'email' | 'phone';
    cancellationUrl?: string;
    letterAddress?: {
        name: string;
        street: string;
        postalCode: string;
        city: string;
    };
    tips?: string[];
}

export const SERVICES_DATA: Record<string, ServiceInfo> = {
    'netflix': {
        name: 'Netflix',
        category: 'streaming',
        cancellationMethod: 'online',
        cancellationUrl: 'https://www.netflix.com/cancelplan',
        tips: [
            "Vous garderez l'accès jusqu'à la fin de la période de facturation.",
            "Netflix conserve votre historique pendant 10 mois si vous décidez de revenir."
        ]
    },
    'spotify': {
        name: 'Spotify',
        category: 'music',
        cancellationMethod: 'online',
        cancellationUrl: 'https://www.spotify.com/account/cancel/',
        tips: [
            "Si vous êtes sur un plan familial, seul le gestionnaire peut annuler.",
            "Vous passerez en version gratuite (avec pubs) à la fin du mois."
        ]
    },
    'amazon prime': {
        name: 'Amazon Prime',
        category: 'streaming',
        cancellationMethod: 'online',
        cancellationUrl: 'https://www.amazon.fr/gp/primecentral/editMembership',
        tips: [
            "Amazon propose souvent un remboursement au prorata si vous n'avez pas utilisé les avantages récemment."
        ]
    },
    'canal+': {
        name: 'Canal+',
        category: 'streaming',
        cancellationMethod: 'letter',
        letterAddress: {
            name: 'CANAL+ / SERVICE RÉSILIATION',
            street: 'TSA 86712',
            postalCode: '95905',
            city: 'CERGY PONTOISE CEDEX 9'
        },
        tips: [
            "Attention à la date d'anniversaire ! Vous ne pouvez résilier qu'à l'échéance annuelle.",
            "La loi Chatel vous oblige à être prévenu, sinon vous pouvez résilier à tout moment."
        ]
    },
    'free mobile': {
        name: 'Free Mobile',
        category: 'telecom',
        cancellationMethod: 'letter',
        letterAddress: {
            name: 'Free Mobile - Résiliation',
            street: 'BP 2',
            postalCode: '91167',
            city: 'LONGJUMEAU CEDEX 9'
        },
        tips: [
            "Si vous changez d'opérateur, demandez votre RIO au 3179 pour ne pas avoir à envoyer de lettre (portabilité)."
        ]
    },
    'basic fit': {
        name: 'Basic Fit',
        category: 'gym',
        cancellationMethod: 'online',
        cancellationUrl: 'https://my.basic-fit.com/membership/cancel',
        tips: [
            "Vérifiez si vous êtes encore dans votre période d'engagement (souvent 12 mois)."
        ]
    },
    'adobe': {
        name: 'Adobe Creative Cloud',
        category: 'software',
        cancellationMethod: 'online',
        cancellationUrl: 'https://account.adobe.com/plans',
        tips: [
            "Attention : Adobe facture souvent des frais de résiliation anticipée (50% des mois restants) si vous êtes sur un engagement annuel payé mensuellement."
        ]
    }
};

export function findServiceInfo(serviceName: string): ServiceInfo | null {
    const normalized = serviceName.toLowerCase().trim();

    // Direct match
    if (SERVICES_DATA[normalized]) return SERVICES_DATA[normalized];

    // Partial match
    for (const [key, info] of Object.entries(SERVICES_DATA)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return info;
        }
    }

    return null;
}
