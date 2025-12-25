'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useExportReport } from '@/hooks/useApi';
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'summary' | 'detailed' | 'compliance';
type ReportFormat = 'pdf' | 'csv' | 'xlsx';

const reportTypes = [
  { value: 'summary' as ReportType, label: 'Resume', description: 'Vue d\'ensemble des metriques cles', icon: DocumentChartBarIcon },
  { value: 'detailed' as ReportType, label: 'Detaille', description: 'Analyse complete avec tous les details', icon: DocumentTextIcon },
  { value: 'compliance' as ReportType, label: 'Conformite', description: 'Rapport RGPD et audit trail', icon: TableCellsIcon },
];

const formats = [
  { value: 'pdf' as ReportFormat, label: 'PDF', description: 'Document portable' },
  { value: 'csv' as ReportFormat, label: 'CSV', description: 'Donnees brutes' },
  { value: 'xlsx' as ReportFormat, label: 'Excel', description: 'Tableur avec graphiques' },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const exportMutation = useExportReport();

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        format,
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <DocumentArrowDownIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Exporter un rapport</h3>
                      <p className="text-sm text-gray-500">Selectionnez le type et la periode</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </Dialog.Title>

                <div className="space-y-6">
                  {/* Report Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type de rapport
                    </label>
                    <div className="space-y-2">
                      {reportTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setReportType(type.value)}
                          className={clsx(
                            'w-full flex items-center p-3 rounded-lg border-2 transition-all',
                            reportType === type.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <type.icon className={clsx(
                            'h-5 w-5 mr-3',
                            reportType === type.value ? 'text-primary-600' : 'text-gray-400'
                          )} />
                          <div className="text-left">
                            <p className={clsx(
                              'font-medium',
                              reportType === type.value ? 'text-primary-700' : 'text-gray-900'
                            )}>
                              {type.label}
                            </p>
                            <p className="text-sm text-gray-500">{type.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <CalendarIcon className="h-4 w-4 inline mr-2" />
                      Periode
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Date debut</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Date fin</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Format
                    </label>
                    <div className="flex space-x-3">
                      {formats.map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setFormat(fmt.value)}
                          className={clsx(
                            'flex-1 py-2 px-4 rounded-lg border-2 transition-all text-center',
                            format === fmt.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          )}
                        >
                          <p className="font-medium">{fmt.label}</p>
                          <p className="text-xs text-gray-500">{fmt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exportMutation.isPending}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>{exportMutation.isPending ? 'Generation...' : 'Exporter'}</span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
