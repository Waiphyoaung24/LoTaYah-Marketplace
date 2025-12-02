 'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store, ShoppingCart, ArrowRight, Sparkles, Users, Shield, TrendingUp, Zap, Star } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { t, user } = useApp();
  const main = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageGalleryRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const handleSellerClick = () => {
    if (user) {
      window.location.href = '/seller';
    } else {
      window.location.href = '/login';
    }
  };

  useGSAP(
    () => {
      // Set initial states to ensure visibility
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 1, y: 0 });
      if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
      if (buttonsRef.current) {
        gsap.set(buttonsRef.current.children, { opacity: 1, y: 0 });
      }

      // Hero section entrance animations
      const tl = gsap.timeline({ delay: 0.1 });
      
      tl.fromTo(titleRef.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
      )
      .fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo(buttonsRef.current?.children || [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out' },
        '-=0.5'
      );

      // Hero background image parallax
      gsap.to('.hero-bg-image', {
        scale: 1.1,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Image gallery scroll animations
      const galleryImages = gsap.utils.toArray('.gallery-image');
      
      galleryImages.forEach((img: any, index: number) => {
        gsap.from(img, {
          y: 150,
          opacity: 0,
          scale: 0.8,
          rotation: index % 2 === 0 ? -5 : 5,
          scrollTrigger: {
            trigger: img,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
            toggleActions: 'play none none reverse',
          },
        });

        // Hover effect
        img.addEventListener('mouseenter', () => {
          gsap.to(img, {
            scale: 1.05,
            y: -10,
            duration: 0.4,
            ease: 'power2.out',
          });
        });

        img.addEventListener('mouseleave', () => {
          gsap.to(img, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      });

      // Feature cards animations
      const featureCards = gsap.utils.toArray('.feature-card');
      
      featureCards.forEach((card: any, index: number) => {
        gsap.from(card, {
          y: 100,
          opacity: 0,
          rotation: index % 2 === 0 ? -3 : 3,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 50%',
            scrub: 0.8,
            toggleActions: 'play none none reverse',
          },
        });

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -15,
            scale: 1.03,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            rotation: index % 2 === 0 ? -3 : 3,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });

      // Stats counter animation
      const stats = gsap.utils.toArray('.stat-item');
      stats.forEach((stat: any) => {
        gsap.from(stat, {
          scale: 0,
          opacity: 0,
          scrollTrigger: {
            trigger: stat,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          duration: 0.8,
          ease: 'back.out(1.7)',
        });
      });

      // Parallax section
      if (parallaxRef.current) {
        gsap.to(parallaxRef.current, {
          y: -150,
          scrollTrigger: {
            trigger: parallaxRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    },
    { scope: main }
  );

  return (
    <main ref={main} className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[80vh] flex items-center pt-28"
      >
        {/* Background gradient - light / gold */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,250,250,0.95),_transparent_60%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.30),_transparent_55%)]" />

        {/* Soft top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/40 to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
          {/* Left copy */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            

            <div className="space-y-4">
              <h1
                ref={titleRef}
                className="text-balance text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {t.landing.title}
              </h1>
              <p
                ref={subtitleRef}
                className="mx-auto max-w-xl text-balance text-base text-stone-600 sm:text-lg"
              >
                {t.landing.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-stone-500 lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>No listing fees for early sellers</span>
              </div>
              <span className="hidden h-px w-6 bg-amber-200 md:inline-block" />
              <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Launch, sell, and grow in one place
              </span>
            </div>
          </div>

          {/* Right cards */}
          <div
            ref={buttonsRef}
            className="flex flex-1 flex-col gap-4 lg:max-w-sm"
          >
            {/* Seller card */}
            <button
              onClick={handleSellerClick}
              className="group relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-b from-white via-amber-50/70 to-amber-100/70 p-5 text-left shadow-[0_18px_40px_rgba(148,118,43,0.22)] transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_22px_60px_rgba(202,138,4,0.45)]"
            >
              <div className="pointer-events-none absolute -inset-px bg-[conic-gradient(from_140deg_at_50%_0%,rgba(250,204,21,0.45),transparent_55%,rgba(251,191,36,0.7),transparent_85%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-400/50">
                  <Store className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold text-stone-900">
                    {t.landing.btnSell}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {t.landing.btnSellDesc}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </button>

            {/* Buyer card */}
            <Link
              href="/browse"
              className="group relative overflow-hidden rounded-2xl border border-yellow-200/80 bg-gradient-to-b from-white via-yellow-50/70 to-amber-50/70 p-5 text-left shadow-[0_16px_38px_rgba(212,163,20,0.18)] transition-all hover:-translate-y-1 hover:border-yellow-300 hover:shadow-[0_22px_60px_rgba(234,179,8,0.35)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-yellow-300/20 to-amber-300/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 ring-1 ring-yellow-300/60">
                  <ShoppingCart className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold text-stone-900">
                    {t.landing.btnBuy}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {t.landing.btnBuyDesc}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-yellow-500 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Inline stats row */}
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs text-stone-600 shadow-[0_14px_30px_rgba(217,176,60,0.28)]">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                <span>Verified seller protection</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-amber-200" />
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-amber-500" />
                <span>10k+ buyers browsing right now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Discover Amazing Products
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Explore our curated collection of unique items from trusted sellers
            </p>
          </div>

          <div ref={imageGalleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="gallery-image relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <Image
                src="/imgs/pexels-daniel-lienert-399431-1089288.jpg"
                alt="Product showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Handcrafted Items</h3>
                  <p className="text-sm text-stone-200">Unique artisan products</p>
                </div>
              </div>
            </div>

            <div className="gallery-image relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <Image
                src="/imgs/pexels-sippakorn-yamkasikorn-1745809-3421999.jpg"
                alt="Product showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Premium Quality</h3>
                  <p className="text-sm text-stone-200">Carefully selected items</p>
                </div>
              </div>
            </div>

            <div className="gallery-image relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <Image
                src="/imgs/pexels-munzir-1936997-3560161.jpg"
                alt="Product showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Local Treasures</h3>
                  <p className="text-sm text-stone-200">Authentic local products</p>
                </div>
              </div>
            </div>

            <div className="gallery-image relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group cursor-pointer md:col-span-2">
              <Image
                src="/imgs/pexels-the-trvlr-2643896.jpg"
                alt="Product showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">Marketplace Experience</h3>
                  <p className="text-lg text-stone-200">Shop from verified sellers</p>
                </div>
              </div>
            </div>

            <div className="gallery-image relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <Image
                src="/imgs/pexels-amychandra-754734.jpg"
                alt="Product showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Best Deals</h3>
                  <p className="text-sm text-stone-200">Great prices every day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Why Choose LoTaYah?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Experience the future of marketplace shopping
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Lightning Fast</h3>
              <p className="text-stone-600 leading-relaxed">
                Set up your store in minutes. Start selling instantly.
              </p>
            </div>

            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Trusted Community</h3>
              <p className="text-stone-600 leading-relaxed">
                Connect with verified sellers and buyers safely.
              </p>
            </div>

            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Secure & Safe</h3>
              <p className="text-stone-600 leading-relaxed">
                Protected transactions with secure payment system.
              </p>
            </div>

            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Growing Platform</h3>
              <p className="text-stone-600 leading-relaxed">
                Join thousands of successful sellers and buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Image Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div ref={parallaxRef} className="absolute inset-0">
            <Image
            src="/imgs/pexels-rockwell-branding-agency-85164430-8910187.jpg"
            alt="Marketplace showcase"
            fill
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/70 to-stone-900/90"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              Your Marketplace Journey Starts Here
            </h2>
            <p className="text-xl md:text-2xl text-stone-100 mb-8 drop-shadow-lg">
              Join our community and discover endless possibilities
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleSellerClick}
                className="px-8 py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-2xl hover:scale-105 duration-300"
              >
                Start Selling Now
              </button>
              <Link
                href="/browse"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors shadow-2xl border-2 border-white/30 hover:scale-105 duration-300"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="stat-item">
              <div className="text-5xl md:text-6xl font-bold text-amber-600 mb-2">10K+</div>
              <div className="text-stone-600 font-medium text-lg">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="text-5xl md:text-6xl font-bold text-amber-600 mb-2">5K+</div>
              <div className="text-stone-600 font-medium text-lg">Products</div>
            </div>
            <div className="stat-item">
              <div className="text-5xl md:text-6xl font-bold text-amber-600 mb-2">500+</div>
              <div className="text-stone-600 font-medium text-lg">Stores</div>
            </div>
            <div className="stat-item">
              <div className="text-5xl md:text-6xl font-bold text-amber-600 mb-2">98%</div>
              <div className="text-stone-600 font-medium text-lg">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-[#fdfbf7] via-[#faf3e4] to-[#f8efe0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm ring-1 ring-amber-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              Trusted by our community
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
              Stories from sellers and buyers on LoTaYah.
            </h2>
            <p className="mt-3 text-sm md:text-base text-stone-600">
              Genuine feedback from people who launch stores, discover products, and build loyal customers every day.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Seller testimonial */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(214,158,46,0.18)]">
              <div className="pointer-events-none absolute -top-8 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200/70 to-orange-200/40 blur-2xl" />
              <div className="relative space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                  Top seller
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  “We published our first listings in an afternoon and had real orders the same week. LoTaYah handles the hard parts so we can focus on our products.”
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold uppercase text-amber-700 ring-1 ring-amber-200">
                      MT
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Myo Thant</p>
                      <p className="text-xs text-stone-500">Owner, Golden Lotus Crafts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>4.9 store rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer testimonial */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-50 bg-white/95 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
              <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-gradient-to-tr from-amber-100/70 to-yellow-200/50 blur-2xl" />
              <div className="relative space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Happy buyer
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  “It feels like walking through a curated market. I’ve found gifts, daily essentials, and unique local pieces I can’t get anywhere else.”
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold uppercase text-emerald-700 ring-1 ring-emerald-200">
                      SM
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Su Mon Hnin</p>
                      <p className="text-xs text-stone-500">Verified buyer</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                    120+ orders completed
                  </div>
                </div>
              </div>
            </div>

            {/* New store testimonial */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-b from-white via-amber-50/40 to-white p-6 shadow-[0_18px_40px_rgba(234,179,8,0.18)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-amber-100/60 via-transparent to-transparent" />
              <div className="relative space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                  Growing brand
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  “We tested LoTaYah alongside other platforms and this is where repeat customers keep coming back. The tools make us look like a much bigger brand.”
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold uppercase text-amber-700 ring-1 ring-amber-200">
                      KZ
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Ko Zaw Min</p>
                      <p className="text-xs text-stone-500">Founder, Neighborhood Market</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-[11px] text-stone-600">
                    <span className="font-semibold text-amber-700">3x</span>
                    <span>sales in 90 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-100/70 bg-gradient-to-b from-[#fdfbf7]/95 via-[#faf3e4] to-[#f4e0bb]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            {/* Brand + short CTA */}
            <div className="max-w-sm space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-amber-700 shadow-sm ring-1 ring-amber-100">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                <span>{t.landing.title}</span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-stone-900">
                Join thousands of sellers and buyers on LoTaYah.
              </h3>
              <p className="text-sm text-stone-600">
                Launch your storefront, grow your community, and discover unique products in one trusted marketplace.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleSellerClick}
                  className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-400/40 transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-md"
                >
                  Start selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50"
                >
                  Browse products
                </Link>
              </div>
            </div>

            {/* Columns */}
            <div className="grid flex-1 grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Marketplace
                </h4>
                <ul className="space-y-2 text-stone-600">
                  <li>
                    <Link href="/browse" className="hover:text-amber-700 hover:underline underline-offset-4">
                      Browse products
                    </Link>
                  </li>
                  <li>
                    <Link href="/seller" className="hover:text-amber-700 hover:underline underline-offset-4">
                      Become a seller
                    </Link>
                  </li>
                  <li>
                    <Link href="/community" className="hover:text-amber-700 hover:underline underline-offset-4">
                      Community
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Company
                </h4>
                <ul className="space-y-2 text-stone-600">
                  <li>
                    <button className="hover:text-amber-700 hover:underline underline-offset-4">
                      About
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-amber-700 hover:underline underline-offset-4">
                      Help center
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-amber-700 hover:underline underline-offset-4">
                      Terms &amp; privacy
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Contact
                </h4>
                <div className="space-y-2 text-sm text-stone-600">
                  <p className="leading-relaxed">
                    Have questions about LoTaYah or need support? Reach out to our team at{' '}
                    <a
                      href="mailto:hello@lotayah.com"
                      className="font-semibold text-amber-700 hover:text-amber-800 hover:underline underline-offset-4"
                    >
                      support@lotayah.com.mm
                    </a>
                    .
                  </p>
                  <p className="text-xs text-stone-500">
                    Designed &amp; developed by{' '}
                    <span className="font-semibold text-stone-700">
                      Nexus
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-3 border-t border-amber-100 pt-4 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} LoTaYah. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                Protected payments
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
                <Shield className="h-3 w-3" />
                Verified sellers
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
