import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import api from '../../../services/api';

const ValidationPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [validationData, setValidationData] = useState(null);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/digital-twin/validate');
      setValidationData(data.data);
    } catch (error) {
      console.error('Validation execution error', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-sm">Executing Digital Twin Validation Engine...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
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
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Digital Twin Health Monitor</span>
            <h1 className="text-2xl font-black font-display text-gray-900 tracking-tight">
              Spatial & Navigation Graph Validation
            </h1>
          </div>
        </div>

        <button
          onClick={runValidation}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-200 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Re-Run Diagnostic
        </button>
      </div>

      {/* Health Score Summary */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Digital Twin Health Index</span>
          <h2 className="text-3xl font-black text-gray-900">
            {validationData?.valid ? '✓ Navigation Graph Valid' : 'Action Required'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Mapped {validationData?.mappedCount || 0} of {validationData?.totalRooms || 0} total rooms.
          </p>
        </div>

        <div className="w-28 h-28 rounded-full border-8 border-blue-600 flex flex-col items-center justify-center bg-blue-50/50 shadow-inner shrink-0">
          <span className="text-2xl font-black text-blue-900 font-display">{validationData?.healthScore || 85}%</span>
          <span className="text-[9px] font-bold text-blue-600 uppercase">Health</span>
        </div>
      </div>

      {/* Diagnostics Lists */}
      <div className="grid gap-6">

        {/* Warnings */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Mapping Warnings ({validationData?.warnings?.length || 0})
          </h3>

          <div className="space-y-2">
            {validationData?.warnings?.map((warn, idx) => (
              <div key={idx} className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Critical Errors */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Graph Integrity Errors ({validationData?.errors?.length || 0})
          </h3>

          <div className="space-y-2">
            {validationData?.errors?.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-xs font-bold text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>No critical spatial or graph connectivity errors found!</span>
              </div>
            ) : (
              validationData?.errors?.map((err, idx) => (
                <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-900 flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  <span>{err}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ValidationPage;
