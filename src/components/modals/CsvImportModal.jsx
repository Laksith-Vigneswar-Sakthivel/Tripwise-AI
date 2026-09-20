import React, { useState } from 'react';
import { useTripWise } from '../../context/TripWiseContext';
import { Modal } from '../common/Modal';
import { parseExpensesFromCsv } from '../../services/expenseService';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const SAMPLE_CSV = `merchant,amount,category,date
Whole Foods,850,Food,2026-09-18
Decathlon,2490,Shopping,2026-09-17
Metro Smart Card,500,Transport,2026-09-16
BookMyShow,680,Entertainment,2026-09-15`;

export const CsvImportModal = ({ isOpen, onClose }) => {
  const { importExpenses, user } = useTripWise();
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [parseError, setParseError] = useState('');

  const handleTextChange = (text) => {
    setCsvText(text);
    setParseError('');
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    try {
      const items = parseExpensesFromCsv(text);
      setParsedPreview(items);
    } catch (err) {
      setParseError(err.message);
      setParsedPreview([]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      handleTextChange(content);
    };
    reader.onerror = () => {
      setParseError('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleTextChange(SAMPLE_CSV);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    importExpenses(parsedPreview);
    setCsvText('');
    setParsedPreview([]);
    setParseError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Expenses via CSV"
      subtitle="Upload or paste your bank or card statement in standard CSV format."
      maxWidth="600px"
    >
      <div className="csv-modal-content">
        {/* Upload Zone */}
        <div className="csv-dropzone">
          <UploadCloud size={32} className="csv-drop-icon" />
          <p className="csv-drop-title">Upload .csv statement file</p>
          <p className="csv-drop-sub">Columns required: merchant, amount, category, date</p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="csv-file-input"
            id="csv-file-elem"
          />
          <label htmlFor="csv-file-elem" className="btn btn-outline btn-sm">
            Browse Files
          </label>
        </div>

        <div className="csv-divider">
          <span>OR PASTE CSV CONTENT</span>
        </div>

        {/* Textarea */}
        <div className="form-group">
          <div className="csv-textarea-header">
            <label className="form-label">CSV Data</label>
            <button
              type="button"
              className="btn-text-link"
              onClick={handleLoadSample}
            >
              Load Sample Template
            </button>
          </div>
          <textarea
            rows={5}
            className="form-input form-textarea font-mono"
            placeholder="merchant,amount,category,date&#10;Swiggy,420,Food,2026-09-18&#10;Amazon,1299,Shopping,2026-09-17"
            value={csvText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        {/* Error state */}
        {parseError && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={16} />
            <span>{parseError}</span>
          </div>
        )}

        {/* Preview parsed rows */}
        {parsedPreview.length > 0 && (
          <div className="csv-preview-card">
            <div className="csv-preview-title">
              <CheckCircle2 size={16} className="success-icon" />
              <span>Preview ({parsedPreview.length} expenses ready)</span>
            </div>
            <div className="csv-table-scroll">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedPreview.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.merchant}</td>
                      <td>{row.category}</td>
                      <td>{row.date}</td>
                      <td className="text-right font-mono">
                        {formatCurrency(row.amount, user.currency)}
                      </td>
                    </tr>
                  ))}
                  {parsedPreview.length > 5 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        ...and {parsedPreview.length - 5} more transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
          >
            Import {parsedPreview.length > 0 ? `${parsedPreview.length} Expenses` : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
};
