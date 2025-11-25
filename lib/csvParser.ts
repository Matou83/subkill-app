// --- TYPES ---

export interface Transaction {
  date: Date;
  label: string;
  amount: number;
}

export interface DetectedSubscription {
  service_name: string;
  monthly_cost: number;
  renewal_date: string;
  confidence: 'high' | 'medium' | 'low';
  icon: string;
}

interface BankProfile {
  name: string;
  separator: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  colIndex: {
    date: number;
    label: number;
    amount: number;
  };
  headerSignature: string[];
}

// --- KNOWN SERVICES ---
const KNOWN_SERVICES: Record<string, { name: string; icon: string }> = {
  'netflix': { name: 'Netflix', icon: '🎬' },
  'spotify': { name: 'Spotify', icon: '🎵' },
  'apple': { name: 'Apple Services', icon: '🍎' },
  'google': { name: 'Google', icon: '🌐' },
  'amazon prime': { name: 'Amazon Prime', icon: '📦' },
  'disney': { name: 'Disney+', icon: '✨' },
  'adobe': { name: 'Adobe Creative Cloud', icon: '🎨' },
  'canva': { name: 'Canva', icon: '🎨' },
  'chatgpt': { name: 'ChatGPT', icon: '🤖' },
  'openai': { name: 'OpenAI', icon: '🤖' },
  'free mobile': { name: 'Free Mobile', icon: '📱' },
  'orange': { name: 'Orange', icon: '📱' },
  'sfr': { name: 'SFR', icon: '📱' },
  'bouygues': { name: 'Bouygues', icon: '📱' },
  'edf': { name: 'EDF', icon: '⚡' },
  'engie': { name: 'Engie', icon: '⚡' },
  'basic fit': { name: 'Basic Fit', icon: '💪' },
  'keep cool': { name: 'Keep Cool', icon: '💪' },
  'uber': { name: 'Uber One', icon: '🚗' },
  'deliveroo': { name: 'Deliveroo Plus', icon: '🍔' },
  'github': { name: 'GitHub', icon: '💻' },
  'figma': { name: 'Figma', icon: '🎨' },
  'notion': { name: 'Notion', icon: '📝' },
  'slack': { name: 'Slack', icon: '💬' },
  'youtube': { name: 'YouTube Premium', icon: '▶️' },
  'deezer': { name: 'Deezer', icon: '🎵' },
  'canal': { name: 'Canal+', icon: '📺' },
  'crunchyroll': { name: 'Crunchyroll', icon: '🍥' },
};

// --- BANK PROFILES ---
const BANK_PROFILES: BankProfile[] = [
  {
    name: 'Boursorama',
    separator: ';',
    dateFormat: 'DD/MM/YYYY',
    colIndex: { date: 0, label: 1, amount: 2 },
    headerSignature: ['dateOp', 'label', 'amount']
  },
  {
    name: 'BNP Paribas',
    separator: ';',
    dateFormat: 'DD/MM/YYYY',
    colIndex: { date: 0, label: 2, amount: 3 },
    headerSignature: ['Date', 'Valeur', 'Libelle', 'Montant']
  },
  {
    name: 'Credit Agricole',
    separator: ';',
    dateFormat: 'DD/MM/YYYY',
    colIndex: { date: 0, label: 1, amount: 2 },
    headerSignature: ['Date', 'Libelle', 'Montant']
  },
  {
    name: 'Generic',
    separator: ',',
    dateFormat: 'YYYY-MM-DD',
    colIndex: { date: 0, label: 1, amount: 2 },
    headerSignature: ['date', 'description', 'amount']
  }
];

// --- HELPER FUNCTIONS ---
function detectBankProfile(headers: string[]): BankProfile {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  for (const profile of BANK_PROFILES) {
    const matchCount = profile.headerSignature.filter(sig => 
      normalizedHeaders.some(h => h.includes(sig.toLowerCase()))
    ).length;
    if (matchCount >= 2) return profile;
  }
  return BANK_PROFILES[BANK_PROFILES.length - 1];
}

function parseDate(dateStr: string, format: string): Date {
  const parts = dateStr.split(/[\/\-]/);
  switch (format) {
    case 'DD/MM/YYYY':
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    case 'MM/DD/YYYY':
      return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    default:
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
}

function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[^\d,.\-]/g, '').replace(',', '.');
  return Math.abs(parseFloat(cleaned));
}

function findKnownService(label: string): { name: string; icon: string } | null {
  const lowerLabel = label.toLowerCase();
  for (const [keyword, service] of Object.entries(KNOWN_SERVICES)) {
    if (lowerLabel.includes(keyword)) return service;
  }
  return null;
}

function calculateNextRenewal(transactions: Transaction[]): string {
  const lastDate = transactions[0].date;
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString().split('T')[0];
}

// --- MAIN EXPORT FUNCTIONS ---
export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Détection format Boursobank (format collé sans séparateur)
  // Format: DDMMYYYY-MONTANT+Type+Description (ex: 01092025-1107VirementVIR INST...)
  // Note: première ligne = en-tête compte à ignorer
  const boursobankRegex = /^(\d{8})([+-]\d+)([A-Za-z])(.*)$/;
  const isBoursobank = lines.some(line => {
    const trimmed = line.trim();
    // Ignorer la ligne d'en-tête qui contient des espaces
    if (trimmed.includes(' ') && trimmed.includes('--')) return false;
    return boursobankRegex.test(trimmed);
  });

  if (isBoursobank) {
    const transactions: Transaction[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip header line
      if (trimmed.includes(' ') || trimmed.includes('--') || trimmed.length < 10) continue;
      
      const match = trimmed.match(boursobankRegex);
      if (match) {
        const [, dateStr, amountStr, firstChar, rest] = match;
        
        // Parse date: DDMMYYYY => DD/MM/YYYY
        const day = dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const year = dateStr.substring(4, 8);
        const date = parseDate(`${day}/${month}/${year}`, 'DD/MM/YYYY');

        // Parse amount (en centimes)
        const amount = parseAmount(amountStr) / 100;

        // Extract label (tout après le montant)
        const label = (firstChar + rest).replace(/\d{8}0\w+$/, '').trim();

        // Only keep debits
        if (date && amount < 0 && label) {
          transactions.push({ date, label, amount: Math.abs(amount) });
        }
      }
    }
    
    if (transactions.length > 0) {
      return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }


  
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';
  const headers = firstLine.split(separator).map(h => h.replace(/"/g, '').trim());
  const profile = detectBankProfile(headers);
  
  const transactions: Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(separator).map(c => c.replace(/"/g, '').trim());
    try {
      const transaction: Transaction = {
        date: parseDate(cols[profile.colIndex.date], profile.dateFormat),
        label: cols[profile.colIndex.label] || '',
        amount: parseAmount(cols[profile.colIndex.amount])
      };
      if (transaction.amount > 0 && transaction.label) {
        transactions.push(transaction);
      }
    } catch (e) {
      console.warn('Failed to parse line:', line);
    }
  }
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function detectRecurringSubscriptions(transactions: Transaction[]): DetectedSubscription[] {
  const groups: Map<string, Transaction[]> = new Map();
  
  for (const t of transactions) {
    const service = findKnownService(t.label);
    const key = service ? service.name : t.label.substring(0, 20).toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  
  const subscriptions: DetectedSubscription[] = [];
  
  for (const [key, txns] of Array.from(groups)) {
    if (txns.length < 2) continue;
    
    const intervals: number[] = [];
    for (let i = 1; i < txns.length; i++) {
      const days = Math.abs(txns[i-1].date.getTime() - txns[i].date.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(days);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (avgInterval >= 25 && avgInterval <= 35) {
      const service = findKnownService(txns[0].label);
      const avgAmount = txns.reduce((sum, t) => sum + t.amount, 0) / txns.length;
      const confidence: 'high' | 'medium' | 'low' = txns.length >= 3 ? 'high' : 'medium';
      
      subscriptions.push({
        service_name: service?.name || txns[0].label.substring(0, 30),
        monthly_cost: Math.round(avgAmount * 100) / 100,
        renewal_date: calculateNextRenewal(txns),
        confidence,
        icon: service?.icon || '📄'
      });
    }
  }
  return subscriptions.sort((a, b) => b.monthly_cost - a.monthly_cost);
}
