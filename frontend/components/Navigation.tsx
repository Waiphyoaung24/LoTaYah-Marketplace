'use client';

import React, { useState } from 'react';
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
  <Link
    href={href}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active 
        ? 'text-amber-700 bg-amber-50' 
        : 'text-stone-600 hover:text-amber-600 hover:bg-stone-50'
    }`}
  >
    {children}
  </Link>
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
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            <Gem className="h-8 w-8 text-amber-600 mr-2" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500 leading-none">
                LoTaYah
              </span>
              {lang === 'my' && <span className="text-[10px] text-stone-400 font-medium">လိုတရ</span>}
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/" active={pathname === '/'}>{t.nav.home}</NavLink>
            <NavLink href="/browse" active={pathname === '/browse'}>{t.nav.browse}</NavLink>
            <NavLink href="/community" active={pathname === '/community'}>{t.nav.community}</NavLink>
            <button 
              onClick={handleSellerClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/seller' 
                  ? 'text-amber-700 bg-amber-50' 
                  : 'text-stone-600 hover:text-amber-600 hover:bg-stone-50'
              }`}
            >
              {t.nav.sell}
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            
            {/* Currency Selector */}
            <div className="hidden md:block relative group">
              <button className="flex items-center text-sm font-medium text-stone-500 hover:text-amber-600 transition-colors px-2 py-1 rounded border border-stone-200">
                <Coins className="w-3.5 h-3.5 mr-1" />
                {currency}
              </button>
              <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-stone-100 shadow-lg rounded-lg overflow-hidden hidden group-hover:block animate-fade-in">
                {(['MMK', 'THB', 'GBP'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-amber-50 ${currency === c ? 'text-amber-600 font-bold' : 'text-stone-600'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

             {/* Language Toggle */}
            <button 
              onClick={toggleLang}
              className="flex items-center text-sm font-medium text-stone-500 hover:text-amber-600 transition-colors px-2 py-1 rounded border border-stone-200"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              {lang === 'en' ? 'EN' : 'MM'}
            </button>

            <button 
              className="relative p-2 text-stone-600 hover:text-amber-600 transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  href="/login"
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${pathname === '/login' ? 'text-amber-700 bg-amber-50' : 'text-stone-600 hover:text-amber-600'}`}
                >
                  {t.nav.login}
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    variant={pathname === '/register' ? 'primary' : 'outline'}
                  >
                    {t.nav.register}
                  </Button>
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center text-sm font-medium text-stone-500 hover:text-red-600 transition-colors"
                title={t.nav.logout}
              >
                <LogOut className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline">{t.nav.logout}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-stone-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 space-y-2 shadow-lg">
          <Link 
            href="/"
            className={`block w-full text-left px-4 py-2 rounded-lg ${pathname === '/' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.nav.home}
          </Link>
          <Link 
            href="/browse"
            className={`block w-full text-left px-4 py-2 rounded-lg ${pathname === '/browse' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.nav.browse}
          </Link>
          <Link 
            href="/community"
            className={`block w-full text-left px-4 py-2 rounded-lg ${pathname === '/community' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.nav.community}
          </Link>
          <button 
            className={`block w-full text-left px-4 py-2 rounded-lg ${pathname === '/seller' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'}`}
            onClick={() => { handleSellerClick(); setIsMobileMenuOpen(false); }}
          >
            {t.nav.sell}
          </button>
          
          {/* Mobile Currency Selection */}
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto">
             <span className="text-sm text-stone-500 mr-2">Currency:</span>
             {(['MMK', 'THB', 'GBP'] as const).map(c => (
               <button 
                 key={c}
                 onClick={() => setCurrency(c)}
                 className={`px-2 py-1 rounded text-xs border ${currency === c ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-stone-200 text-stone-600'}`}
               >
                 {c}
               </button>
             ))}
          </div>

          <div className="border-t border-stone-100 my-2 pt-2"></div>
          
          {!user ? (
            <>
              <Link 
                href="/login"
                className={`block w-full text-left px-4 py-2 rounded-lg ${pathname === '/login' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
              <Link 
                href="/register"
                className={`block w-full text-left px-4 py-2 rounded-lg ${pathname === '/register' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.register}
              </Link>
            </>
          ) : (
             <button 
              className="block w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 flex items-center"
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

