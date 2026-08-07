"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { formatDisplayDate } from "@/lib/dates";

export type PropertyDetailMapped = {
  property: {
    id: string;
    name: string;
    address: string;
    floors: number;
    units: number;
    occupied: number;
    rawMonthlyYield: number;
    monthlyYield: string;
    status: string;
    tag: string;
  };
  floorsCount: number;
  floorUnitsMap: Record<number, any[]>;
  raw: any;
};

function mapPropertyDetail(apiProp: any): PropertyDetailMapped {
  const totalUnitsCount = apiProp.units ? apiProp.units.length : apiProp.totalUnits || 0;
  const occupiedCount = apiProp.units
    ? apiProp.units.filter((u: any) => u.isOccupied).length
    : 0;
  const totalYield = apiProp.units
    ? apiProp.units
        .filter((u: any) => u.isOccupied)
        .reduce((acc: number, u: any) => acc + (u.rent || 0), 0)
    : 0;
  const occPercent =
    totalUnitsCount > 0 ? Math.round((occupiedCount / totalUnitsCount) * 100) : 0;

  const apiFloorMap: Record<number, any[]> = {};
  if (apiProp.units && apiProp.units.length > 0) {
    apiProp.units.forEach((u: any) => {
      const fl = u.floorNumber || 1;
      if (!apiFloorMap[fl]) apiFloorMap[fl] = [];
      const primaryTenant = u.tenants && u.tenants.length > 0 ? u.tenants[0] : null;
      apiFloorMap[fl].push({
        id: u.id,
        unitNo: u.unitNumber,
        type: u.type || "Standard Suite",
        sqft: u.sqft || "850 sq ft",
        rooms: u.rooms || "2 Bedrooms • 2 Baths • Living • Kitchen",
        rawRent: u.rent || 0,
        rent: `$${(u.rent || 0).toLocaleString()}/mo`,
        status: u.isOccupied ? "Occupied" : "Vacant",
        tenant: primaryTenant
          ? {
              name: primaryTenant.fullName || primaryTenant.name || "Resident",
              contact: "Primary Resident",
              phone: primaryTenant.phone || "+1 (555) 000-0000",
              email: primaryTenant.email || "resident@rentawas.com",
              moveIn: formatDisplayDate(primaryTenant.leaseStart),
              health: "Active Tenant",
            }
          : null,
      });
    });
  }

  return {
    property: {
      id: apiProp.id,
      name: apiProp.name,
      address: apiProp.address,
      floors: apiProp.floors || 1,
      units: totalUnitsCount,
      occupied: occupiedCount,
      rawMonthlyYield: totalYield,
      monthlyYield: `$${totalYield.toLocaleString()}`,
      status: `${occPercent}% Occupied`,
      tag: apiProp.category || "Property",
    },
    floorsCount: apiProp.floors || 1,
    floorUnitsMap: apiFloorMap,
    raw: apiProp,
  };
}

export function usePropertyDetail(propId: string | undefined) {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: ["property", propId, workspaceId],
    enabled: !!propId && !!workspaceId,
    queryFn: async (): Promise<PropertyDetailMapped | null> => {
      const res = await fetch(`/api/properties/${propId}?wid=${workspaceId}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success || !json.data) return null;
      return mapPropertyDetail(json.data);
    },
  });

  return {
    workspaceId,
    ...query,
    isLoading: !workspaceId || query.isLoading,
  };
}
