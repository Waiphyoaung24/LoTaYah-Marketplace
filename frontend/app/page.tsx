'use client';

import React, { useRef } from 'react';
import { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store, ShoppingCart, ArrowRight, Sparkles, Users, Shield, TrendingUp, Zap } from 'lucide-react';
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
    <ViewTransition>
      <main ref={main} className="min-h-screen">
        {/* Hero Section with Background Image */}
        <ViewTransition name="hero-section">
          <section ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center justify-center pt-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
        <Image
            src="/imgs/pexels-amychandra-754734.jpg"
            alt="Hero background"
            fill
            className="hero-bg-image object-cover"
          priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/70 to-stone-900/90"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
          <div className="mb-8">
            <h1 
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-2xl"
            >
              {t.landing.title}
            </h1>
            <p 
              ref={subtitleRef}
              className="text-xl md:text-2xl text-stone-100 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
            >
              {t.landing.subtitle}
          </p>
        </div>
          
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16 relative z-20"
          >
            <button 
              onClick={handleSellerClick}
              className="group relative flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all w-full sm:w-72 text-center hover:scale-105 hover:shadow-amber-500/20 duration-500 cursor-pointer overflow-hidden"
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500 rounded-2xl"></div>
              
              {/* Icon with enhanced interactivity */}
              <div className="relative z-10 bg-amber-500/20 p-4 rounded-full mb-4 group-hover:bg-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40">
                <Store className="w-8 h-8 text-amber-300 group-hover:text-amber-200 transition-colors duration-300" />
              </div>
              
              {/* Title with interactive effects */}
              <h3 className="relative z-10 text-2xl font-bold text-white mb-3 group-hover:text-amber-200 transition-all duration-300 transform group-hover:translate-y-[-2px] drop-shadow-lg">
                {t.landing.btnSell}
              </h3>
              
              {/* Description with fade-in effect */}
              <p className="relative z-10 text-stone-200 text-sm text-center leading-relaxed group-hover:text-stone-100 transition-all duration-300 opacity-90 group-hover:opacity-100">
                {t.landing.btnSellDesc}
              </p>
              
              {/* Arrow with enhanced animation */}
              <ArrowRight className="relative z-10 w-5 h-5 text-amber-300 mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 group-hover:scale-110" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-2xl"></div>
            </button>

            <Link 
              href="/browse"
              className="group relative flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all w-full sm:w-72 text-center hover:scale-105 hover:shadow-yellow-500/20 duration-500 cursor-pointer overflow-hidden"
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-amber-500/0 group-hover:from-yellow-500/10 group-hover:to-amber-500/10 transition-all duration-500 rounded-2xl"></div>
              
              {/* Icon with enhanced interactivity */}
              <div className="relative z-10 bg-yellow-500/20 p-4 rounded-full mb-4 group-hover:bg-yellow-500/30 group-hover:scale-110 group-hover:rotate-[-6deg] transition-all duration-500 shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40">
                <ShoppingCart className="w-8 h-8 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300" />
              </div>
              
              {/* Title with interactive effects */}
              <h3 className="relative z-10 text-2xl font-bold text-white mb-3 group-hover:text-yellow-200 transition-all duration-300 transform group-hover:translate-y-[-2px] drop-shadow-lg">
                {t.landing.btnBuy}
              </h3>
              
              {/* Description with fade-in effect */}
              <p className="relative z-10 text-stone-200 text-sm text-center leading-relaxed group-hover:text-stone-100 transition-all duration-300 opacity-90 group-hover:opacity-100">
                {t.landing.btnBuyDesc}
              </p>
              
              {/* Arrow with enhanced animation */}
              <ArrowRight className="relative z-10 w-5 h-5 text-yellow-300 mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 group-hover:scale-110" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-2xl"></div>
            </Link>
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-stone-600 mb-10">
            Join thousands of sellers and buyers on LoTaYah today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleSellerClick}
              className="px-10 py-5 bg-amber-600 text-white rounded-xl font-semibold text-lg hover:bg-amber-700 transition-colors shadow-xl hover:shadow-2xl hover:scale-105 duration-300"
            >
              Start Selling
            </button>
            <Link
              href="/browse"
              className="px-10 py-5 bg-white text-amber-600 rounded-xl font-semibold text-lg hover:bg-stone-50 transition-colors shadow-xl hover:shadow-2xl border-2 border-amber-600 hover:scale-105 duration-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
      </ViewTransition>
      </main>
    </ViewTransition>
  );
}
