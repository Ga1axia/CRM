'use client';

import Link from 'next/link';
import type { Bucket } from '@/lib/types';

type Props = {
  buckets: Bucket[];
};

export default function BucketList({ buckets }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {buckets.length === 0 ? (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">No buckets yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {buckets.map((b) => (
            <li key={b.id}>
              <Link
                href={`/buckets/${b.id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">{b.name}</span>
                {b.type && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {b.type.replace(/_/g, ' ')}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
