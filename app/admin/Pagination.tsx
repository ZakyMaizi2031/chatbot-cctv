'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  tab 
}: { 
  currentPage: number, 
  totalPages: number, 
  totalItems: number, 
  itemsPerPage: number, 
  tab: string 
}) {
  const searchParams = useSearchParams();
  
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper to build URL with existing search params
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
      <div className="flex items-center text-sm text-slate-500 font-medium">
        Menampilkan <span className="font-bold text-slate-800 mx-1">{startItem}</span> - <span className="font-bold text-slate-800 mx-1">{endItem}</span> dari <span className="font-bold text-slate-800 mx-1">{totalItems}</span> data
      </div>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link 
            href={buildPageUrl(currentPage - 1)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <div className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <div className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Halaman {currentPage} / {totalPages}
        </div>

        {currentPage < totalPages ? (
          <Link 
            href={buildPageUrl(currentPage + 1)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <div className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
