"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, Users, DollarSign, MapPin, CheckCircle2, ChevronRight } from "lucide-react";

export default function PropertiesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropName, setNewPropName] = useState("");
  const [newPropUnits, setNewPropUnits] = useState("10");

  const propertyList = [
    {
      id: "PROP-1",
      name: "The Regent - Wing A",
      address: "1420 5th Ave, Seattle, WA 98101",
      units: 24,
      occupied: 23,
      monthlyYield: "$72,500",
      status: "96% Occupied",
      tag: "Residential Tower",
    },
    {
      id: "PROP-2",
      name: "Downtown Horizon Suites",
      address: "800 Bellevue Way NE, Bellevue, WA 98004",
      units: 18,
      occupied: 17,
      monthlyYield: "$54,000",
      status: "94% Occupied",
      tag: "Luxury Apartments",
    },
    {
      id: "PROP-3",
      name: "Oakwood Executive Residency",
      address: "2100 Westlake Ave, Seattle, WA 98121",
      units: 12,
      occupied: 11,
      monthlyYield: "$32,000",
      status: "91% Occupied",
      tag: "Executive Suites",
    },
    {
      id: "PROP-4",
      name: "Skyline Manor",
      address: "1100 Mercer St, Seattle, WA 98109",
      units: 8,
      occupied: 7,
      monthlyYield: "$18,500",
      status: "88% Occupied",
      tag: "Boutique Housing",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Properties & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nested hierarchical views of buildings, floors, and individual unit availability.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {propertyList.map((prop) => (
          <div
            key={prop.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 uppercase tracking-wider">
                  {prop.tag}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{prop.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{prop.address}</span>
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {prop.status}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Total Units</span>
                <span className="text-sm font-black text-slate-900">{prop.units}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Occupied</span>
                <span className="text-sm font-black text-emerald-600">{prop.occupied} Units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Monthly Yield</span>
                <span className="text-sm font-black text-slate-900">{prop.monthlyYield}</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => alert(`Managing unit layout for ${prop.name}`)}
                className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
              >
                <span>View Floor Plans & Units</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => alert(`Editing property configuration for ${prop.name}`)}
                className="px-3 py-1.5 text-xs font-bold text-[#FF6B00] border border-orange-200 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Add New Property to Portfolio</h3>
            <p className="text-xs text-slate-500">Enter details to generate hierarchical unit mapping.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Property Name</label>
                <input
                  type="text"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  placeholder="e.g. Cedar Heights Apartments"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Total Unit Count</label>
                <input
                  type="number"
                  value={newPropUnits}
                  onChange={(e) => setNewPropUnits(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Property ${newPropName || "New Property"} added successfully!`);
                  setShowAddModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] rounded-xl shadow-xs uppercase tracking-wider"
              >
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
