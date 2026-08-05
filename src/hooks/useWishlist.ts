"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import type { MarketplacePropertyItem } from "@/lib/marketplace";

const WISHLIST_QUERY_KEY = ["wishlist"] as const;
const LEGACY_STORAGE_KEY = "rentawas_wishlist_items";

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function fetchWishlist(): Promise<{
  items: MarketplacePropertyItem[];
  likedIds: Record<string, boolean>;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/wishlist", { headers });
  if (res.status === 401) {
    return { items: [], likedIds: {} };
  }
  if (!res.ok) {
    throw new Error("Failed to fetch wishlist");
  }
  const json = await res.json();
  return json.data ?? { items: [], likedIds: {} };
}

async function migrateLegacyWishlist(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    const headers = await getAuthHeaders();
    for (const item of parsed) {
      if (!item?.id) continue;
      await fetch("/api/wishlist", {
        method: "POST",
        headers,
        body: JSON.stringify({ listingId: item.id }),
      });
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    console.warn("Wishlist migration from localStorage failed:", e);
  }
}

export function useWishlist(enabled = true) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    enabled,
    queryFn: async () => {
      await migrateLegacyWishlist();
      return fetchWishlist();
    },
    staleTime: 30_000,
  });

  const likedProperties = data?.likedIds ?? {};
  const wishlistItems = data?.items ?? [];

  const setLikedOptimistic = useCallback(
    (listingId: string, liked: boolean) => {
      queryClient.setQueryData<{
        items: MarketplacePropertyItem[];
        likedIds: Record<string, boolean>;
      }>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return old;
        const likedIds = { ...old.likedIds };
        if (liked) {
          likedIds[listingId] = true;
        } else {
          delete likedIds[listingId];
        }
        const items = liked
          ? old.items
          : old.items.filter((item) => item.id !== listingId);
        return { items, likedIds };
      });
    },
    [queryClient]
  );

  const addToWishlist = useCallback(
    async (property: MarketplacePropertyItem) => {
      setLikedOptimistic(property.id, true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers,
          body: JSON.stringify({ listingId: property.id }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to save");
        }
        toast(`Saved "${property.title}" to your wishlist!`, "success");
        await queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
        return true;
      } catch (err) {
        setLikedOptimistic(property.id, false);
        toast("Failed to save to wishlist", "error");
        return false;
      }
    },
    [queryClient, setLikedOptimistic, toast]
  );

  const removeFromWishlist = useCallback(
    async (listingId: string, title?: string) => {
      setLikedOptimistic(listingId, false);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(
          `/api/wishlist?listingId=${encodeURIComponent(listingId)}`,
          { method: "DELETE", headers }
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to remove");
        }
        toast(
          title ? `Removed "${title}" from your wishlist` : "Removed from wishlist",
          "info"
        );
        await queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
        return true;
      } catch (err) {
        setLikedOptimistic(listingId, true);
        toast("Failed to update wishlist", "error");
        return false;
      }
    },
    [queryClient, setLikedOptimistic, toast]
  );

  const toggleWishlist = useCallback(
    async (property: MarketplacePropertyItem) => {
      if (likedProperties[property.id]) {
        return removeFromWishlist(property.id, property.title);
      }
      return addToWishlist(property);
    },
    [addToWishlist, likedProperties, removeFromWishlist]
  );

  return {
    wishlistItems,
    likedProperties,
    isLoading,
    refetch,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };
}
