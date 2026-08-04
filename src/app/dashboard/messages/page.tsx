"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Search,
  Users,
  User,
  Send,
  Hash,
  Info,
  X,
  Loader2,
  Check,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  BellOff,
  ShieldCheck,
  FileText,
  ExternalLink,
  Calendar,
  Sparkles,
  Trash2,
  Lock,
  Crown,
} from "lucide-react";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { canAccessMessages, MESSAGES_UPGRADE_MESSAGE } from "@/lib/planLimits";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────

interface GroupMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

interface ChatRoom {
  id: string;
  type: "group" | "dm";
  name: string;
  initials: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online?: boolean;
  color: string;
  messages: ChatMessage[];
  // Metadata for Info Panel
  email?: string;
  phone?: string;
  unit?: string;
  property?: string;
  rentAmount?: string;
  rentStatus?: "Paid" | "Due" | "Overdue";
  leaseEndDate?: string;
  description?: string;
  members?: GroupMember[];
}

interface TenantResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  unit?: string;
  property?: string;
  rentAmount?: string;
  rentStatus?: "Paid" | "Due" | "Overdue";
  leaseEndDate?: string;
  initials: string;
  color: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const DM_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-teal-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500"];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── New DM Modal ────────────────────────────────────────────────────────────

function NewDMModal({
  onClose,
  onStartDM,
}: {
  onClose: () => void;
  onStartDM: (tenant: TenantResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [tenants, setTenants] = useState<TenantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const workspaceId = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
        if (!workspaceId) {
          setTenants([]);
          return;
        }
        const res = await fetch(`/api/tenants?workspaceId=${workspaceId}`);
        if (res.ok) {
          const result = await res.json();
          const rawList = result.data || result.tenants || (Array.isArray(result) ? result : []);
          const tenantList: TenantResult[] = rawList.map((t: any, i: number) => ({
            id: String(t.id),
            name: t.name || "Tenant User",
            email: t.email || "No email",
            phone: t.phone || "+91 98765 43210",
            unit: t.unit?.unitNumber || t.unitNumber || "N/A",
            property: t.unit?.property?.name || t.propertyName || "Property",
            rentAmount: t.monthlyRent ? `₹${Number(t.monthlyRent).toLocaleString("en-IN")}/mo` : (t.unit?.rentAmount ? `₹${Number(t.unit.rentAmount).toLocaleString("en-IN")}/mo` : "—"),
            rentStatus: t.rentStatus || (t.currentStatus === "Current" || t.currentStatus === "Active" ? "Paid" : "Due"),
            leaseEndDate: t.leaseEnd ? new Date(t.leaseEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
            initials: getInitials(t.name || "Tenant"),
            color: DM_COLORS[i % DM_COLORS.length],
          }));
          setTenants(tenantList);
        }
      } catch (err) {
        console.error("Error fetching tenants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.email.toLowerCase().includes(query.toLowerCase()) ||
      (t.unit || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">New Direct Message</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Search and select a tenant to message</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or unit..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-3 pb-4 max-h-72 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Loading tenants...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
              <User className="w-7 h-7" />
              <p className="text-xs font-medium">{query ? "No tenants match your search" : "No tenants found"}</p>
            </div>
          ) : (
            <div className="space-y-0.5 mt-1">
              {filtered.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => onStartDM(tenant)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 hover:border-orange-100 border border-transparent transition-all cursor-pointer group text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${tenant.color} text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 shadow-sm`}>
                    {tenant.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#FF6B00] transition-colors truncate">{tenant.name}</p>
                    <p className="text-[11px] text-slate-400 truncate font-medium">
                      {tenant.unit ? `Unit ${tenant.unit} · ` : ""}{tenant.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Message →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New Group Modal ──────────────────────────────────────────────────────────

function NewGroupModal({
  onClose,
  onCreateGroup,
}: {
  onClose: () => void;
  onCreateGroup: (groupName: string, selectedTenants: TenantResult[]) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [tenants, setTenants] = useState<TenantResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Fetch tenants (workspace-scoped)
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const workspaceId = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
        if (!workspaceId) {
          setTenants([]);
          return;
        }
        const res = await fetch(`/api/tenants?workspaceId=${workspaceId}`);
        if (res.ok) {
          const result = await res.json();
          const rawList = result.data || result.tenants || (Array.isArray(result) ? result : []);
          const tenantList: TenantResult[] = rawList.map((t: any, i: number) => ({
            id: String(t.id),
            name: t.name || "Tenant User",
            email: t.email || "No email",
            phone: t.phone || "+91 98765 43210",
            unit: t.unit?.unitNumber || t.unitNumber || "N/A",
            property: t.unit?.property?.name || t.propertyName || "Property",
            rentAmount: t.monthlyRent ? `₹${Number(t.monthlyRent).toLocaleString("en-IN")}/mo` : (t.unit?.rentAmount ? `₹${Number(t.unit.rentAmount).toLocaleString("en-IN")}/mo` : "—"),
            rentStatus: t.rentStatus || (t.currentStatus === "Current" || t.currentStatus === "Active" ? "Paid" : "Due"),
            leaseEndDate: t.leaseEnd ? new Date(t.leaseEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
            initials: getInitials(t.name || "Tenant"),
            color: DM_COLORS[i % DM_COLORS.length],
          }));
          setTenants(tenantList);
        }
      } catch (err) {
        console.error("Error fetching tenants for group:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.email.toLowerCase().includes(query.toLowerCase()) ||
      (t.unit || "").toLowerCase().includes(query.toLowerCase())
  );

  const selectedTenants = tenants.filter((t) => selectedIds.includes(t.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeSelected = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    onCreateGroup(groupName.trim(), selectedTenants);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 rounded-t-2xl">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Create New Group</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Add group details and select participants</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-5 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Group Name *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Wing B Residents, Maintenance Crew..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all"
            />
          </div>

          {/* Participants Multi-Select Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Select Participants ({selectedTenants.length} selected)
            </label>

            {/* Dropdown Trigger Container */}
            <div
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full min-h-[42px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300 focus-within:ring-2 focus-within:ring-[#FF6B00] focus-within:bg-white transition-all"
            >
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {selectedTenants.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-100 text-[#FF6B00] text-[11px] font-bold border border-orange-200/80 animate-in fade-in duration-100"
                  >
                    <span>{t.name}</span>
                    <button
                      type="button"
                      onClick={(e) => removeSelected(t.id, e)}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={selectedTenants.length === 0 ? "Click to select participants..." : "Type to filter..."}
                  className="flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-[120px] py-1"
                />
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-[#FF6B00]" : ""
                }`}
              />
            </div>

            {/* Dropdown Menu Popup - Floating with high z-50 */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                {loading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-medium">Loading tenants...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-6 flex flex-col items-center gap-1 text-slate-400">
                    <User className="w-5 h-5" />
                    <p className="text-xs font-medium">{query ? "No tenants match search" : "No tenants available"}</p>
                  </div>
                ) : (
                  <div className="p-1 space-y-0.5">
                    {filtered.map((tenant) => {
                      const isSelected = selectedIds.includes(tenant.id);
                      return (
                        <button
                          key={tenant.id}
                          type="button"
                          onClick={() => toggleSelect(tenant.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-orange-50 text-[#FF6B00] font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-full ${tenant.color} text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-sm`}>
                              {tenant.initials}
                            </div>
                            <div className="truncate">
                              <p className="text-xs leading-tight truncate">{tenant.name}</p>
                              <p className="text-[10px] text-slate-400 truncate font-normal">
                                {tenant.unit ? `Unit ${tenant.unit} · ` : ""}{tenant.email}
                              </p>
                            </div>
                          </div>

                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                            isSelected
                              ? "bg-[#FF6B00] border-[#FF6B00] text-white"
                              : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!groupName.trim()}
            className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Message Item Sub-Component ──────────────────────────────────────────

function ChatMessageItem({
  msg,
  showSenderName,
  roomColor,
  roomType,
}: {
  msg: ChatMessage;
  showSenderName: boolean;
  roomColor: string;
  roomType: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LINES = 5;

  const lines = msg.text.split("\n");
  const isLong = lines.length > MAX_LINES || msg.text.length > 250;

  return (
    <div className={`flex gap-2.5 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!msg.isMe && (
        <div className={`w-8 h-8 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-sm ${roomType === "group" ? "bg-slate-400" : roomColor}`}>
          {msg.senderInitials}
        </div>
      )}
      <div className={`max-w-[70%] sm:max-w-[65%] space-y-1 flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
        {showSenderName && (
          <span className="text-[10px] font-bold text-slate-400 px-1">{msg.senderName}</span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap break-all ${
            msg.isMe
              ? "bg-[#FF6B00] text-white rounded-tr-sm"
              : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
          } ${!isExpanded && isLong ? "line-clamp-5 overflow-hidden" : ""}`}
        >
          {msg.text}
        </div>

        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[10px] font-extrabold text-[#FF6B00] hover:underline cursor-pointer px-1 mt-0.5"
          >
            {isExpanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}

        <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Delete Chat Confirmation Modal Sub-Component ─────────────────────────────

function DeleteChatConfirmationModal({
  roomName,
  isDeleting,
  onConfirm,
  onClose,
}: {
  roomName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900">Delete Conversation?</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-800">{roomName}</strong>? All message history will be permanently removed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Conversation Info Panel Sub-Component ─────────────────────────────────────

function ConversationInfoPanel({
  room,
  onClose,
  onOpenAddMember,
  onOpenDeleteModal,
}: {
  room: ChatRoom;
  onClose: () => void;
  onOpenAddMember?: () => void;
  onOpenDeleteModal?: () => void;
}) {
  const isGroup = room.type === "group";

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {isGroup ? "Group Details" : "Tenant Profile"}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Hero Card */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className={`w-16 h-16 rounded-2xl ${room.color} text-white font-extrabold text-xl flex items-center justify-center shadow-md mb-3`}>
            {isGroup ? <Users className="w-8 h-8" /> : room.initials}
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{room.name}</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {isGroup ? (room.property || "Property Group") : (room.unit ? `${room.unit} · ${room.property || "Building Resident"}` : room.email || "Tenant")}
          </p>

          {!isGroup && room.online && (
            <span className="mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Now
            </span>
          )}
        </div>

        {/* Group Specific Info */}
        {isGroup ? (
          <>
            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">About Channel</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                {room.description || "Official group discussion channel for team and residents."}
              </p>
            </div>

            {/* Members Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Participants ({room.members?.length || 1})
                </span>
                {onOpenAddMember && (
                  <button
                    onClick={onOpenAddMember}
                    className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Member
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {(room.members && room.members.length > 0) ? (
                  room.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full ${m.color} text-white text-[10px] font-extrabold flex items-center justify-center shrink-0`}>
                          {m.initials}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-2">No extra member info available.</div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* DM Specific Tenant Details */
          <>
            {/* Contact Information */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Details</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{room.email || "No email available"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{room.phone || "+91 98765 43210"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{room.unit ? `${room.unit} · ${room.property || "Building"}` : "Assigned Property Unit"}</span>
                </div>
              </div>
            </div>

            {/* Financial & Lease Summary */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lease Ledger</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Monthly Rent</span>
                  <span className="font-extrabold text-slate-900">{room.rentAmount || "₹24,500/mo"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Payment Status</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                    {room.rentStatus || "Paid"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Lease Expiry</span>
                  <span className="font-bold text-slate-700">{room.leaseEndDate || "31 Dec 2026"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => window.open("/dashboard/tenants", "_self")}
                className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6B00]" />
                  <span>View Tenant Profile & Ledger</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </>
        )}

        {/* Global Settings Actions */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <button
            type="button"
            className="w-full py-2 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <BellOff className="w-4 h-4 text-slate-400" />
            <span>Mute Notifications</span>
          </button>

          {onOpenDeleteModal && (
            <button
              type="button"
              onClick={onOpenDeleteModal}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100/80 border border-red-200/80 text-red-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete Conversation</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Room Item ────────────────────────────────────────────────────────────────

function RoomItem({ room, isActive, onSelect }: { room: ChatRoom; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{ width: "calc(100% - 16px)", marginLeft: "8px", marginRight: "8px" }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
        isActive ? "bg-[#FF6B00]/10 border border-[#FF6B00]/20" : "hover:bg-slate-100"
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-xl ${room.color} text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm`}>
          {room.type === "group" ? <Users className="w-4 h-4" /> : room.initials}
        </div>
        {room.type === "dm" && room.online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold truncate ${isActive ? "text-[#FF6B00]" : "text-slate-800"}`}>{room.name}</span>
          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{room.lastTime}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] text-slate-400 truncate font-medium">{room.lastMessage}</span>
          {room.unreadCount > 0 && (
            <span className="shrink-0 ml-1.5 w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[9px] font-black flex items-center justify-center">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messagesAllowed, setMessagesAllowed] = useState<boolean | null>(null);
  const [landlordProfile, setLandlordProfile] = useState<{
    id: string;
    name: string;
    initials: string;
    email?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolve landlord profile + workspace-scoped chat rooms
  // ─── Workspace ID for TanStack Query ──────────────────────────────────────────────
  const [chatWorkspaceId, setChatWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Resolve workspace + profile on mount (auth stays here, not in useQuery)
  useEffect(() => {
    const initChat = async () => {
      const workspaceId = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (workspaceId) setChatWorkspaceId(workspaceId);

      // Plan gate: Messages is Pro / Pro Plus (trial unlocked)
      try {
        const planRes = await fetch(`/api/workspace?wid=${workspaceId}`);
        if (planRes.ok) {
          const planJson = await planRes.json();
          const plan = planJson?.data?.plan || "free";
          const isTrialActive = Boolean(planJson?.data?.isTrialActive);
          setMessagesAllowed(canAccessMessages({ plan, isTrialActive }));
        } else {
          setMessagesAllowed(false);
        }
      } catch {
        setMessagesAllowed(false);
      }

      // Load landlord profile (profile-wise identity for sends / groups)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const params = new URLSearchParams();
        if (user.id) params.set("userId", user.id);
        else if (user.email) params.set("email", user.email);
        const meRes = await fetch(`/api/workspace/me?${params.toString()}`);
        if (meRes.ok) {
          const meJson = await meRes.json();
          const fullName = meJson?.data?.fullName || user.user_metadata?.fullName || user.email?.split("@")[0] || "Property Manager";
          const nameParts = fullName.trim().split(/\s+/);
          const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
            : fullName.substring(0, 2).toUpperCase();
          setLandlordProfile({ id: meJson?.data?.profileId || user.id, name: fullName, initials: initials || "PM", email: meJson?.data?.email || user.email || undefined });
        } else {
          const fullName = user.user_metadata?.fullName || user.email?.split("@")[0] || "Property Manager";
          setLandlordProfile({ id: user.id, name: fullName, initials: getInitials(fullName), email: user.email || undefined });
        }
      }
    };
    initChat();
  }, []);

  // ─── Cache chat rooms with TanStack Query ─────────────────────────────────────────
  const { data: fetchedRooms = [], isLoading: loadingRooms } = useQuery({
    queryKey: ["rooms", chatWorkspaceId],
    enabled: !!chatWorkspaceId && messagesAllowed === true,
    queryFn: async () => {
      const res = await fetch(`/api/chat/rooms?workspaceId=${chatWorkspaceId}&userRole=landlord`);
      if (!res.ok) return [];
      const result = await res.json();
      if (!result.data || !Array.isArray(result.data)) return [];
      return result.data.map((r: any): ChatRoom => ({
        id: r.id,
        type: r.type,
        name: r.name,
        initials: r.initials || getInitials(r.name),
        color: r.color || "bg-purple-500",
        property: r.property || (r.tenant?.unit?.property?.name || "Property"),
        description: r.description,
        lastMessage: r.lastMessage || "No messages yet",
        lastTime: r.lastTime || "Just now",
        unreadCount: r.unreadCount || 0,
        email: r.tenant?.email || r.tenant?.profile?.email || r.email,
        phone: r.tenant?.phone || r.phone || "",
        unit: r.tenant?.unit?.unitNumber || r.unit || "Unit N/A",
        rentAmount: r.tenant?.monthlyRent ? `₹${Number(r.tenant.monthlyRent).toLocaleString("en-IN")}/mo` : undefined,
        rentStatus: r.tenant?.currentStatus === "Current" || r.tenant?.currentStatus === "Active" ? "Paid" : r.tenant ? "Due" : undefined,
        leaseEndDate: r.tenant?.leaseEnd ? new Date(r.tenant.leaseEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
        members: r.membersJson ? JSON.parse(r.membersJson) : undefined,
        messages: [], // loaded on demand via /api/chat/messages
      }));
    },
  });

  // Sync rooms state when query data changes
  useEffect(() => {
    if (fetchedRooms.length > 0) {
      setRooms((prev) => {
        // Preserve already-loaded message threads when rooms list refreshes
        const prevById = new Map(prev.map((r) => [r.id, r]));
        return fetchedRooms.map((r: ChatRoom) => {
          const existing = prevById.get(r.id);
          return existing?.messages?.length ? { ...r, messages: existing.messages } : r;
        });
      });
      if (!selectedRoomId) {
        setSelectedRoomId(fetchedRooms[0].id);
      }
    }
  }, [fetchedRooms]);

  // Load messages only for the selected room (latest 50)
  const { data: roomMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ["chat-messages", chatWorkspaceId, selectedRoomId],
    enabled: !!chatWorkspaceId && !!selectedRoomId && messagesAllowed === true,
    queryFn: async () => {
      const res = await fetch(
        `/api/chat/messages?roomId=${encodeURIComponent(selectedRoomId)}&workspaceId=${chatWorkspaceId}&limit=50`
      );
      if (!res.ok) return [];
      const json = await res.json();
      if (!Array.isArray(json.data)) return [];
      const meId = landlordProfile?.id;
      return json.data.map((m: any): ChatMessage => {
        const isMe =
          m.senderId === meId ||
          m.senderId === "owner" ||
          (m.isMe === true && (!meId || m.senderId === meId));
        return {
          id: m.id,
          senderId: m.senderId,
          senderName: isMe ? "You" : m.senderName,
          senderInitials: isMe ? (landlordProfile?.initials || "ME") : m.senderInitials,
          text: m.text,
          timestamp: new Date(m.createdAt),
          isMe,
        };
      });
    },
  });

  useEffect(() => {
    if (!selectedRoomId || !roomMessages) return;
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoomId ? { ...r, messages: roomMessages } : r
      )
    );
  }, [selectedRoomId, roomMessages]);



  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const groupRooms = filteredRooms.filter((r) => r.type === "group");
  const dmRooms = filteredRooms.filter((r) => r.type === "dm");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedRoomId, rooms]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !selectedRoom) return;

    const senderId = landlordProfile?.id || "owner";
    const senderName = landlordProfile?.name
      ? `${landlordProfile.name.split(" ")[0]} (You)`
      : "You";
    const senderInitials = landlordProfile?.initials || "ME";
    const workspaceId = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();

    const tempId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      senderId,
      senderName: "You",
      senderInitials,
      text,
      timestamp: new Date(),
      isMe: true,
    };

    // Optimistic UI update
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoomId
          ? { ...r, messages: [...r.messages, newMsg], lastMessage: text, lastTime: "Just now", unreadCount: 0 }
          : r
      )
    );
    setInputText("");

    // Persist message to database via API (workspace + profile scoped)
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          senderId,
          senderName,
          senderInitials,
          profileId: landlordProfile?.id,
          workspaceId: workspaceId ? Number(workspaceId) : undefined,
          text,
          isMe: true,
        }),
      });
    } catch (err) {
      console.error("Failed to save message via API:", err);
    }
  };

  const handleSelectRoom = (id: string) => {
    setSelectedRoomId(id);
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, unreadCount: 0 } : r)));
  };

  const handleStartDM = async (tenant: TenantResult) => {
    const workspaceId = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
    if (!workspaceId) return;

    const existingRoom = rooms.find(
      (r) => r.type === "dm" && (r.name === tenant.name || r.email === tenant.email)
    );
    if (existingRoom) {
      handleSelectRoom(existingRoom.id);
      setShowNewDMModal(false);
      return;
    }

    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: Number(workspaceId),
          type: "dm",
          name: tenant.name,
          initials: tenant.initials,
          color: tenant.color,
          tenantId: tenant.id,
          property: tenant.property,
          ownerProfileId: landlordProfile?.id,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const r = result.data;
        const newRoom: ChatRoom = {
          id: r.id,
          type: "dm",
          name: tenant.name,
          initials: tenant.initials,
          lastMessage: "Start a conversation...",
          lastTime: "Just now",
          unreadCount: 0,
          online: true,
          color: tenant.color,
          email: tenant.email,
          phone: tenant.phone,
          unit: tenant.unit,
          property: tenant.property,
          rentAmount: tenant.rentAmount,
          rentStatus: tenant.rentStatus,
          leaseEndDate: tenant.leaseEndDate,
          messages: [],
        };
        setRooms((prev) => [newRoom, ...prev]);
        setSelectedRoomId(newRoom.id);
      }
    } catch (err) {
      console.error("Error creating DM room via API:", err);
    }
    setShowNewDMModal(false);
  };

  const handleCreateGroup = async (groupName: string, selectedTenants: TenantResult[]) => {
    const workspaceId = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
    if (!workspaceId) return;

    const groupColors = ["bg-purple-500", "bg-indigo-500", "bg-orange-500", "bg-[#FF6B00]", "bg-teal-500", "bg-blue-600"];
    const randomColor = groupColors[rooms.length % groupColors.length];
    const initials = getInitials(groupName);

    const ownerName = landlordProfile?.name || "Property Manager";
    const ownerInitials = landlordProfile?.initials || "PM";
    const ownerId = landlordProfile?.id || "owner";

    const members: GroupMember[] = [
      {
        id: ownerId,
        name: `${ownerName} (You)`,
        initials: ownerInitials,
        role: "Property Manager",
        color: "bg-purple-600",
      },
      ...selectedTenants.map((t) => ({
        id: t.id,
        name: t.name,
        initials: t.initials,
        role: t.unit ? `Resident (${t.unit})` : "Resident",
        color: t.color,
      })),
    ];

    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: Number(workspaceId),
          type: "group",
          name: groupName,
          initials,
          color: randomColor,
          description: `Official channel for ${groupName} residents and team.`,
          members,
          ownerProfileId: ownerId,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const r = result.data;
        const newGroup: ChatRoom = {
          id: r.id,
          type: "group",
          name: groupName,
          initials,
          lastMessage: "Group created",
          lastTime: "Just now",
          unreadCount: 0,
          color: randomColor,
          description: `Official channel for ${groupName} residents and team.`,
          members,
          messages: [],
        };
        setRooms((prev) => [newGroup, ...prev]);
        setSelectedRoomId(newGroup.id);
      }
    } catch (err) {
      console.error("Error creating Group room via API:", err);
    }
    setShowNewGroupModal(false);
  };

  const handleConfirmDeleteChat = async () => {
    if (!selectedRoom) return;
    setIsDeleting(true);
    try {
      await fetch(
        `/api/chat/rooms?roomId=${selectedRoom.id}&workspaceId=${(await ensureActiveWorkspaceId()) || getActiveWorkspaceId()}`,
        {
          method: "DELETE",
        }
      );
      const remaining = rooms.filter((r) => r.id !== selectedRoom.id);
      setRooms(remaining);
      setShowInfoPanel(false);
      setShowDeleteModal(false);
      if (remaining.length > 0) {
        setSelectedRoomId(remaining[0].id);
      } else {
        setSelectedRoomId("");
      }
    } catch (err) {
      console.error("Error deleting chat room:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {messagesAllowed === null && (
        <div className="h-full flex items-center justify-center bg-white">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {messagesAllowed === false && (
        <div className="h-full flex items-center justify-center bg-[#F8FAFC] p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#FF6B00] to-amber-500 text-white flex items-center justify-center shadow-md">
              <Crown className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-100 text-[#FF6B00] font-extrabold text-[10px] uppercase tracking-wider rounded-full">
              <Lock className="w-3 h-3" />
              Pro Feature
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Messages is on Pro &amp; Pro Plus
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {MESSAGES_UPGRADE_MESSAGE}
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      {messagesAllowed === true && (
      <>
      {showNewDMModal && (
        <NewDMModal onClose={() => setShowNewDMModal(false)} onStartDM={handleStartDM} />
      )}

      {showNewGroupModal && (
        <NewGroupModal onClose={() => setShowNewGroupModal(false)} onCreateGroup={handleCreateGroup} />
      )}

      {showDeleteModal && selectedRoom && (
        <DeleteChatConfirmationModal
          roomName={selectedRoom.name}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDeleteChat}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      <div className="h-full flex bg-white font-sans overflow-hidden">
        {/* Sub-Sidebar */}
        <aside className="w-72 shrink-0 border-r border-slate-200 bg-[#F8FAFC] flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF6B00]" />
                Messages
              </h2>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {loadingRooms ? (
              <div className="space-y-3 px-3 py-2 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                      <div className="h-2.5 w-32 bg-slate-200/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Groups — header with + button */}
                <div>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Groups</span>
                    </div>
                    <button
                      onClick={() => setShowNewGroupModal(true)}
                      title="Create a new Group"
                      className="p-1 rounded-md text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {groupRooms.length > 0 ? (
                    groupRooms.map((room) => (
                      <RoomItem key={room.id} room={room} isActive={selectedRoomId === room.id} onSelect={() => handleSelectRoom(room.id)} />
                    ))
                  ) : (
                    <div className="px-4 py-2 text-[11px] text-slate-400 font-medium">
                      No group chats yet.
                    </div>
                  )}
                </div>

                {/* Direct Messages — header with + button */}
                <div className="mt-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Direct Messages</span>
                    </div>
                    <button
                      onClick={() => setShowNewDMModal(true)}
                      title="Start a new DM"
                      className="p-1 rounded-md text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {dmRooms.length > 0 ? (
                    dmRooms.map((room) => (
                      <RoomItem key={room.id} room={room} isActive={selectedRoomId === room.id} onSelect={() => handleSelectRoom(room.id)} />
                    ))
                  ) : (
                    <div className="px-4 py-3 text-[11px] text-slate-400 font-medium">
                      No direct messages yet.
                    </div>
                  )}
                </div>

                {filteredRooms.length === 0 && (
                  <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                    <MessageSquare className="w-8 h-8" />
                    <p className="text-xs font-medium">No conversations found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-hidden">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="h-14 shrink-0 border-b border-slate-200 bg-white px-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${selectedRoom.color} text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm`}>
                    {selectedRoom.type === "group" ? <Users className="w-4 h-4" /> : selectedRoom.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">{selectedRoom.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      {selectedRoom.type === "group"
                        ? `${selectedRoom.messages.length} messages`
                        : selectedRoom.online ? "🟢 Online" : "⚪ Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowInfoPanel((prev) => !prev)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      showInfoPanel
                        ? "text-[#FF6B00] bg-orange-50 font-bold border border-orange-200/60"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title="Conversation Details & Info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4 bg-[#F8FAFC]">
                {loadingMessages && selectedRoom.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : selectedRoom.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className={`w-14 h-14 rounded-2xl ${selectedRoom.color} text-white text-lg font-extrabold flex items-center justify-center shadow-sm`}>
                      {selectedRoom.initials}
                    </div>
                    <p className="text-sm font-bold text-slate-700">{selectedRoom.name}</p>
                    <p className="text-xs text-slate-400 font-medium">Send a message to start the conversation</p>
                  </div>
                ) : (
                  selectedRoom.messages.map((msg, idx) => {
                    const prevMsg = selectedRoom.messages[idx - 1];
                    const showSenderName = !msg.isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                    return (
                      <ChatMessageItem
                        key={msg.id}
                        msg={msg}
                        showSenderName={showSenderName}
                        roomColor={selectedRoom.color}
                        roomType={selectedRoom.type}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3.5">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#FF6B00] focus-within:border-[#FF6B00] focus-within:bg-white transition-all">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`Message ${selectedRoom.type === "group" ? "#" + selectedRoom.name : selectedRoom.name}...`}
                    className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-1.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-medium">Press Enter to send</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

        {/* Right Conversation Details Info Side Panel */}
        {showInfoPanel && selectedRoom && (
          <ConversationInfoPanel
            room={selectedRoom}
            onClose={() => setShowInfoPanel(false)}
            onOpenAddMember={() => setShowNewGroupModal(true)}
            onOpenDeleteModal={() => setShowDeleteModal(true)}
          />
        )}
      </div>
      </>
      )}
    </>
  );
}
