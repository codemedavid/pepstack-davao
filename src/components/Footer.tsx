import React from 'react';
import { Truck, FlaskConical, HelpCircle, FileText, BookOpen } from 'lucide-react';
import { useCOAPageSetting } from '../hooks/useCOAPageSetting';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { coaPageEnabled } = useCOAPageSetting();

  return (
    <footer className="bg-charcoal-900 pt-16 pb-8 border-t border-charcoal-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src="/logo.png?v=3"
              alt="Pepstack Davao"
              className="h-24 w-auto object-contain bg-white/90 rounded-2xl p-2"
            />
            <p className="text-charcoal-400 text-sm max-w-xs text-center md:text-left">
              Pepstack Davao — advanced peptide solutions designed for innovation and research. Lab-tested, high-purity formulations you can trust.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Quick Links</h3>
            <a
              href="#"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <FlaskConical className="w-4 h-4" />
              Products
            </a>
            <a
              href="/track-order"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </a>
            <a
              href="/faq"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </a>
            {coaPageEnabled && (
            <a
              href="/coa"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Certificate of Analysis
            </a>
            )}
            <a
              href="/protocols"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Protocols
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-charcoal-800 mb-6" />

        {/* Footer Bottom */}
        <div className="text-center">
          <p className="text-xs text-charcoal-500 flex items-center justify-center gap-1">
            Made with
            © {currentYear} Pepstack Davao.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
