"use client";

import { Megaphone, Calendar, Bell } from "lucide-react";

export default function TenantNoticesPage() {
  const notices = [
    {
      id: 1,
      title: "Scheduled Elevator Maintenance",
      date: "July 24, 2026",
      desc: "Elevator 2 will undergo routine servicing on Saturday, July 27, between 10:00 AM – 01:00 PM. Elevator 1 will remain fully operational.",
      tag: "Maintenance",
    },
    {
      id: 2,
      title: "Rooftop Terrace Summer Social Event",
      date: "July 20, 2026",
      desc: "Join fellow residents on the 12th-floor rooftop lounge for complimentary refreshments on August 5 at 06:00 PM.",
      tag: "Community",
    },
    {
      id: 3,
      title: "Updated Guest Parking Rules",
      date: "July 10, 2026",
      desc: "Guest parking passes can now be registered online via the Resident Portal for up to 72 consecutive hours.",
      tag: "Policy",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Building Notices & Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official community announcements from building management.
        </p>
      </div>

      {/* Notices Stream */}
      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 uppercase">
                {n.tag}
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{n.date}</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
