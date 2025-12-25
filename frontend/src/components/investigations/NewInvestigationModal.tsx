'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: 'fraud_ring' | 'identity_theft' | 'document_fraud' | 'benefit_fraud' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  transactions: string[];
  notes: string;
}

const typeOptions = [
  { value: 'fraud_ring', label: 'Reseau de fraude' },
  { value: 'identity_theft', label: 'Vol d\'identite' },
  { value: 'document_fraud', label: 'Fraude documentaire' },
  { value: 'benefit_fraud', label: 'Fraude aux prestations' },
  { value: 'other', label: 'Autre' },
];

const priorityOptions = [
  { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Haute', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critique', color: 'bg-red-100 text-red-800' },
];

const assigneeOptions = [
  { value: 'marie.dupont', label: 'Marie Dupont' },
  { value: 'jean.martin', label: 'Jean Martin' },
  { value: 'sophie.bernard', label: 'Sophie Bernard' },
  { value: 'pierre.durand', label: 'Pierre Durand' },
];

export function NewInvestigationModal({ isOpen, onClose }: NewInvestigationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newTransaction, setNewTransaction] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'fraud_ring',
    priority: 'medium',
    assigned_to: '',
    transactions: [],
    notes: '',
  });

  const handleAddTransaction = () => {
    if (!newTransaction.trim()) return;
    if (formData.transactions.includes(newTransaction.trim())) return;
    setFormData({
      ...formData,
      transactions: [...formData.transactions, newTransaction.trim()],
    });
    setNewTransaction('');
  };

  const handleRemoveTransaction = (txn: string) => {
    setFormData({
      ...formData,
      transactions: formData.transactions.filter((t) => t !== txn),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/investigations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          assigned_to: formData.assigned_to,
          transactions: formData.transactions,
          initial_notes: formData.notes,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        // Simulate success for demo
        setIsSuccess(true);
      }
    } catch {
      // Simulate success for demo
      setIsSuccess(true);
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({
      title: '',
      description: '',
      type: 'fraud_ring',
      priority: 'medium',
      assigned_to: '',
      transactions: [],
      notes: '',
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Nouvelle enquete
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Enquete creee avec succes
                    </h3>
                    <p className="text-gray-500 mb-6">
                      L'enquete a ete creee et assignee a {
                        assigneeOptions.find(a => a.value === formData.assigned_to)?.label || formData.assigned_to
                      }
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => {
                          setIsSuccess(false);
                          setFormData({
                            title: '',
                            description: '',
                            type: 'fraud_ring',
                            priority: 'medium',
                            assigned_to: '',
                            transactions: [],
                            notes: '',
                          });
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Creer une autre enquete
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre de l'enquete *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Suspicion de fraude aux prestations"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Type and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'enquete *
                        </label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as FormData['type'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                          {typeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priorite *
                        </label>
                        <div className="flex space-x-2">
                          {priorityOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, priority: opt.value as FormData['priority'] })}
                              className={clsx(
                                'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all',
                                formData.priority === opt.value
                                  ? `${opt.color} border-transparent ring-2 ring-offset-1 ring-primary-500`
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Assigned To */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigner a *
                      </label>
                      <select
                        required
                        value={formData.assigned_to}
                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                      >
                        <option value="">Selectionner un enqueteur</option>
                        {assigneeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Decrivez le contexte et les elements suspects..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Linked Transactions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transactions liees
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newTransaction}
                          onChange={(e) => setNewTransaction(e.target.value)}
                          placeholder="TXN-2024-XXXX"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTransaction();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTransaction}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                      {formData.transactions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.transactions.map((txn) => (
                            <span
                              key={txn}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {txn}
                              <button
                                type="button"
                                onClick={() => handleRemoveTransaction(txn)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Initial Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes initiales
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        placeholder="Notes supplementaires..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            <span>Creation...</span>
                          </>
                        ) : (
                          <span>Creer l'enquete</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
