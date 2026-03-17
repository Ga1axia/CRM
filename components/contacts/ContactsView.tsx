'use client';

import { useState, useCallback } from 'react';
import ContactFilters, { type FilterState } from './ContactFilters';
import ContactsTable from './ContactsTable';
import AddContactModal from './AddContactModal';
import LaunchSequenceModal from '@/components/email/LaunchSequenceModal';
import PageHeader from '@/components/ui/PageHeader';
import type { Contact, Bucket } from '@/lib/types';

type ContactRow = Contact & {
  contact_buckets?: { bucket_id: string; buckets: { id: string; name: string } | null }[];
};

type Props = {
  initialContacts: ContactRow[];
  buckets: Pick<Bucket, 'id' | 'name'>[];
};

export default function ContactsView({ initialContacts, buckets }: Props) {
  const [contacts, setContacts] = useState<ContactRow[]>(initialContacts);
  const [totalCount, setTotalCount] = useState(initialContacts.length);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    category: '',
    bucketId: '',
    search: '',
    page: 1,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchContacts = useCallback(async (f: FilterState) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.status) params.set('status', f.status);
    if (f.category) params.set('category', f.category);
    if (f.bucketId) params.set('bucketId', f.bucketId);
    if (f.search) params.set('search', f.search);
    params.set('page', String(f.page));
    params.set('pageSize', String(f.pageSize));
    try {
      const res = await fetch(`/api/contacts?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setContacts(json.data ?? []);
      setTotalCount(json.totalCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback(
    (f: FilterState) => {
      setFilters(f);
      fetchContacts(f);
    },
    [fetchContacts]
  );

  return (
    <>
      <PageHeader title="Contacts">
        <button
          type="button"
          onClick={() => setShowLaunchModal(true)}
          className="btn-secondary"
        >
          Launch sequence
        </button>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <span>ADD CONTACT</span>
          <span className="text-lg leading-none">+</span>
        </button>
      </PageHeader>
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); fetchContacts(filters); }}
        />
      )}
      {showLaunchModal && (
        <LaunchSequenceModal
          buckets={buckets}
          onClose={() => setShowLaunchModal(false)}
          onLaunched={() => fetchContacts(filters)}
        />
      )}
      <ContactFilters buckets={buckets} onFilterChange={handleFilterChange} />
      {loading ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <ContactsTable
          initialContacts={contacts}
          buckets={buckets}
          filters={filters}
          totalCount={totalCount}
          onRefresh={() => fetchContacts(filters)}
        />
      )}
    </>
  );
}
