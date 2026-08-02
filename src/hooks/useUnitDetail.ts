"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

export type UnitDetailBundle = {
  property: {
    id: string;
    name: string;
    address: string;
    tag: string;
  };
  unitMeta: {
    unitNumber: string;
    rent: number;
    floorNumber: number;
    isOccupied: boolean;
    propertyName?: string;
  };
  occupants: any[];
  maintenanceLogs: any[];
  rentLedger: any[];
  tenantDocs: any[];
  roomHistory: any[];
};

export function useUnitDetail(propId: string | undefined, unitId: string | undefined) {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: ["unit-detail", propId, unitId, workspaceId],
    enabled: !!propId && !!unitId && !!workspaceId,
    queryFn: async (): Promise<UnitDetailBundle | null> => {
      const widAmp = `&wid=${workspaceId}`;
      const widQuery = `?wid=${workspaceId}`;

      const propRes = await fetch(`/api/properties/${propId}${widQuery}`);
      let property = {
        id: propId!,
        name: "Property",
        address: "Property Location",
        tag: "Property",
      };
      if (propRes.ok) {
        const propJson = await propRes.json();
        if (propJson.data) {
          property = {
            id: propJson.data.id,
            name: propJson.data.name,
            address: propJson.data.address || "Property Location",
            tag: propJson.data.tag || "Property",
          };
        }
      }

      const res = await fetch(
        `/api/units/${encodeURIComponent(unitId!)}?propertyId=${encodeURIComponent(propId!)}${widAmp}`
      );
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.data) return null;

      const u = json.data;
      if (u.property) {
        property = {
          id: u.property.id || propId!,
          name: u.property.name || "Property",
          address: u.property.address || "Property Location",
          tag: u.property.tag || "Property",
        };
      }

      let occupants: any[] =
        u.tenants && u.tenants.length > 0
          ? u.tenants.map((t: any, idx: number) => ({
              id: t.id,
              name: t.name,
              bedSlot: t.bedSlot || `Bed Slot ${String.fromCharCode(65 + idx)}`,
              individualRent: t.monthlyRent || u.rent || 0,
              phone: t.phone || "+1 (555) 000-0000",
              email: t.email || "resident@rentawas.com",
              moveIn: t.leaseStart
                ? new Date(t.leaseStart).toISOString().split("T")[0]
                : "2026-08-01",
              leaseEnd: t.leaseEnd
                ? new Date(t.leaseEnd).toISOString().split("T")[0]
                : "2027-07-31",
              paymentStatus: "Auto Paid (ACH)",
            }))
          : [];

      const [occRes, maintRes, billsRes, docsRes, histRes] = await Promise.all([
        fetch(
          `/api/units/${encodeURIComponent(unitId!)}/occupants?propertyId=${encodeURIComponent(propId!)}${widAmp}`
        ),
        fetch(
          `/api/units/${encodeURIComponent(unitId!)}/maintenance?propertyId=${encodeURIComponent(propId!)}${widAmp}`
        ),
        fetch(
          `/api/units/${encodeURIComponent(unitId!)}/rents?propertyId=${encodeURIComponent(propId!)}${widAmp}`
        ),
        fetch(
          `/api/units/${encodeURIComponent(unitId!)}/documents?propertyId=${encodeURIComponent(propId!)}${widAmp}`
        ),
        fetch(
          `/api/units/${encodeURIComponent(unitId!)}/history?propertyId=${encodeURIComponent(propId!)}${widAmp}`
        ),
      ]);

      if (occRes.ok) {
        const occJson = await occRes.json();
        if (Array.isArray(occJson.data) && occJson.data.length > 0) {
          occupants = occJson.data;
        }
      }

      const maintenanceLogs = maintRes.ok ? (await maintRes.json()).data || [] : [];
      const rentLedger = billsRes.ok ? (await billsRes.json()).data || [] : [];
      const tenantDocs = docsRes.ok ? (await docsRes.json()).data || [] : [];
      const roomHistory = histRes.ok ? (await histRes.json()).data || [] : [];

      return {
        property,
        unitMeta: {
          unitNumber: u.unitNumber,
          rent: u.rent || 0,
          floorNumber: u.floorNumber || 1,
          isOccupied: u.isOccupied || false,
          propertyName: u.property?.name,
        },
        occupants,
        maintenanceLogs,
        rentLedger,
        tenantDocs,
        roomHistory,
      };
    },
  });

  return {
    workspaceId,
    ...query,
    isLoading: !workspaceId || query.isLoading,
  };
}
