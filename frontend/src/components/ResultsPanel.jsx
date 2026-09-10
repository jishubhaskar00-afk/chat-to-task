export default function ResultsPanel({ result }) {
  if (!result) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Summary Box */}
      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 shadow-sm">
        <h3 className="font-semibold text-orange-800">Summary</h3>
        <p className="text-sm mt-1 text-orange-950 leading-relaxed">{result.summary}</p>
      </div>

      {/* Tasks Box */}
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Tasks</h3>
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
            {result.tasks?.length || 0}
          </span>
        </div>
        {result.tasks?.length ? (
          <ul className="space-y-2 divide-y divide-gray-100">
            {result.tasks.map((t, i) => (
              <li key={i} className="text-sm pt-2 first:pt-0">
                <strong className="text-gray-800">{t.description}</strong>
                <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                  <span><span className="font-medium text-gray-600">Assignee:</span> {t.assignee || 'unassigned'}</span>
                  <span>·</span>
                  <span><span className="font-medium text-gray-600">Deadline:</span> {t.deadline || 'none'}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No tasks found.</p>
        )}
      </div>

      {/* Decisions Box */}
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Decisions</h3>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
            {result.decisions?.length || 0}
          </span>
        </div>
        {result.decisions?.length ? (
          <ul className="text-sm space-y-1.5 text-gray-700">
            {result.decisions.map((d, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-green-600 font-bold">•</span>
                <span>{d.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No decisions found.</p>
        )}
      </div>

      {/* Approvals Box */}
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Approvals</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
            {result.approvals?.length || 0}
          </span>
        </div>
        {result.approvals?.length ? (
          <ul className="text-sm space-y-1.5 text-gray-700">
            {result.approvals.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  {a.description} —{' '}
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      a.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No approvals found.</p>
        )}
      </div>
    </div>
  );
}
