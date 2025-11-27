// --- TYPES ---

export interface Transaction {
  date: Date;
  label: string;
  amount: number;
}

export interface DetectedSubscription {
  service_name: string;
  monthly_cost: number;
  renewal_date: string; // ISO Date string
  confidence: 'high' | 'medium' | 'low';
  icon: string;
}

// --- KNOWN SERVICES ---
const KNOWN_SERVICES: Record<string, { name: string; icon: string }> = {
  'netflix': { name: 'Netflix', icon: '🎬' },
  'spotify': { name: 'Spotify', icon: '🎵' },
  'apple': { name: 'Apple Services', icon: '🍎' },
  'google': { name: 'Google', icon: '🌐' },
  'amazon prime': { name: 'Amazon Prime', icon: '📦' },
  'prime video': { name: 'Prime Video', icon: '🎬' },
  'disney': { name: 'Disney+', icon: '✨' },
  'adobe': { name: 'Adobe', icon: '🎨' },
  'canva': { name: 'Canva', icon: '🎨' },
  'chatgpt': { name: 'ChatGPT', icon: '🤖' },
  'openai': { name: 'OpenAI', icon: '🤖' },
  'free mobile': { name: 'Free Mobile', icon: '📱' },
  'orange': { name: 'Orange', icon: '📱' },
  'sfr': { name: 'SFR', icon: '📱' },
  'bouygues': { name: 'Bouygues', icon: '📱' },
  'edf': { name: 'EDF', icon: '⚡' },
  'engie': { name: 'Engie', icon: '⚡' },
  'fitness': { name: 'Gym', icon: '💪' },
  'basic fit': { name: 'Basic Fit', icon: '💪' },
  'keep cool': { name: 'Keep Cool', icon: '💪' },
  'uber': { name: 'Uber', icon: '🚗' },
  'deliveroo': { name: 'Deliveroo', icon: '🍔' },
  'github': { name: 'GitHub', icon: '💻' },
  'vercel': { name: 'Vercel', icon: '▲' },
  'sncf': { name: 'SNCF', icon: '🚆' },
  'alan': { name: 'Alan', icon: '⚕️' },
  'navigo': { name: 'Navigo', icon: '🚇' },
  'qonto': { name: 'Qonto', icon: '🏦' },
};

// --- HELPER FUNCTIONS ---

function parseFrenchDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Format attendu: JJ/MM/AAAA
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;
  // Remplacer virgule par point (format français "12,50" -> "12.50")
  // Supprimer les espaces insécables éventuels
  const cleanStr = amountStr.replace(/\s/g, '').replace(',', '.');
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : val;
}

// --- MAIN PARSER ---

export function parseBankCSV(csvContent: string): DetectedSubscription[] {
  const lines = csvContent.split(/\r?\n/);

  // Si moins de 2 lignes, pas de données utiles (la ligne 1 est l'entête/solde)
  if (lines.length < 2) return [];

  const transactions: Transaction[] = [];

  // On commence à i = 1 pour sauter la 1ère ligne (Entête/Solde)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(';');

    // Vérification basique de la structure (au moins 5 colonnes pour avoir date, montant, libellé)
    if (cols.length < 5) continue;

    // Colonne 0 : Date
    const date = parseFrenchDate(cols[0]);
    if (!date) continue;

    // Colonne 1 : Montant
    const amount = parseAmount(cols[1]);

    // On ne garde que les DÉPENSES (montants négatifs)
    if (amount >= 0) continue;

    // Colonne 4 : Libellé (C'est là que se trouve "CB NETFLIX...")
    // Par sécurité, on regarde aussi la colonne 2 (Type) ou 3 si la 4 est vide, 
    // mais dans votre fichier c'est la 4.
    const label = cols[4] ? cols[4].trim() : 'Inconnu';

    transactions.push({
      date,
      label,
      amount: Math.abs(amount) // On stocke en positif pour l'affichage
    });
  }

  return detectSubscriptions(transactions);
}

function detectSubscriptions(transactions: Transaction[]): DetectedSubscription[] {
  // Regroupement par "Libellé Simplifié"
  const groups = new Map<string, Transaction[]>();

  transactions.forEach(t => {
    // Nettoyage du libellé pour trouver le "vrai" nom du service
    // Ex: "CB NETFLIX COM 01/10/25" -> "NETFLIX"
    let simpleLabel = t.label.toUpperCase();

    // Mots clés bancaires à supprimer
    const junkWords = ['CB', 'PRLV', 'SEPA', 'VIR', 'INST', 'PAIEMENT', 'CARTE', 'ACHAT', 'FACTURE', 'COM', 'BILL'];
    junkWords.forEach(word => {
      // Remplace "CB " par "" mais garde "CB" si c'est dans un mot
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      simpleLabel = simpleLabel.replace(regex, '');
    });

    // Supprimer les dates (JJ/MM/AA ou JJ/MM)
    simpleLabel = simpleLabel.replace(/\d{2}\/\d{2}(\/\d{2})?/g, '');

    // Supprimer les séries de chiffres (références)
    simpleLabel = simpleLabel.replace(/\d+/g, '');

    // Supprimer les caractères spéciaux sauf espaces
    simpleLabel = simpleLabel.replace(/[^A-Z\s]/g, ' ');

    // Nettoyer les espaces multiples
    simpleLabel = simpleLabel.trim().replace(/\s+/g, ' ');

    // Vérifier si ça correspond à un service connu (Fuzzy match)
    let groupKey = simpleLabel;
    let isKnownService = false;

    for (const [key, info] of Object.entries(KNOWN_SERVICES)) {
      if (simpleLabel.toLowerCase().includes(key)) {
        groupKey = `__KNOWN__${key}`; // Clé spéciale pour regrouper tous les "Netflix"
        isKnownService = true;
        break;
      }
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)?.push(t);
  });

  const detected: DetectedSubscription[] = [];

  // Conversion Map -> Array pour itérer
  Array.from(groups.entries()).forEach(([key, txs]) => {
    // Trier par date décroissante (le plus récent en premier)
    txs.sort((a, b) => b.date.getTime() - a.date.getTime());

    const isKnown = key.startsWith('__KNOWN__');
    const count = txs.length;

    // CRITÈRES DE DÉTECTION :
    // 1. Si service connu (ex: Netflix) : 1 seule transaction suffit.
    // 2. Si inconnu : Il faut au moins 2 transactions.
    if (!isKnown && count < 2) return;

    // Estimation de la récurrence
    let isRecurring = false;

    if (isKnown) {
      isRecurring = true;
    } else {
      // Calculer l'écart entre la dernière et l'avant-dernière transaction
      const lastTx = txs[0];
      const prevTx = txs[1];
      const diffTime = Math.abs(lastTx.date.getTime() - prevTx.date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Mensuel (entre 20 et 40 jours) ou Annuel (entre 350 et 380 jours)
      if ((diffDays >= 20 && diffDays <= 45) || (diffDays >= 350 && diffDays <= 380)) {
        isRecurring = true;
      }
    }

    if (isRecurring) {
      const latestTx = txs[0];
      let finalName = latestTx.label; // Par défaut, le libellé brut (pour debug)
      let finalIcon = latestTx.label.charAt(0).toUpperCase();

      if (isKnown) {
        const serviceKey = key.replace('__KNOWN__', '');
        const info = KNOWN_SERVICES[serviceKey];
        finalName = info.name;
        finalIcon = info.icon;
      } else {
        // Pour les services inconnus, on utilise le "simpleLabel" (la clé du groupe) mais un peu plus propre
        finalName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        if (finalName.length > 20) finalName = finalName.substring(0, 20) + '...';
      }

      // Calcul date renouvellement
      const nextDate = new Date(latestTx.date);
      nextDate.setMonth(nextDate.getMonth() + 1); // Par défaut +1 mois

      // Si c'était annuel (basé sur l'historique), on met +1 an
      if (txs.length >= 2) {
        const diffTime = Math.abs(txs[0].date.getTime() - txs[1].date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 300) {
          nextDate.setMonth(nextDate.getMonth() + 11); // On a déjà ajouté 1 mois, donc +11
        }
      }

      detected.push({
        service_name: finalName,
        monthly_cost: latestTx.amount,
        renewal_date: nextDate.toISOString().split('T')[0],
        confidence: isKnown ? 'high' : 'medium',
        icon: finalIcon
      });
    }
  });

  return detected;
}