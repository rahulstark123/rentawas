import Link from "next/link";
import Image from "next/image";

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
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Rent<span className="text-[#FF6B00]">Awas</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm mt-4 max-w-sm leading-relaxed">
              The ultimate mission control for rental ecosystems. Automate rent collection,
              streamline maintenance, and maximize yield with precision.
            </p>
          </div>

          {/* Nav Links Col 1 */}
          <div className="md:col-span-2">
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
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Links Col 3 */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Security Overview
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} RentAwas Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Engineered for high-performance operations.</span>
            <span className="text-slate-600">•</span>
            <span>Powered by <strong className="text-white font-bold">ANSH Apps</strong></span>
          </p>
        </div>
      </div>
    </footer>
  );
}
