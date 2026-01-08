"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Phone, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/types';

interface HeaderProps {
  translations: Dictionary['nav'];
}

const Header = ({ translations: t }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] as 'it' | 'en';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items with dynamic language prefix and translations
  const navigationItems = [
    { label: t.home, href: `/${currentLocale}` },
    { label: t.rooms, href: `/${currentLocale}#rooms` },
    { label: t.about, href: `/${currentLocale}/about` },
    { label: t.contact, href: `/${currentLocale}/contact` }
  ];

  // Language switcher configuration
  const languages = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ] as const;

  const handleLanguageSwitch = (newLocale: 'it' | 'en') => {
    // Replace the first segment (current locale) with the new locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-elegant border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container-bnb">
        <div className="flex items-center justify-between h-20 lg:h-24">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href={`/${currentLocale}`}
              className="group flex flex-col leading-none hover-glow transition-all duration-300"
            >
              <span className="font-playfair font-semibold text-2xl lg:text-3xl text-stone-dark group-hover:text-terracotta transition-colors duration-300">
                Terrazza
              </span>
              <span className="font-playfair font-medium text-lg lg:text-xl text-sage tracking-wide group-hover:text-sage-dark transition-colors duration-300">
                Santa Chiara
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              item.href.includes('#') ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-body font-medium text-foreground hover:text-terracotta transition-colors duration-300 relative group py-2"
                >
                  {item.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-terracotta scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-body font-medium text-foreground hover:text-terracotta transition-colors duration-300 relative group py-2"
                >
                  {item.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-terracotta scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-6">

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-stone hover:bg-stone-dark text-stone-dark hover:text-background transition-all duration-300">
                  <Globe size={16} />
                  <span className="font-medium text-sm">
                    {currentLocale.toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageSwitch(lang.code)}
                    className={`cursor-pointer ${
                      currentLocale === lang.code
                        ? 'bg-stone/20 font-semibold'
                        : ''
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {currentLocale === lang.code && (
                      <span className="ml-auto text-terracotta">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Phone Number */}
            <a
              href="tel:+393401234567"
              className="flex items-center space-x-2 text-muted-foreground hover:text-terracotta transition-colors duration-300"
            >
              <Phone size={16} />
              <span className="font-medium text-sm">+39 340 123 4567</span>
            </a>

            {/* CTA Button */}
            <Button variant="terracotta" size="lg" className="font-semibold">
              {t.bookNow}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center space-x-4">
            {/* Mobile Phone */}
            <a
              href="tel:+393401234567"
              className="p-2 rounded-lg bg-stone hover:bg-stone-dark text-stone-dark hover:text-background transition-all duration-300"
            >
              <Phone size={18} />
            </a>

            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-terracotta hover:bg-stone/20"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80 bg-background border-l border-border">
                <div className="flex flex-col h-full">

                  {/* Mobile Header */}
                  <div className="flex items-center justify-between py-6 border-b border-border">
                    <div className="flex flex-col">
                      <span className="font-playfair font-semibold text-xl text-stone-dark">
                        Terrazza
                      </span>
                      <span className="font-playfair font-medium text-base text-sage">
                        Santa Chiara
                      </span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-8">
                    <div className="space-y-6">
                      {navigationItems.map((item, index) => (
                        item.href.includes('#') ? (
                          <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-lg font-medium text-foreground hover:text-terracotta transition-colors duration-300 py-2 animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-lg font-medium text-foreground hover:text-terracotta transition-colors duration-300 py-2 animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {item.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Footer */}
                  <div className="border-t border-border pt-6 space-y-4">

                    {/* Language Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-stone hover:bg-stone-dark text-stone-dark hover:text-background transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <Globe size={18} />
                            <span className="font-medium">{t.language}</span>
                          </div>
                          <span className="font-semibold">{currentLocale.toUpperCase()}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px]">
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onClick={() => {
                              handleLanguageSwitch(lang.code);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`cursor-pointer ${
                              currentLocale === lang.code
                                ? 'bg-stone/20 font-semibold'
                                : ''
                            }`}
                          >
                            <span className="mr-2">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {currentLocale === lang.code && (
                              <span className="ml-auto text-terracotta">✓</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile CTA */}
                    <Button
                      variant="terracotta"
                      size="lg"
                      className="w-full font-semibold text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t.bookNow}
                    </Button>

                    {/* Contact Info */}
                    <div className="text-center pt-2">
                      <a
                        href="tel:+393401234567"
                        className="text-muted-foreground hover:text-terracotta transition-colors duration-300 text-sm"
                      >
                        +39 340 123 4567
                      </a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
