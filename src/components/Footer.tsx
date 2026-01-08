import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n/types';

interface FooterProps {
  translations: Dictionary['footer'];
  lang: string;
}

const Footer = ({ translations: t, lang }: FooterProps) => {
  return (
    <footer className="border-t border-sage/20 mt-auto" style={{ backgroundColor: '#975635' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Column */}
          <div>
            <h3 className="font-medium text-lg mb-4" style={{ color: '#f9f5f0' }}>{t.contact.title}</h3>
            <div className="space-y-2" style={{ color: '#f9f5f0' }}>
              <p className="flex items-center gap-2">
                <span>📍</span>
                {t.contact.address}
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span>
                {t.contact.phone}
              </p>
              <p className="flex items-center gap-2">
                <span>✉️</span>
                {t.contact.email}
              </p>
            </div>
          </div>

          {/* Rooms Column */}
          <div>
            <h3 className="font-medium text-lg mb-4" style={{ color: '#f9f5f0' }}>{t.accommodations.title}</h3>
            <div className="space-y-2">
              <Link
                href={`/${lang}/rooms/garden-room`}
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.accommodations.gardenRoom}
              </Link>
              <Link
                href={`/${lang}/rooms/stone-vault-apartment`}
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.accommodations.stoneVault}
              </Link>
              <Link
                href={`/${lang}/rooms/terrace-apartment`}
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.accommodations.terrace}
              </Link>
              <Link
                href={`/${lang}/rooms/modern-apartment`}
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.accommodations.modern}
              </Link>
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-medium text-lg mb-4" style={{ color: '#f9f5f0' }}>{t.information.title}</h3>
            <div className="space-y-2">
              <Link
                href={`/${lang}/about`}
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.information.aboutUs}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.information.contact}
              </Link>
              <a
                href="#"
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.information.privacyPolicy}
              </a>
              <a
                href="#"
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                {t.information.termsOfService}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-center text-sm" style={{ color: '#f9f5f0' }}>
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
