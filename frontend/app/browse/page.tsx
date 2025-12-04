import { Suspense } from 'react';
import { BrowseContent } from '@/components/BrowseContent';
import { getStoresWithProducts, getCategories } from '@/src/actions/stores';

// Loading component
function BrowseLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="h-12 bg-stone-200 rounded-xl animate-pulse" />
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <div className="h-6 w-24 bg-stone-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-5 bg-stone-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content skeleton */}
        <div className="flex-1 min-w-0 mt-20">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-stone-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-4 overflow-hidden pb-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-64 md:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                      <div className="h-48 bg-stone-200 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-stone-200 rounded animate-pulse" />
                        <div className="h-3 bg-stone-100 rounded animate-pulse w-3/4" />
                        <div className="h-6 w-20 bg-amber-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Server component to fetch initial data
async function BrowseData() {
  // Fetch initial data on the server
  const [stores, categories] = await Promise.all([
    getStoresWithProducts(),
    getCategories(),
  ]);

  return <BrowseContent initialStores={stores} initialCategories={categories} />;
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseData />
    </Suspense>
  );
}

// Enable dynamic rendering for fresh data
export const dynamic = 'force-dynamic';
