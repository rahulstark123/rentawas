import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// 1. Bespoke Smart Inventory (Duotone Isometric Building Stack)
export function IconInventory({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M4 11h16" strokeOpacity="0.4" />
      <path d="M4 16h16" strokeOpacity="0.4" />
      <path d="M9 21v-5a1 1 0 011-1h4a1 1 0 011 1v5" />
      <rect x="8" y="7" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="14" y="7" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="8" y="12" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="14" y="12" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

// 2. Bespoke AI Lease Architect (Legal Contract Scroll + Neural Matrix Node)
export function IconLeaseAI({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8" strokeOpacity="0.5" />
      <path d="M8 17h5" strokeOpacity="0.5" />
      <circle cx="17" cy="17" r="2.5" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
      <path d="M17 14.5v-1" strokeOpacity="0.7" />
      <path d="M17 20.5v-1" strokeOpacity="0.7" />
    </svg>
  );
}

// 3. Bespoke Maintenance (Precision Wrench + Caliper Indicator)
export function IconMaintenance({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

// 4. Bespoke Tenant Health (Verified Shield Profile)
export function IconTenantHealth({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M8 16.5c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" />
    </svg>
  );
}

// 5. Bespoke Autopilot Rent (Recurring Smart Wallet Flow)
export function IconAutopilotRent({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <line x1="2" y1="10" x2="22" y2="10" strokeOpacity="0.4" />
      <path d="M6 15h4" strokeOpacity="0.6" />
      <path d="M16 14.5l2 2-2 2" strokeWidth="1.5" />
      <circle cx="16" cy="16.5" r="3.5" strokeOpacity="0.3" />
    </svg>
  );
}

// 6. Bespoke One-Tap Payments (Contactless Card & NFC Arcs)
export function IconOneTapPayments({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M7 11h4" />
      <path d="M7 14h2" strokeOpacity="0.5" />
      <path d="M15 11.5a2.5 2.5 0 010 3.5" strokeWidth="1.5" />
      <path d="M17.5 9.5a5 5 0 010 7.5" strokeWidth="1.5" />
    </svg>
  );
}

// 7. Bespoke Smart Announcements (Broadcast Beacon Geo-Pin)
export function IconSmartAnnouncements({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 8. Bespoke Secure Cloud Storage
export function IconCloudStorage({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M17.5 19A5.5 5.5 0 0018 8h-1.26A8 8 0 103 16.3" />
      <path d="M12 12v6" />
      <path d="M9 15l3-3 3 3" />
    </svg>
  );
}

// 9. Bespoke Mobile Friendly
export function IconMobileDevice({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <path d="M12 18h.01" strokeWidth="2" />
    </svg>
  );
}

// 10. Bespoke Bank-grade Security
export function IconBankSecurity({ className = "w-6 h-6", size, ...props }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
