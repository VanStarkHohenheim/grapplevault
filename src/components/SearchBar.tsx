'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

export default function SearchBar({ onSearch, searchTerm }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une technique, un combattant..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white rounded-full py-3 pl-12 pr-10 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all placeholder:text-slate-500"
        />
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        
        {searchTerm && (
          <button 
            onClick={() => onSearch('')}
            className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}