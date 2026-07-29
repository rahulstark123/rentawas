import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rentawas.com";

  const routes = [
    "",
    "/find-property",
    "/login",
    "/onboarding",
    "/tenant/payments",
    "/dashboard",
    "/dashboard/properties",
    "/dashboard/tenants",
    "/dashboard/units",
    "/dashboard/finance",
    "/dashboard/maintenance",
    "/dashboard/settings",
    "/dashboard/support",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/find-property" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/find-property" ? 0.9 : 0.8,
  }));
}
