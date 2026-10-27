import React, { useState, useEffect } from 'react';
import { SavedContent } from '../types';
import { api } from '../api';
import {
  BookmarkCheck,
  Trash2,
  Copy,
  Check,
  Megaphone,
  Share2,
  MessageSquare,
  Globe,
  Search,
  ExternalLink,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const [items, setItems] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await api.getContent();
      setItems(res.content || []);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved item?')) return;
    try {
      await api.deleteContent(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const copyItemText = (item: SavedContent) => {
    let text = '';
    if (typeof item.data === 'string') {
      text = item.data;
    } else if (item.data?.caption) {
      text = item.data.caption;
    } else if (item.data?.headlines) {
      text = `Headlines:\n${item.data.headlines.join('\n')}\n\nCaptions:\n${(item.data.socialCaptions || []).join('\n\n')}`;
    } else {
      text = JSON.stringify(item.data, null, 2);
    }

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.platform && item.platform.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="text-xs text-slate-400">
          <span>Marketing Asset Vault</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Saved Generations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Saved Content Library
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          All your saved ad copies, captions, WhatsApp reply templates, and campaigns stored in one organized place.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved marketing copy..."
            className="w-full bg-[#0B101B] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {['all', 'ad', 'social', 'whatsapp'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                filterType === type ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Content' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading saved content vault...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-16 text-center">
          <BookmarkCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Saved Items Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When you generate ads, captions, or WhatsApp responses, click "Save to Library" to keep them permanently accessible.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0B101B] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                      {item.type}
                    </span>
                    {item.platform && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.platform}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate mt-0.5">{item.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyItemText(item)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Copy Content"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Preview */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono max-h-36 overflow-y-auto leading-relaxed">
                {item.data?.caption ? (
                  <p className="whitespace-pre-wrap">{item.data.caption}</p>
                ) : item.data?.headlines ? (
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-200">Headlines:</div>
                    <ul className="list-disc pl-4 text-slate-300">
                      {item.data.headlines.map((h: string, i: number) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-[11px]">{JSON.stringify(item.data, null, 2)}</pre>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
