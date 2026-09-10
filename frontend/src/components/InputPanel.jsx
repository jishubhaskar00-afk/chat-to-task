import { useState } from 'react';

export default function InputPanel({ onExtract }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onExtract(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-2 text-gray-900">Paste a conversation</h2>
      <textarea
        className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        placeholder="Paste WhatsApp export, email thread, or meeting notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between mt-3">
        <button
          className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Processing...' : 'Extract'}
        </button>
        <button
          type="button"
          onClick={() => {
            setText(`[Client - Priya]: Hi team, after reviewing samples we've decided to go with engineered oak flooring instead of laminate for the living room. Please proceed.\n[Architect - Raj]: Noted, updating the drawings. @Contractor please revise the procurement order and confirm cost impact by Friday.\n[Contractor - Suresh]: Got it, will send revised quote by Friday. Also need approval on the extended timeline — 2 extra weeks for the oak flooring delivery.\n[PM - Anita]: Approval pending from client on the 2-week extension. Will confirm in tomorrow's call.`);
          }}
          className="text-xs text-orange-600 hover:text-orange-700 underline"
        >
          Load sample discussion
        </button>
      </div>
    </div>
  );
}
