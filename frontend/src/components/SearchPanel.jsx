import { useState } from 'react';
import axios from 'axios';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/search?q=${encodeURIComponent(query)}`
      );
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-900">Search Project Memory</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="e.g. flooring, approval, deadline..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition cursor-pointer disabled:opacity-50"
          onClick={search}
          disabled={searching || !query.trim()}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results && (
        <div className="mt-4 text-sm space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <strong className="text-gray-800">Tasks ({results.tasks?.length || 0}):</strong>
            {results.tasks?.length ? (
              <ul className="mt-1 space-y-1 text-gray-700">
                {results.tasks.map((t) => (
                  <li key={t.id} className="flex gap-1.5">
                    <span className="text-orange-500">•</span>
                    <span>
                      {t.description}
                      <span className="text-xs text-gray-500 ml-2">
                        ({t.assignee || 'unassigned'}, {t.deadline || 'no deadline'})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 mt-1">No matching tasks.</p>
            )}
          </div>

          <div>
            <strong className="text-gray-800">
              Decisions & Approvals ({results.decisions?.length || 0}):
            </strong>
            {results.decisions?.length ? (
              <ul className="mt-1 space-y-1 text-gray-700">
                {results.decisions.map((d) => (
                  <li key={d.id} className="flex gap-1.5">
                    <span className="text-green-500">•</span>
                    <span>
                      {d.description}
                      <span className="text-xs text-gray-500 ml-2 capitalize">
                        [{d.type}: {d.status}]
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 mt-1">No matching decisions or approvals.</p>
            )}
          </div>

          {results.conversations?.length > 0 && (
            <div>
              <strong className="text-gray-800">
                Conversations ({results.conversations.length}):
              </strong>
              <ul className="mt-1 space-y-1 text-gray-700">
                {results.conversations.map((c) => (
                  <li key={c.id} className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-800">Summary: </span>
                    {c.summary}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
