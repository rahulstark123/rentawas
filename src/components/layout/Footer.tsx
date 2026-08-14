import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B132B] text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={72}
                height={72}
                className="h-10 sm:h-[44px] w-auto object-contain rounded-md group-hover:opacity-90 transition-opacity"
              />
              <span 
                className="text-3xl font-extrabold tracking-tight font-cormorant"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                <span className="text-white" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>Rent</span>
                <span className="text-[#FF6B00]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>Awas</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm mt-4 max-w-sm leading-relaxed font-sans">
              The ultimate mission control for rental ecosystems. Automate rent collection,
              streamline maintenance, and maximize yield with precision.
            </p>

            <div className="mt-5 space-y-3 text-xs font-sans text-slate-300">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 max-w-sm">
                <p className="text-white font-bold text-xs">A product of ANSH Apps</p>
                <div className="text-[11px] text-slate-300 space-y-1 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Udyam Registration Number</span>
                    <span className="font-mono text-slate-200 font-semibold">UDYAM-BR-23-0127857</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">GSTIN</span>
                    <span className="font-mono text-slate-200 font-semibold">10DIUPR1358M1ZP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1 font-medium">
                <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <a href="mailto:hello.rentawas@anshapps.com" className="hover:text-[#FF6B00] transition-colors font-mono">
                  hello.rentawas@anshapps.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <a href="tel:+919625727372" className="hover:text-[#FF6B00] transition-colors font-mono">
                  +91 96257 27372
                </a>
              </div>
            </div>
          </div>

          {/* Nav Links Col 1 */}
          <div className="md:col-span-2 font-sans">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link href="#platform" className="hover:text-white transition-colors">
                  Platform
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-white transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Links Col 2 */}
          <div className="md:col-span-2 font-sans">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link href="/about" className="hover:text-[#FF6B00] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FF6B00] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#FF6B00] transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Links Col 3 */}
          <div className="md:col-span-3 font-sans">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-[#FF6B00] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FF6B00] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4 font-sans">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} RentAwas. A product of ANSH Apps. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 font-medium">
              Udyam Registration Number: <span className="font-mono text-slate-300">UDYAM-BR-23-0127857</span> &nbsp;|&nbsp; GSTIN: <span className="font-mono text-slate-300">10DIUPR1358M1ZP</span>
            </p>
          </div>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Engineered for high-performance operations.</span>
            <span className="text-slate-600">•</span>
            <span>
              Powered by{" "}
              <a
                href="https://anshapps.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF6B00] font-bold underline underline-offset-2 transition-colors cursor-pointer"
              >
                ANSH Apps
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
