import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Info
} from 'lucide-react';
import api from '../../../services/api';

const DataImportExportPage = () => {
  const navigate = useNavigate();

  const [csvText, setCsvText] = useState('');
  const [entityType, setEntityType] = useState('rooms');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const sampleCsv = `building,floor,room_number,room_name,type,capacity
CSE Block,1,F101,CSE Lecture Hall A,Classroom,65
CSE Block,1,F105,Programming Laboratory,Computer Lab,60
Mechanical Block,0,M001,Automotive CAD Workshop,Workshop,40`;

  const handleImport = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV data or enter content to import.');
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      const { data } = await api.post('/import-export/import', {
        csvText,
        entityType
      });

      setImportResult(data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const response = await api.get('/import-export/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `siet-digital-twin-backup-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export Digital Twin backup');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 text-gray-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">College Data Center</span>
            <h1 className="text-2xl font-black font-display text-gray-900 tracking-tight">
              Bulk Data Import & Backup Export
            </h1>
          </div>
        </div>

        <button
          onClick={handleExportBackup}
          className="inline-flex items-center gap-2 bg-[#004d71] hover:bg-[#003d52] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-100 transition-all"
        >
          <Download className="w-4 h-4" /> Download Digital Twin Backup JSON
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* CSV Import Box */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" /> Bulk CSV Ingestion
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Entity Category</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold"
            >
              <option value="rooms">Classrooms & Laboratories</option>
              <option value="departments">Academic Departments</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Paste CSV Content</label>
              <button
                type="button"
                onClick={() => setCsvText(sampleCsv)}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Load Sample CSV
              </button>
            </div>
            <textarea
              rows={10}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="building,floor,room_number,room_name,type,capacity..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-800"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {importing ? 'Processing Data...' : 'Import CSV Records'}
          </button>
        </div>

        {/* Results & Guidelines */}
        <div className="space-y-6">

          {/* Import Metric Report */}
          {importResult && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Import Execution Metrics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl border">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Total Rows</p>
                  <p className="text-xl font-black">{importResult.imported}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-2xl border border-green-100 text-green-800">
                  <p className="text-[10px] font-bold uppercase">Successful</p>
                  <p className="text-xl font-black">{importResult.successful}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-100 text-yellow-800">
                  <p className="text-[10px] font-bold uppercase">Duplicates Skipped</p>
                  <p className="text-xl font-black">{importResult.duplicate}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-red-800">
                  <p className="text-[10px] font-bold uppercase">Invalid Rows</p>
                  <p className="text-xl font-black">{importResult.invalid}</p>
                </div>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" /> Data Source Integrity Rule
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Importing data updates classroom names and capacities. Physical coordinates are added only when verified on floor plan editor. Unmapped physical layouts display <span className="font-bold text-amber-600">NOT MAPPED</span> or <span className="font-bold text-amber-600">NOT VERIFIED</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportExportPage;
