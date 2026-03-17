'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type PreviewRow = Record<string, string>;

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported?: number; error?: string } | null>(null);

  const parseFile = useCallback((f: File) => {
    const name = f.name.toLowerCase();
    if (name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = () => {
        const parsed = Papa.parse<Record<string, string>>(reader.result as string, { header: true, skipEmptyLines: true });
        setPreview(parsed.data ?? []);
      };
      reader.readAsText(f);
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = () => {
        const workbook = XLSX.read(reader.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        setPreview(XLSX.utils.sheet_to_json(sheet) as PreviewRow[]);
      };
      reader.readAsArrayBuffer(f);
    } else {
      setPreview([]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setResult(null);
    if (f) parseFile(f);
    else setPreview([]);
  };

  const confirmImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/import', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setResult({ error: data.error ?? res.statusText });
      else setResult({ imported: data.imported });
    } finally {
      setLoading(false);
    }
  };

  const cols = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Import contacts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload CSV or XLSX with columns: Name, Title, Company, Email, LinkedIn, Category, Tier, Status, Notes.
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose file</label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--accent)] file:text-white file:cursor-pointer hover:file:opacity-90"
          />
        </div>
        {result && (
          <div className={`p-3 rounded-lg text-sm ${result.error ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'}`}>
            {result.error ?? `Imported ${result.imported} contacts.`}
          </div>
        )}
        {preview.length > 0 && (
          <>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview ({preview.length} rows)
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {cols.map((c) => (
                      <th key={c} className="px-4 py-2.5 text-left font-medium text-gray-700 dark:text-gray-300">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {cols.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                          {row[col] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={confirmImport}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Importing…' : `Confirm import (${preview.length} contacts)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
