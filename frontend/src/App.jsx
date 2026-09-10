import { useState } from 'react';
import axios from 'axios';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import SearchPanel from './components/SearchPanel';

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleExtract = async (text) => {
    setError(null);
    try {
      const res = await axios.post('http://localhost:4000/api/extract', { text });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to extract:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to connect to backend server on port 4000.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <main className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-lg shadow-sm">
              CT
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ChatToTask</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Turn messy project conversations into structured, searchable tasks, decisions, deadlines, and approvals.
          </p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <InputPanel onExtract={handleExtract} />
        <ResultsPanel result={result} />
        <SearchPanel />
      </main>
    </div>
  );
}
