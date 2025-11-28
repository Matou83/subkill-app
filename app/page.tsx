'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  History,
  Upload,
  Loader2,
  X,
  Search,
  ShieldAlert
} from 'lucide-react';
import CSVImport from '@/components/CSVImport';
import CancellationWizard from '@/components/CancellationWizard';
import BankConnection from '@/components/BankConnection';
import { DetectedSubscription } from '@/lib/csvParser';

// --- TYPES ---
interface Subscription {
  id: number;
  service_name: string;
  monthly_cost: number;
  renewal_date: string;
  status: 'active' | 'cancelled';
  icon: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// --- UTILS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const calculateDaysUntilRenewal = (dateString: string) => {
  const today = new Date();
  const renewal = new Date(dateString);
  // Reset hours to compare only dates
  today.setHours(0, 0, 0, 0);
  renewal.setHours(0, 0, 0, 0);

  const diffTime = renewal.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// --- COMPONENTS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  isLoading?: boolean;
}

const Button = ({ children, variant = 'primary', className = '', disabled, onClick, isLoading, ...props }: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm relative overflow-hidden";

  const variants = {
    primary: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    danger: "bg-red-50 text-[#DC2626] hover:bg-red-100 border border-red-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm"
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

// --- MAIN APP ---

export default function SubKillApp() {
  // --- STATE ---
  const [view, setView] = useState<'dashboard' | 'cancellation'>('dashboard');

  // Supabase State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [showCSVImport, setShowCSVImport] = useState(false);

  // Form State
  const [newSub, setNewSub] = useState({ name: '', price: '', date: '' });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .order('renewal_date', { ascending: true });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des abonnements');
    } finally {
      setLoading(false);
    }
  }

  // --- CALCULATED STATS ---
  const monthlyCost = subscriptions.reduce((acc, sub) => acc + sub.monthly_cost, 0);
  const annualCost = monthlyCost * 12;
  const activeAlerts = subscriptions.filter(sub => calculateDaysUntilRenewal(sub.renewal_date) <= 7).length;

  // --- HANDLERS ---

  async function handleAddSubmit() {
    setActionLoading(true);

    const newSubscriptionData = {
      service_name: newSub.name,
      monthly_cost: parseFloat(newSub.price),
      renewal_date: newSub.date,
      status: 'active' as const,
      icon: newSub.name.charAt(0).toUpperCase(),
      user_id: null
    };

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([newSubscriptionData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSubscriptions([...subscriptions, data]);
        setNewSub({ name: '', price: '', date: '' });
        setShowAddModal(false);
        setShowSuccessToast(`Successfully added ${data.service_name}`);
      }
    } catch (err) {
      console.error('Error adding subscription:', err);
    } finally {
      setActionLoading(false);
    }
  }

  const handleCSVImport = async (detected: DetectedSubscription[]) => {
    setActionLoading(true);
    try {
      for (const sub of detected) {
        await supabase.from('subscriptions').insert({
          service_name: sub.service_name,
          monthly_cost: sub.monthly_cost,
          renewal_date: sub.renewal_date,
          status: 'active',
          icon: sub.icon,
        });
      }
      setShowSuccessToast(`Successfully imported ${detected.length} subscriptions!`);
      fetchSubscriptions();
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import some subscriptions.");
    } finally {
      setActionLoading(false);
    }
  };

  async function handleDeleteSubscription(id: number) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } else {
      console.error("Erreur lors de la suppression:", error);
      throw error;
    }
  }

  const handleCancelClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setView('cancellation');
  };

  const finalizeCancellation = async (success: boolean) => {
    if (!success) {
      setShowConfirmModal(false);
      return;
    }

    if (!selectedSub) return;

    setActionLoading(true);

    try {
      await handleDeleteSubscription(selectedSub.id);

      const today = new Date().toISOString();
      setHistory([
        {
          ...selectedSub,
          cancelledDate: today,
          fee: 3.99
        },
        ...history
      ]);

      setShowConfirmModal(false);
      setSelectedSub(null);
      setView('dashboard');
      setShowSuccessToast(`Cancellation confirmed! 3,99€ fee applied.`);

    } catch (err) {
      console.error("Failed to cancel:", err);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setActionLoading(false);
    }
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

      <div className="mb-8">
        <BankConnection
          userEmail="user@example.com"
          onSuccess={(itemId) => {
            console.log('Banque connectée avec succès:', itemId);
            setShowSuccessToast('Compte bancaire connecté avec succès !');
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Your Subscriptions</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowCSVImport(true)} variant="secondary" className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Add subscription
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const daysUntilRenewal = calculateDaysUntilRenewal(sub.renewal_date);
          const isUrgent = daysUntilRenewal <= 5 && daysUntilRenewal >= 0;
          const isWarning = daysUntilRenewal <= 7 && !isUrgent && daysUntilRenewal >= 0;
          const isOverdue = daysUntilRenewal < 0;

          return (
            <Card key={sub.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 group hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl border border-gray-200 shadow-sm">
                  {sub.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{sub.service_name}</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    {formatCurrency(sub.monthly_cost)}/mo
                    <span className="text-gray-300">•</span>
                    Renews {formatDate(sub.renewal_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isOverdue && <Badge variant="danger">Overdue</Badge>}
                {isUrgent && <Badge variant="danger">In {daysUntilRenewal} days</Badge>}
                {isWarning && <Badge variant="warning">In {daysUntilRenewal} days</Badge>}

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
            {history.map((sub, idx) => (
              <Card key={`hist-${sub.id}-${idx}`} className="p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white grayscale flex items-center justify-center text-xl border border-gray-200">
                    {sub.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 line-through">{sub.service_name}</h3>
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

  const renderCancellation = () => (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => setView('dashboard')}
        className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Cancel {selectedSub?.service_name}</h1>
        <Card className="p-4 flex items-center gap-4 bg-gray-50 border-gray-200">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm border border-gray-100">
            {selectedSub?.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{selectedSub?.service_name}</h3>
            <p className="text-sm text-gray-500">{formatCurrency(selectedSub?.monthly_cost || 0)}/mo • Renews {formatDate(selectedSub?.renewal_date || '')}</p>
          </div>
        </Card>
      </div>

      <CancellationWizard serviceName={selectedSub?.service_name || ''} />

      <div className="mt-8 text-center">
        <button
          onClick={() => setShowConfirmModal(true)}
          className="text-sm text-gray-400 hover:text-gray-600 underline decoration-dotted transition-colors"
        >
          I&apos;ve successfully cancelled it
        </button>
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
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
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
                  onChange={(e) => setNewSub({ ...newSub, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Next Renewal Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-600"
                value={newSub.date}
                onChange={(e) => setNewSub({ ...newSub, date: e.target.value })}
              />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                onClick={handleAddSubmit}
                disabled={!isFormValid}
                isLoading={actionLoading}
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
            Did you successfully cancel your <strong>{selectedSub?.service_name}</strong> subscription?
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => finalizeCancellation(true)}
              className="w-full h-12"
              variant="success"
              isLoading={actionLoading}
            >
              Yes, I cancelled it
            </Button>

            <Button
              onClick={() => finalizeCancellation(false)}
              variant="secondary"
              className="w-full h-12"
              disabled={actionLoading}
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

  // --- INITIAL LOADING STATE ---
  if (loading && view !== 'dashboard' && !showConfirmModal && !showAddModal && !showCSVImport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="animate-spin text-[#2563EB]" size={40} />
      </div>
    );
  }

  // Initial Data Loading
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
      <Loader2 className="animate-spin text-[#2563EB]" size={40} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] text-red-500 p-8">
      <AlertCircle className="mr-2" /> {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-gray-900 pb-12">
      {renderHeader()}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'dashboard' && renderDashboard()}
        {view === 'cancellation' && renderCancellation()}
      </main>

      {renderAddModal()}
      {renderConfirmModal()}
      <CSVImport
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
}
