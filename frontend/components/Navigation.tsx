'use client';

import React, { useState } from 'react';
import { ViewTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Store, Menu, X, Gem, Globe, LogOut, Coins } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '@/contexts/AppContext';

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, active, children }) => (
  <ViewTransition>
    <Link
      href={href}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
        active 
          ? 'text-amber-600 bg-amber-50/90 backdrop-blur-md shadow-md border border-amber-200/50' 
          : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50/50 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
      }`}
    >
      {children}
    </Link>
  </ViewTransition>
);

export const Navigation: React.FC = () => {
  const { 
    user, 
    setUser, 
    setCart, 
    lang, 
    toggleLang, 
    currency, 
    setCurrency, 
    cartItemCount, 
    setIsCartOpen,
    t 
  } = useApp();
  
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    router.push('/');
  };

  const handleSellerClick = () => {
    if (user) {
      router.push('/seller');
    } else {
      router.push('/login');
    }
  };

  return (
    // Changed sticky to fixed to remove the black gap above the image
    <nav className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-4 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        {/* Changed bg-white/90 to bg-white/10 for transparency and maintained blur */}
        <div className="flex justify-between items-center h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl shadow-stone-900/10 px-6 transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-100 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-amber-50/80 backdrop-blur-sm p-2 rounded-lg border border-amber-200/50">
                <Gem className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex flex-col ml-3">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500 leading-none">
                LoTaYah
              </span>
              {lang === 'my' && <span className="text-[10px] text-stone-400 font-medium">လိုတရ</span>}
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink href="/" active={pathname === '/'}>{t.nav.home}</NavLink>
            <NavLink href="/browse" active={pathname === '/browse'}>{t.nav.browse}</NavLink>
            <NavLink href="/community" active={pathname === '/community'}>{t.nav.community}</NavLink>
            <button 
              onClick={handleSellerClick}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                pathname === '/seller' 
                  ? 'text-amber-600 bg-amber-50/90 backdrop-blur-md shadow-md border border-amber-200/50' 
                  : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50/50 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
              }`}
            >
              {t.nav.sell}
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            
            {/* Currency Selector */}
            <div className="hidden md:block relative group">
              <button className="flex items-center text-sm font-semibold text-stone-700 hover:text-amber-600 transition-all duration-300 px-3 py-2 rounded-xl bg-stone-50/50 backdrop-blur-sm border border-stone-200/50 hover:bg-white/90 hover:border-amber-200/50 shadow-sm hover:shadow-md">
                <Coins className="w-4 h-4 mr-1.5" />
                <span>{currency}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-28 bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-xl overflow-hidden hidden group-hover:block animate-fade-in">
                {(['MMK', 'THB', 'GBP'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      currency === c 
                        ? 'text-amber-600 font-bold bg-amber-50/80' 
                        : 'text-stone-700 hover:bg-stone-50/80'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

             {/* Language Toggle */}
            <button 
              onClick={toggleLang}
              className="hidden md:flex items-center text-sm font-semibold text-stone-700 hover:text-amber-600 transition-all duration-300 px-3 py-2 rounded-xl bg-stone-50/50 backdrop-blur-sm border border-stone-200/50 hover:bg-white/90 hover:border-amber-200/50 shadow-sm hover:shadow-md"
            >
              <Globe className="w-4 h-4 mr-1.5" />
              <span>{lang === 'en' ? 'EN' : 'MM'}</span>
            </button>

            <button 
              className="relative p-2.5 text-stone-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-stone-50/50 backdrop-blur-sm border border-transparent hover:border-stone-200/50"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  href="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 ${
                    pathname === '/login' 
                      ? 'text-amber-600 bg-amber-50/90 backdrop-blur-md shadow-md border border-amber-200/50' 
                      : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50/50 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
                  }`}
                >
                  {t.nav.login}
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    variant={pathname === '/register' ? 'primary' : 'outline'}
                    className="font-semibold"
                  >
                    {t.nav.register}
                  </Button>
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center text-sm font-semibold text-stone-700 hover:text-red-600 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-red-50/80 backdrop-blur-sm border border-transparent hover:border-red-200/50"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span className="hidden lg:inline">{t.nav.logout}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2.5 text-stone-700 rounded-xl hover:bg-stone-50/50 backdrop-blur-sm border border-transparent hover:border-stone-200/50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-2xl px-6 py-4 space-y-2 pointer-events-auto">
          <Link 
            href="/"
            className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
              pathname === '/' 
                ? 'bg-amber-50/90 backdrop-blur-md text-amber-600 shadow-md border border-amber-200/50' 
                : 'text-stone-700 hover:bg-stone-50/80 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.nav.home}
          </Link>
          <Link 
            href="/browse"
            className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
              pathname === '/browse' 
                ? 'bg-amber-50/90 backdrop-blur-md text-amber-600 shadow-md border border-amber-200/50' 
                : 'text-stone-700 hover:bg-stone-50/80 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.nav.browse}
          </Link>
          <Link 
            href="/community"
            className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
              pathname === '/community' 
                ? 'bg-amber-50/90 backdrop-blur-md text-amber-600 shadow-md border border-amber-200/50' 
                : 'text-stone-700 hover:bg-stone-50/80 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.nav.community}
          </Link>
          <button 
            className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
              pathname === '/seller' 
                ? 'bg-amber-50/90 backdrop-blur-md text-amber-600 shadow-md border border-amber-200/50' 
                : 'text-stone-700 hover:bg-stone-50/80 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
            }`}
            onClick={() => { handleSellerClick(); setIsMobileMenuOpen(false); }}
          >
            {t.nav.sell}
          </button>
          
          {/* Mobile Currency Selection */}
          <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto border-t border-stone-200/50 mt-2 pt-3">
             <span className="text-sm text-stone-600 font-medium mr-2">Currency:</span>
             {(['MMK', 'THB', 'GBP'] as const).map(c => (
               <button 
                 key={c}
                 onClick={() => setCurrency(c)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                   currency === c 
                     ? 'bg-amber-50/90 border-amber-200/50 text-amber-600 shadow-sm' 
                     : 'border-stone-200/50 text-stone-600 hover:bg-stone-50/80'
                 }`}
               >
                 {c}
               </button>
             ))}
          </div>

          <div className="border-t border-stone-200/50 my-2"></div>
          
          {!user ? (
            <>
              <Link 
                href="/login"
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  pathname === '/login' 
                    ? 'bg-amber-50/90 backdrop-blur-md text-amber-600 shadow-md border border-amber-200/50' 
                    : 'text-stone-700 hover:bg-stone-50/80 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
              <Link 
                href="/register"
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  pathname === '/register' 
                    ? 'bg-amber-50/90 backdrop-blur-md text-amber-600 shadow-md border border-amber-200/50' 
                    : 'text-stone-700 hover:bg-stone-50/80 backdrop-blur-sm border border-transparent hover:border-stone-200/50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.register}
              </Link>
            </>
          ) : (
             <button 
              className="block w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50/80 backdrop-blur-sm transition-all duration-300 font-semibold border border-transparent hover:border-red-200/50 flex items-center"
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.nav.logout}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};