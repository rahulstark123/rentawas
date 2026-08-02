"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  Users,
  Send,
  Hash,
  Info,
  X,
  Loader2,
  ShieldCheck,
  Trash2,
  Plus,
  UserPlus,
} from "lucide-react";
import { useTenantMe } from "@/hooks/useTenantMe";

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
  color: string;
  property?: string;
  description?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online?: boolean;
  messages: ChatMessage[];
}

interface TeamContact {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
  online: boolean;
  isOwner?: boolean;
}

interface TenantContext {
  id: string;
  name: string;
  email: string;
  initials: string;
  workspaceId: number | null;
  profileId: string | null;
  propertyName: string;
  unitNumber: string;
  owner: TeamContact | null;
  teamContacts: TeamContact[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name.trim().substring(0, 2) || "TN").toUpperCase();
}

function formatTime(d: Date): string {
  try {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

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
        <div
          className={`w-8 h-8 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-sm ${
            roomType === "group" ? "bg-purple-600" : roomColor
          }`}
        >
          {msg.senderInitials}
        </div>
      )}
      <div
        className={`max-w-[70%] sm:max-w-[65%] space-y-1 flex flex-col ${
          msg.isMe ? "items-end" : "items-start"
        }`}
      >
        {showSenderName && (
          <span className="text-[10px] font-bold text-slate-400 px-1">{msg.senderName}</span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap break-all ${
            msg.isMe
              ? "bg-purple-600 text-white rounded-tr-sm"
              : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
          } ${!isExpanded && isLong ? "line-clamp-5 overflow-hidden" : ""}`}
        >
          {msg.text}
        </div>

        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[10px] font-extrabold text-purple-600 hover:underline cursor-pointer px-1 mt-0.5"
          >
            {isExpanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}

        <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

function RoomItem({
  room,
  isActive,
  onSelect,
}: {
  room: ChatRoom;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left ${
        isActive
          ? "bg-purple-50/80 border border-purple-200/80 shadow-xs"
          : "hover:bg-slate-100/80 border border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`w-9 h-9 rounded-xl ${room.color} text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm`}
        >
          {room.type === "group" ? <Users className="w-4 h-4" /> : room.initials}
        </div>
        {room.type === "dm" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold truncate ${
              isActive ? "text-purple-700" : "text-slate-800"
            }`}
          >
            {room.name}
          </span>
          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{room.lastTime}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] text-slate-400 truncate font-medium">{room.lastMessage}</span>
          {room.unreadCount > 0 && (
            <span className="shrink-0 ml-1.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function TenantMessagesPage() {
  const { data: tenantMe, isLoading: meLoading } = useTenantMe();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartingDm, setIsStartingDm] = useState(false);
  const [tenantCtx, setTenantCtx] = useState<TenantContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const teamContacts = tenantCtx?.teamContacts?.length
    ? tenantCtx.teamContacts
    : tenantCtx?.owner
      ? [{ ...tenantCtx.owner, isOwner: true }]
      : [];

  const ownerName = tenantCtx?.owner?.name || "Property Owner";
  const ownerRole = tenantCtx?.owner?.role || "Property Owner & Landlord";

  const mapRooms = (data: any[], ctx: TenantContext | null): ChatRoom[] => {
    const oName = ctx?.owner?.name || "Property Owner";
    const oInitials = ctx?.owner?.initials || "PM";
    const oRole = ctx?.owner?.role || "Property Owner & Landlord";
    const tName = ctx?.name || "Resident";
    const tInitials = ctx?.initials || "TN";
    const propertyLabel = ctx ? `${ctx.propertyName} — ${ctx.unitNumber}` : undefined;

    return data.map((r: any) => {
      const isDm = r.type === "dm";
      const dmName = r.displayName || r.ownerName || `${oName} (${oRole})`;
      return {
        id: r.id,
        type: r.type,
        name: isDm ? dmName : r.name,
        initials: isDm ? r.displayInitials || oInitials : r.initials || "PM",
        color: isDm ? r.displayColor || "bg-[#FF6B00]" : r.color || "bg-purple-600",
        property: r.property || propertyLabel,
        description: r.description,
        lastMessage: r.lastMessage || "No messages yet",
        lastTime: r.lastTime || "Just now",
        unreadCount: r.unreadCount || 0,
        online: true,
        messages: (r.messages || []).map((m: any) => {
          const isFromLandlord =
            m.senderId === "owner" ||
            m.senderId === ctx?.owner?.id ||
            m.isMe === true;
          const isFromTenant =
            m.senderId === "tenant" ||
            m.senderId === ctx?.id ||
            m.senderId === ctx?.profileId;
          const mine = isFromTenant || (!isFromLandlord && m.isMe === false);
          return {
            id: m.id,
            senderId: m.senderId,
            senderName: mine
              ? `${tName} (You)`
              : isFromLandlord
                ? `${oName} (${oRole})`
                : m.senderName || oName,
            senderInitials: mine
              ? tInitials
              : isFromLandlord
                ? oInitials
                : m.senderInitials || oInitials,
            text: m.text,
            timestamp: new Date(m.createdAt),
            isMe: !!mine,
          };
        }),
      };
    });
  };

  const handleStartDm = async (teammate: TeamContact) => {
    if (!tenantCtx?.workspaceId || !tenantCtx.id || tenantCtx.id === "demo-tenant-id") {
      setShowNewDmModal(false);
      return;
    }

    const existing = rooms.find(
      (r) =>
        r.type === "dm" &&
        (r.name.includes(teammate.name) || r.name.includes(ownerName))
    );
    if (existing) {
      setSelectedRoomId(existing.id);
      setShowNewDmModal(false);
      return;
    }

    setIsStartingDm(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: tenantCtx.workspaceId,
          type: "dm",
          name: tenantCtx.name,
          initials: tenantCtx.initials,
          color: teammate.color || "bg-[#FF6B00]",
          tenantId: tenantCtx.id,
          property: `${tenantCtx.propertyName} — ${tenantCtx.unitNumber}`,
          description: `Direct private chat with ${teammate.name}, ${teammate.role}`,
          ownerProfileId: tenantCtx.owner?.id,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const r = result.data;
        const newRoom: ChatRoom = {
          id: r.id,
          type: "dm",
          name: `${teammate.name} (${teammate.role})`,
          initials: teammate.initials,
          color: teammate.color,
          property: `${tenantCtx.propertyName} — ${tenantCtx.unitNumber}`,
          description: `Direct private chat with ${teammate.name}, ${teammate.role}`,
          lastMessage: r.lastMessage || "Start a conversation...",
          lastTime: r.lastTime || "Just now",
          unreadCount: 0,
          online: teammate.online,
          messages: (r.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            senderInitials: m.senderInitials,
            text: m.text,
            timestamp: new Date(m.createdAt),
            isMe:
              m.senderId === "tenant" ||
              m.senderId === tenantCtx.id ||
              m.senderId === tenantCtx.profileId,
          })),
        };

        setRooms((prev) => {
          if (prev.some((room) => room.id === newRoom.id)) {
            return prev.map((room) =>
              room.id === newRoom.id ? { ...room, name: newRoom.name } : room
            );
          }
          return [newRoom, ...prev];
        });
        setSelectedRoomId(newRoom.id);
      }
    } catch (err) {
      console.error("Error starting DM with property team:", err);
    } finally {
      setIsStartingDm(false);
      setShowNewDmModal(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleConfirmDeleteChat = async () => {
    if (!selectedRoom) return;
    setIsDeleting(true);
    try {
      const wid = tenantCtx?.workspaceId;
      const qs = wid
        ? `roomId=${selectedRoom.id}&workspaceId=${wid}`
        : `roomId=${selectedRoom.id}`;
      await fetch(`/api/chat/rooms?${qs}`, { method: "DELETE" });
      const remaining = rooms.filter((r) => r.id !== selectedRoom.id);
      setRooms(remaining);
      setShowInfoDrawer(false);
      setShowDeleteModal(false);
      if (remaining.length > 0) {
        setSelectedRoomId(remaining[0].id);
      } else {
        setSelectedRoomId("");
      }
    } catch (err) {
      console.error("Error deleting tenant chat room:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!tenantMe) return;
    const d = tenantMe;
    setTenantCtx({
      id: d.id,
      name: d.name || "Resident",
      email: d.email || "",
      initials: getInitials(d.name || "Resident"),
      workspaceId: d.workspaceId != null ? Number(d.workspaceId) : null,
      profileId: d.profileId || null,
      propertyName: d.propertyName || "Property",
      unitNumber: d.unitNumber || "Unit",
      owner: d.owner || null,
      teamContacts: Array.isArray(d.teamContacts) ? d.teamContacts : [],
    });
  }, [tenantMe]);

  const roomsEnabled =
    !!tenantCtx?.workspaceId &&
    !!tenantCtx?.id &&
    tenantCtx.id !== "demo-tenant-id";

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ["tenant-chat-rooms", tenantCtx?.workspaceId, tenantCtx?.id, tenantCtx?.profileId],
    enabled: roomsEnabled,
    queryFn: async () => {
      const params = new URLSearchParams({
        workspaceId: String(tenantCtx!.workspaceId),
        userRole: "tenant",
        tenantId: tenantCtx!.id,
      });
      if (tenantCtx!.profileId) params.set("profileId", tenantCtx!.profileId);

      const res = await fetch(`/api/chat/rooms?${params.toString()}`);
      if (!res.ok) return [];
      const result = await res.json();
      return Array.isArray(result.data) ? result.data : [];
    },
  });

  useEffect(() => {
    if (!roomsEnabled) {
      if (!meLoading) setRooms([]);
      return;
    }
    if (roomsData && Array.isArray(roomsData) && roomsData.length > 0) {
      const loadedRooms = mapRooms(roomsData, tenantCtx);
      setRooms(loadedRooms);
      setSelectedRoomId((prev) => prev || loadedRooms[0].id);
    } else if (!roomsLoading) {
      setRooms([]);
    }
  }, [roomsData, roomsLoading, roomsEnabled, tenantCtx, meLoading]);

  const isLoading = meLoading || (roomsEnabled && roomsLoading);

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const groupRooms = filteredRooms.filter((r) => r.type === "group");
  const dmRooms = filteredRooms.filter((r) => r.type === "dm");
  const filteredContacts = teamContacts.filter(
    (m) =>
      m.name.toLowerCase().includes(dmSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(dmSearch.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedRoomId, rooms]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !selectedRoom || !tenantCtx) return;

    const senderId = tenantCtx.id || tenantCtx.profileId || "tenant";
    const senderName = `${tenantCtx.name} (Resident)`;
    const senderInitials = tenantCtx.initials;

    const tempId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      senderId,
      senderName: `${tenantCtx.name} (You)`,
      senderInitials,
      text,
      timestamp: new Date(),
      isMe: true,
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoom.id) {
          return {
            ...r,
            lastMessage: text,
            lastTime: "Just now",
            messages: [...r.messages, newMsg],
          };
        }
        return r;
      })
    );
    setInputText("");

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          senderId,
          senderName,
          senderInitials,
          profileId: tenantCtx.profileId,
          workspaceId: tenantCtx.workspaceId || undefined,
          text,
          isMe: false,
        }),
      });
    } catch (err) {
      console.error("Error sending resident chat message:", err);
    }
  };

  return (
    <div className="h-full flex-1 flex bg-white font-sans overflow-hidden">
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-[#F8FAFC] flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Resident Messages
            </h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3 text-purple-600" />
                Building Channels
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-2 px-1 py-1 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                      <div className="h-2.5 w-32 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              groupRooms.map((room) => (
                <RoomItem
                  key={room.id}
                  room={room}
                  isActive={selectedRoomId === room.id}
                  onSelect={() => setSelectedRoomId(room.id)}
                />
              ))
            )}
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-500" />
                Property Owner & Landlord
              </span>
              <button
                type="button"
                onClick={() => setShowNewDmModal(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-100/80 transition-all cursor-pointer flex items-center justify-center"
                title="Start DM with Landlord & Teammates"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>
            {dmRooms.map((room) => (
              <RoomItem
                key={room.id}
                room={room}
                isActive={selectedRoomId === room.id}
                onSelect={() => setSelectedRoomId(room.id)}
              />
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-hidden">
        {selectedRoom ? (
          <>
            <div className="h-14 shrink-0 border-b border-slate-200 bg-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${selectedRoom.color} text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm`}
                >
                  {selectedRoom.type === "group" ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    selectedRoom.initials
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none">{selectedRoom.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {selectedRoom.type === "group"
                      ? "Building Community Channel"
                      : "Official Landlord Direct Chat"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoDrawer((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  showInfoDrawer
                    ? "text-purple-600 bg-purple-50 font-bold border border-purple-200"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Channel Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4 bg-[#F8FAFC]">
              {selectedRoom.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div
                    className={`w-14 h-14 rounded-2xl ${selectedRoom.color} text-white text-lg font-extrabold flex items-center justify-center shadow-sm`}
                  >
                    {selectedRoom.initials}
                  </div>
                  <p className="text-sm font-bold text-slate-700">{selectedRoom.name}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    Send a message to start conversation
                  </p>
                </div>
              ) : (
                selectedRoom.messages.map((msg, idx) => {
                  const prevMsg = selectedRoom.messages[idx - 1];
                  const showSenderName =
                    !msg.isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
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

            <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3.5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-purple-600 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Message ${
                    selectedRoom.type === "group"
                      ? "#" + selectedRoom.name
                      : selectedRoom.name
                  }...`}
                  className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-medium">Press Enter to send</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 p-6">
            {isLoading ? (
              <div className="w-full max-w-md space-y-4 animate-pulse">
                <div className="flex justify-start">
                  <div className="h-12 w-48 bg-slate-100 rounded-2xl rounded-bl-md" />
                </div>
                <div className="flex justify-end">
                  <div className="h-10 w-40 bg-slate-200 rounded-2xl rounded-br-md" />
                </div>
                <div className="flex justify-start">
                  <div className="h-14 w-56 bg-slate-100 rounded-2xl rounded-bl-md" />
                </div>
                <div className="flex justify-end">
                  <div className="h-10 w-32 bg-slate-200 rounded-2xl rounded-br-md" />
                </div>
              </div>
            ) : (
              <>
                <MessageSquare className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">
                  Select a channel to start messaging
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewDmModal(true)}
                  className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Start conversation with {ownerName}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showInfoDrawer && selectedRoom && (
        <aside className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-600" />
              Channel Details
            </h3>
            <button
              onClick={() => setShowInfoDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-6">
            <div className="text-center space-y-2">
              <div
                className={`w-14 h-14 rounded-2xl ${selectedRoom.color} text-white font-black text-base flex items-center justify-center mx-auto shadow-md`}
              >
                {selectedRoom.type === "group" ? (
                  <Users className="w-7 h-7" />
                ) : (
                  selectedRoom.initials
                )}
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">{selectedRoom.name}</h4>
              <p className="text-xs text-slate-500 font-medium">{selectedRoom.property}</p>
            </div>

            <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                Verified Resident Channel
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedRoom.description ||
                  `Official direct communication channel with ${ownerName} (${ownerRole}).`}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100/80 border border-red-200/80 text-red-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Delete Conversation</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {showDeleteModal && selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Delete Conversation?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-slate-800">{selectedRoom.name}</strong>? All message
                history will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChat}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewDmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Start Direct Message</h3>
                  <p className="text-xs text-slate-500">
                    Connect with Landlord & Property Team Mates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDmModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={dmSearch}
                onChange={(e) => setDmSearch(e.target.value)}
                placeholder="Search teammates by name or role..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {filteredContacts.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <UserPlus className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">
                    {tenantCtx?.workspaceId
                      ? "No property contacts found yet."
                      : "Your lease workspace could not be resolved."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    The property owner will appear here once your tenancy is linked.
                  </p>
                </div>
              ) : (
                filteredContacts.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    disabled={isStartingDm}
                    onClick={() => handleStartDm(member)}
                    className="w-full p-3 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all flex items-center justify-between text-left group cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div
                          className={`w-10 h-10 rounded-xl ${member.color} text-white text-xs font-black flex items-center justify-center shadow-xs`}
                        >
                          {member.initials}
                        </div>
                        {member.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                          {member.name}
                          {member.isOwner && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[9px] font-black uppercase tracking-wide border border-orange-100">
                              Owner
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 group-hover:bg-purple-600 group-hover:text-white text-slate-700 text-[10px] font-extrabold transition-all flex items-center gap-1 shrink-0">
                      {isStartingDm ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      <span>Start DM</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
