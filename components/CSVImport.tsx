'use client';

import { useState, useRef } from 'react';
import { parseBankCSV, DetectedSubscription } from '@/lib/csvParser';

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (subscriptions: DetectedSubscription[]) => void;
}

export default function CSVImport({ isOpen, onClose, onImport }: CSVImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedSubscription[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setDetected([]);

    try {
      const content = await file.text();
      const subscriptions = parseBankCSV(content);

      if (subscriptions.length === 0) {
        setError('No recurring subscriptions detected');
        setIsProcessing(false);
        return;
      }

      setDetected(subscriptions);
      setSelected(new Set(subscriptions.map((_, i) => i)));
    } catch (err) {
      console.error(err);
      setError('Failed to parse CSV file');
    }

    setIsProcessing(false);
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleImport = () => {
    const toImport = detected.filter((_, i) => selected.has(i));
    onImport(toImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Bank Statement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {detected.length === 0 ? (
          <>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-600 mb-2">Drag & drop your bank statement CSV</p>
              <p className="text-sm text-gray-400 mb-4">Supports: Boursorama, BNP, Crédit Agricole</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Files
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
            </div>

            {isProcessing && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>Analyzing transactions...</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Found {detected.length} recurring subscription{detected.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-2 mb-4">
              {detected.map((sub, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected.has(index) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(index)}
                    onChange={() => toggleSelection(index)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-2xl">{sub.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{sub.service_name}</div>
                    <div className="text-sm text-gray-500">
                      €{sub.monthly_cost.toFixed(2)}/mo
                      {sub.confidence === 'high' && (
                        <span className="ml-2 text-green-600">● High confidence</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setDetected([]); setSelected(new Set()); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Import {selected.size} subscription{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
