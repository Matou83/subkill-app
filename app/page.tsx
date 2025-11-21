'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  AlertCircle, 
  ChevronLeft, 
  ExternalLink, 
  Check, 
  Mail, 
  ShieldAlert,
  Search,
  X,
  Loader2,
  History,
  CheckCircle2
} from 'lucide-react';

// --- MOCK DATA ---
const initialSubscriptions = [
  { id: 1, name: 'Netflix', price: 15.49, renewalDate: '2025-11-25', logo: '🎬', daysUntilRenewal: 5, type: 'known' },
  { id: 2, name: 'Spotify', price: 9.99, renewalDate: '2025-12-08', logo: '🎵', daysUntilRenewal: 18, type: 'known' },
  { id: 3, name: 'Figma', price: 12.00, renewalDate: '2025-12-12', logo: '🎨', daysUntilRenewal: 22, type: 'known' },
  { id: 4, name: 'Adobe CC', price: 59.99, renewalDate: '2025-11-22', logo: '📐', daysUntilRenewal: 2, type: 'unknown' },
  { id: 5, name: 'Global Gym', price: 39.99, renewalDate: '2025-12-15', logo: '💪', daysUntilRenewal: 25, type: 'unknown' }
];

// --- UTILS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- COMPONENTS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'netflix';
  isLoading?: boolean;
}

const Button = ({ children, variant = 'primary', className = '', disabled, onClick, isLoading, ...props }: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm relative overflow-hidden";
  
  const variants = {
    primary: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    danger: "bg-red-50 text-[#DC2626] hover:bg-red-100 border border-red-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    netflix: "bg-[#E50914] text-white hover:bg-[#b20710] shadow-sm"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      <span className={isLoading ? "opacity-0" : "opacity-100 flex items-center gap-2"}>{children}</span>
    </button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subtext, alert }: { title: string; value: string | number; subtext?: string; alert?: boolean }) => (
  <Card className="p-6 flex flex-col gap-2 transition-all duration-300">
    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</span>
    <div className={`text-3xl font-bold transition-colors duration-300 ${alert ? 'text-[#DC2626]' : 'text-gray-900'}`}>
      {value}
    </div>
    {subtext && <span className="text-sm text-gray-400">{subtext}</span>}
  </Card>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'danger' | 'warning' | 'success' }) => {
  const styles = {
    danger: "bg-red-100 text-[#DC2626] border-red-200",
    warning: "bg-orange-100 text-orange-700 border-orange-200",
    success: "bg-green-100 text-green-700 border-green-200",
    default: "bg-gray-100 text-gray-600 border-gray-200"
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- MOCK NETFLIX INTERFACE ---
const NetflixMock = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] bg-black text-white font-sans overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
    {/* Fake Browser Bar */}
    <div className="bg-[#222] px-4 py-2 flex items-center gap-4 border-b border-[#333]">
       <div className="flex gap-2">
         <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:opacity-80" onClick={onClose}></div>
         <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
         <div className="w-3 h-3 rounded-full bg-green-500"></div>
       </div>
       <div className="bg-[#111] flex-1 text-center text-xs text-gray-400 py-1 rounded-md font-mono">
         netflix.com/youraccount/cancel
       </div>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[#E50914] text-4xl font-bold tracking-tighter">NETFLIX</h1>
        <button onClick={onClose} className="text-gray-400 hover:text-white">Sign Out</button>
      </div>

      <div className="bg-white text-black p-8 rounded-sm shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Cancel Membership?</h2>
        <p className="text-gray-700 mb-6">
          We&apos;ll miss you! If you cancel now, you can still watch until <span className="font-bold">November 25, 2025</span>.
        </p>
        
        <div className="bg-gray-100 p-4 mb-6 flex gap-4 items-start">
          <div className="w-16 h-24 bg-gray-800 rounded-sm shadow-md flex-shrink-0" title="Stranger Things Poster"></div>
          <div className="w-16 h-24 bg-gray-800 rounded-sm shadow-md flex-shrink-0" title="The Crown Poster"></div>
          <div className="w-16 h-24 bg-gray-800 rounded-sm shadow-md flex-shrink-0" title="Squid Game Poster"></div>
          <div className="text-xs text-gray-500 self-end ml-auto">Your viewing history will be saved for 10 months.</div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-[#E50914] hover:bg-[#f6121d] text-white font-bold text-lg rounded-sm transition-colors"
          >
            Finish Cancellation
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg rounded-sm transition-colors"
          >
            Stay a Member
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP ---

export default function SubKillApp() {
  // --- STATE ---
  const [view, setView] = useState<'dashboard' | 'cancel-known' | 'cancel-unknown'>('dashboard');
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNetflixMock, setShowNetflixMock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Form State
  const [newSub, setNewSub] = useState({ name: '', price: '', date: '' });

  // --- CALCULATED STATS ---
  const monthlyCost = subscriptions.reduce((acc, sub) => acc + sub.price, 0);
  const annualCost = monthlyCost * 12;
  const activeAlerts = subscriptions.filter(sub => sub.daysUntilRenewal <= 7).length;

  // --- HANDLERS ---

  const handleAddSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        name: newSub.name,
        price: parseFloat(newSub.price),
        renewalDate: newSub.date,
        logo: newSub.name.charAt(0).toUpperCase(),
        daysUntilRenewal: 30,
        type: 'known'
      };
      setSubscriptions([...subscriptions, newItem]);
      setNewSub({ name: '', price: '', date: '' });
      setIsLoading(false);
      setShowAddModal(false);
      setShowSuccessToast(`Successfully added ${newItem.name}`);
    }, 800);
  };

  const handleCancelClick = (sub: any) => {
    setSelectedSub(sub);
    setIsLoading(false);
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (sub.type === 'unknown' || sub.name.includes('Adobe') || sub.name.includes('Gym')) {
        setView('cancel-unknown');
      } else {
        setView('cancel-known');
      }
    }, 400);
  };

  const openExternalService = () => {
    if (selectedSub.name.toLowerCase().includes('netflix')) {
      setShowNetflixMock(true);
    } else {
      window.open(`https://www.google.com/search?q=cancel+${selectedSub.name}`, '_blank');
    }
  };

  const triggerConfirmFlow = () => {
    setShowConfirmModal(true);
  };

  const finalizeCancellation = (success: boolean) => {
    if (!success) {
      setShowConfirmModal(false);
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const subToCancel = selectedSub;
      const today = new Date().toISOString();
      
      setHistory([
        { 
          ...subToCancel, 
          cancelledDate: today, 
          fee: 3.99 
        }, 
        ...history
      ]);

      setSubscriptions(subscriptions.filter(s => s.id !== subToCancel.id));
      
      setIsLoading(false);
      setShowConfirmModal(false);
      setSelectedSub(null);
      setView('dashboard');
      
      setShowSuccessToast(`Cancellation confirmed! 3,99€ fee applied.`);
    }, 1500);
  };

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // --- VIEWS ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top-4 fade-in zoom-in-95">
          <CheckCircle2 size={20} className="text-white" />
          <span className="font-medium">{showSuccessToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Monthly Cost" value={formatCurrency(monthlyCost)} />
        <StatCard title="Annual Cost" value={formatCurrency(annualCost)} subtext="Estimated" />
        <StatCard title="Active Alerts" value={activeAlerts} alert={activeAlerts > 0} />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Your Subscriptions</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add subscription
        </Button>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const isUrgent = sub.daysUntilRenewal <= 5;
          const isWarning = sub.daysUntilRenewal <= 7 && !isUrgent;

          return (
            <Card key={sub.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 group hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl border border-gray-200 shadow-sm">
                  {sub.logo}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{sub.name}</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    {formatCurrency(sub.price)}/mo
                    <span className="text-gray-300">•</span>
                    Renews {new Date(sub.renewalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isUrgent && <Badge variant="danger">In {sub.daysUntilRenewal} days</Badge>}
                {isWarning && <Badge variant="warning">In {sub.daysUntilRenewal} days</Badge>}
                
                <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCancelClick(sub)}>
                  Cancel
                </Button>
              </div>
            </Card>
          );
        })}
        
        {subscriptions.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center gap-2">
            <CheckCircle2 size={40} className="text-green-500 mb-2 opacity-50" />
            <p>You are subscription free!</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="pt-8 border-t border-gray-200 animate-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <History size={20} className="text-gray-400" />
            Cancellation History
          </h2>
          <div className="space-y-3 opacity-75">
            {history.map((sub) => (
              <Card key={`hist-${sub.id}`} className="p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white grayscale flex items-center justify-center text-xl border border-gray-200">
                    {sub.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 line-through">{sub.name}</h3>
                    <div className="text-xs text-gray-500">
                      Cancelled on {formatDate(sub.cancelledDate)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <Badge variant="success">Confirmed</Badge>
                   <span className="text-xs text-gray-400">Fee: {formatCurrency(sub.fee)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCancelKnown = () => (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => setView('dashboard')} 
        className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to dashboard
      </button>

      <h1 className="text-2xl font-bold mb-6">Cancel {selectedSub?.name}</h1>

      <Card className="p-6 mb-8 flex items-center gap-4 bg-gray-50 border-gray-200">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border border-gray-100">
          {selectedSub?.logo}
        </div>
        <div>
          <h3 className="font-bold text-lg">{selectedSub?.name} Premium</h3>
          <p className="text-gray-500">{formatCurrency(selectedSub?.price)}/mo • Renews {formatDate(selectedSub?.renewalDate)}</p>
        </div>
      </Card>

      <div className="space-y-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">How to Cancel Online</h3>
          <div className="space-y-4">
            {[
              "Log in to your account settings.",
              "Navigate to the 'Billing' or 'Plan' section.",
              "Click on 'Cancel Subscription' at the bottom of the page.",
              "Confirm your choice (ignore the discount offers)."
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-600 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex gap-3">
             <AlertCircle className="text-[#2563EB] flex-shrink-0" size={20} />
             <div className="text-sm text-blue-800">
               <span className="font-bold block mb-1">SubKill Tip</span>
               Most services let you keep access until the billing cycle ends, even if you cancel today.
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={openExternalService}
              className="w-full h-12 text-lg"
              variant={selectedSub?.name === 'Netflix' ? 'netflix' : 'primary'}
            >
              Open {selectedSub?.name}.com <ExternalLink size={18} />
            </Button>
            
            <div className="text-center mt-2">
              <button 
                onClick={triggerConfirmFlow}
                className="text-sm text-gray-400 hover:text-gray-600 underline decoration-dotted transition-colors"
              >
                I&apos;ve done it, mark as cancelled
              </button>
              <p className="text-xs text-gray-400 mt-2">
                3,99€ fee charged only after successful confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCancelUnknown = () => (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => setView('dashboard')} 
        className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium"
      >
        <ChevronLeft size={16} /> Back to dashboard
      </button>

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">Cancel {selectedSub?.name}</h1>
        <Badge variant="danger">Hard to cancel</Badge>
      </div>

      <Card className="p-6 mb-8 flex items-center gap-4 bg-gray-50 border-gray-200">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border border-gray-100">
          {selectedSub?.logo}
        </div>
        <div>
          <h3 className="font-bold text-lg">{selectedSub?.name}</h3>
          <p className="text-gray-500">{formatCurrency(selectedSub?.price)}/mo • Renews {formatDate(selectedSub?.renewalDate)}</p>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-gray-400" />
            Cancellation by Registered Mail
          </h3>
          
          <div className="bg-[#2563EB]/10 border border-[#2563EB]/20 p-5 rounded-xl mb-6">
            <h4 className="font-bold text-[#2563EB] mb-2">Why send a letter?</h4>
            <p className="text-sm text-blue-900 leading-relaxed">
              {selectedSub?.name} requires a formal request to cancel. A generic email often gets ignored. 
              An LRAR (Lettre Recommandée avec Accusé de Réception) is the only legally binding method to ensure they stop charging you.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">What&apos;s included</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={12} /></div>
                Legal template customized for {selectedSub?.name}
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={12} /></div>
                Printing, Envelope & Postage included
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={12} /></div>
                Real-time tracking number
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex flex-col gap-3">
            <Button className="w-full h-14 text-lg shadow-lg shadow-blue-200" onClick={() => finalizeCancellation(true)}>
              Generate LRAR Letter (7,99€)
            </Button>
            
            <button 
              onClick={() => finalizeCancellation(true)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600"
            >
              No thanks, I&apos;ll write it myself
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MODALS ---

  const renderAddModal = () => {
    if (!showAddModal) return null;
    const isFormValid = newSub.name && newSub.price && newSub.date;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Card className="w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
          <button 
            onClick={() => setShowAddModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Subscription</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="e.g., Netflix, Adobe, Gym..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  value={newSub.name}
                  onChange={(e) => setNewSub({...newSub, name: e.target.value})}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Monthly Price (€)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  value={newSub.price}
                  onChange={(e) => setNewSub({...newSub, price: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Next Renewal Date</label>
              <input 
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-600"
                value={newSub.date}
                onChange={(e) => setNewSub({...newSub, date: e.target.value})}
              />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={handleAddSubmit} 
                disabled={!isFormValid}
                isLoading={isLoading}
                className="w-full h-11"
              >
                Add subscription
              </Button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-sm text-gray-500 hover:text-gray-700 text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Card className="w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 text-center">
          
          <div className="w-16 h-16 bg-blue-100 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Did it work?</h2>
          <p className="text-gray-600 mb-8">
            Did you successfully cancel your <strong>{selectedSub?.name}</strong> subscription on their website?
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => finalizeCancellation(true)} 
              className="w-full h-12"
              variant="success"
              isLoading={isLoading}
            >
              Yes, I cancelled it
            </Button>
            
            <Button 
              onClick={() => finalizeCancellation(false)}
              variant="secondary"
              className="w-full h-12"
              disabled={isLoading}
            >
              No, I had issues
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto h-full px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('dashboard')}>
          <div className="bg-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center text-white font-black transform -rotate-3 group-hover:rotate-0 transition-transform">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">SubKill</span>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden hover:ring-2 hover:ring-[#2563EB] transition-all cursor-pointer">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
           </div>
        </div>
      </div>
    </header>
  );

  if (isLoading && view !== 'dashboard' && !showConfirmModal && !showAddModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="animate-spin text-[#2563EB]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-gray-900 pb-12">
      {renderHeader()}
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'dashboard' && renderDashboard()}
        {view === 'cancel-known' && renderCancelKnown()}
        {view === 'cancel-unknown' && renderCancelUnknown()}
      </main>

      {renderAddModal()}
      {renderConfirmModal()}
      {showNetflixMock && <NetflixMock onClose={() => setShowNetflixMock(false)} />}
    </div>
  );
}
