import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lead } from '../types';
import { api, getAuthToken } from '../api';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Kanban,
  Table as TableIcon,
  X,
} from 'lucide-react';

interface LeadManagerViewProps {
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

export const LeadManagerView: React.FC<LeadManagerViewProps> = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<Lead['source']>('WhatsApp');
  const [status, setStatus] = useState<Lead['status']>('New');
  const [dealValue, setDealValue] = useState('');
  const [notes, setNotes] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads();
      setLeads(res.leads || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const openCreateModal = () => {
    setEditingLead(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setSource('WhatsApp');
    setStatus('New');
    setDealValue('');
    setNotes('');
    setNextFollowUp('');
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFullName(lead.fullName);
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setSource(lead.source);
    setStatus(lead.status);
    setDealValue(lead.dealValue ? lead.dealValue.toString() : '');
    setNotes(lead.notes || '');
    setNextFollowUp(lead.nextFollowUp || '');
    setModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        fullName,
        email,
        phone,
        source,
        status,
        dealValue: parseFloat(dealValue) || 0,
        notes,
        nextFollowUp: nextFollowUp || null,
      };

      if (editingLead) {
        const res = await api.updateLead(editingLead.id, payload);
        setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? res.lead : l)));
      } else {
        const res = await api.createLead(payload);
        setLeads((prev) => [res.lead, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save lead: ${err.message}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer lead?')) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: Lead['status']) => {
    try {
      const res = await api.updateLead(lead.id, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? res.lead : l)));
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleExportCSV = () => {
    const token = getAuthToken();
    window.location.href = `/api/leads/export?token=${token}`;
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currencySymbol = user?.currency === 'USD' ? '$' : '₦';

  const pipelineColumns: Array<{ status: Lead['status']; label: string; color: string }> = [
    { status: 'New', label: 'New Inquiries', color: 'text-amber-400' },
    { status: 'Contacted', label: 'Contacted', color: 'text-sky-400' },
    { status: 'Interested', label: 'Interested / Pricing', color: 'text-indigo-400' },
    { status: 'Converted', label: 'Converted / Paid', color: 'text-emerald-400' },
    { status: 'Not interested', label: 'Not Interested', color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs text-slate-400">
            <span>Sales Acceleration</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Customer Pipeline CRM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Customer Lead Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Track inquiries from WhatsApp, Instagram, and your website. Nurture prospective buyers and record verified sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              title="Pipeline Kanban View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              title="Data Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Customer Lead
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, phone, email, notes..."
            className="w-full bg-[#0B101B] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        {/* Status Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {['all', 'New', 'Contacted', 'Interested', 'Converted', 'Not interested'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Leads' : st}
            </button>
          ))}
        </div>
      </div>

      {/* View 1: Pipeline Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {pipelineColumns.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.status);
            const columnTotalValue = columnLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

            return (
              <div key={col.status} className="bg-[#0B101B] border border-slate-800 rounded-xl p-3.5 space-y-3 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">({columnLeads.length})</span>
                  </div>
                  {columnTotalValue > 0 && (
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {currencySymbol}{columnTotalValue.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-lg transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{lead.fullName}</div>
                          <div className="text-[11px] text-slate-400">{lead.source}</div>
                        </div>
                        {lead.dealValue > 0 && (
                          <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                            {currencySymbol}{lead.dealValue.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {lead.notes}
                        </p>
                      )}

                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>Follow up: {lead.nextFollowUp}</span>
                        </div>
                      )}

                      {/* Card Action Strip */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${lead.fullName}, thank you for your inquiry with ${user?.businessName}!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 p-1 rounded"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => openEditModal(lead)}
                            className="text-slate-400 hover:text-white p-1 rounded"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status Mover Quick Select */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Converted">Converted</option>
                          <option value="Not interested">Not interested</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-600">No leads in stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: High-Density Table View */}
      {viewMode === 'table' && (
        <div className="bg-[#0B101B] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer Name</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Deal Value</th>
                  <th className="py-3 px-4 font-semibold">Follow-Up</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{lead.fullName}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{lead.phone || '—'}</div>
                      <div className="text-[11px] text-slate-500">{lead.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{lead.source}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          lead.status === 'Converted'
                            ? 'text-emerald-400'
                            : lead.status === 'Interested'
                            ? 'text-indigo-400'
                            : lead.status === 'Contacted'
                            ? 'text-sky-400'
                            : lead.status === 'New'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      {lead.dealValue > 0 ? `${currencySymbol}${lead.dealValue.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {lead.nextFollowUp ? (
                        <span className="font-mono text-amber-400">{lead.nextFollowUp}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${lead.fullName}, thank you for inquiring with ${user?.businessName}!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 p-1"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(lead)}
                          className="text-slate-400 hover:text-white p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No leads match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingLead ? 'Edit Customer Lead' : 'Log New Customer Lead'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Mrs. Folake Adebayo"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (with country code)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="folake@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Website">Website Form</option>
                    <option value="Walk-in">Walk-in Store</option>
                    <option value="Referral">Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted (Closed Sale)</option>
                    <option value="Not interested">Not interested</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Deal Value ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="65000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Conversation Notes & Requirements</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details of inquiry, specific items requested, delivery address, fabric choices..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  {editingLead ? 'Update Customer Lead' : 'Save Customer Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
