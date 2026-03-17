'use client';

import { useState, useCallback } from 'react';
import { CONTACT_CATEGORIES, CONTACT_STATUSES } from '@/lib/types';
import type { Bucket } from '@/lib/types';

type Props = {
  buckets: Pick<Bucket, 'id' | 'name'>[];
  onFilterChange?: (filters: FilterState) => void;
};

export type FilterState = {
  status: string;
  category: string;
  bucketId: string;
  search: string;
  page: number;
  pageSize: number;
};

const defaultFilters: FilterState = {
  status: '',
  category: '',
  bucketId: '',
  search: '',
  page: 1,
  pageSize: 20,
};

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

export default function ContactFilters({ buckets, onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  const update = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filters, ...updates };
      setFilters(next);
      onFilterChange?.(next);
    },
    [filters, onFilterChange]
  );

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search contacts"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value, page: 1 })}
            className="input-search"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <FilterIcon />
          Filter
        </button>
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => update({ status: e.target.value, page: 1 })}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-w-[140px]"
            >
              <option value="">All statuses</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => update({ category: e.target.value, page: 1 })}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-w-[140px]"
            >
              <option value="">All categories</option>
              {CONTACT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bucket</label>
            <select
              value={filters.bucketId}
              onChange={(e) => update({ bucketId: e.target.value, page: 1 })}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-w-[140px]"
            >
              <option value="">All buckets</option>
              {buckets.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export { defaultFilters };
