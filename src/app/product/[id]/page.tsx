'use client';

import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { notFound } from 'next/navigation';
import { Leaf, Gift, Truck, MapPin, ArrowLeft, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    async function getProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (!isMounted) return;
        if (error || !data) {
          setLoading(false);
          return;
        }
        if (data) {
          // ВРЕМЕННО: Добавляем картинки из папки assets для проверки карусели
          const testImages = [
            data.images[0],
            '/assets/oak-pendant.webp',
            '/assets/willow-ring.webp'
          ];
          setProduct({ ...data, images: testImages });
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('System fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    getProduct();
    return () => { isMounted = false; };
  }, [productId]);

  if (loading) return (
    <div className="product-loading">
      <div className="loading-text">Fine craft takes time...</div>
      <style jsx>{`
        .product-loading { min-height: 100vh; background: #faf9f4; display: flex; align-items: center; justify-content: center; }
        .loading-text { font-family: var(--serif); font-size: 24px; color: #6c746e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );

  if (!product) return notFound();

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="product-page-wrapper">
      <Header />

      <main className="product-main">
        {/* Top Nav */}
        <div className="product-nav">
          <Link href="/shop" className="back-link">
            <ArrowLeft size={14} /> COLLECTION
          </Link>
          <div className="product-serial">Leaves of Kentucky — No. {product.id.slice(0, 4)}</div>
        </div>

        <div className="product-grid">
          {/* Left: Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="main-image"
              />

              {/* Carousel Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    className="carousel-arrow arrow-left"
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="carousel-arrow arrow-right"
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % product.images.length)}
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {product.status === 'sold' && (
                <div className="sold-overlay">
                  <span>ALREADY CHOSEN</span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="thumbnail-grid">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="product-info-column">
            <div className="sticky-info">
              <div className="category-tag">{product.category}</div>
              <h1 className="product-title">{product.name}</h1>

              <div className="price-row">
                <span className="price-amount">{money(product.price)}</span>
                <div className="price-line"></div>
              </div>

              <div className="product-description">
                {product.description}
              </div>

              <div className="artisan-features">
                <div className="feature">
                  <Leaf size={18} />
                  <div>
                    <h4>Nature Made</h4>
                    <p>Original botanical form, electroformed in copper.</p>
                  </div>
                </div>
                <div className="feature">
                  <Gift size={18} />
                  <div>
                    <h4>Gift Ready</h4>
                    <p>Hand-packed in our signature green box.</p>
                  </div>
                </div>
                <div className="feature">
                  <MapPin size={18} />
                  <div>
                    <h4>Kentucky Studio</h4>
                    <p>Proudly crafted in Berea, Kentucky.</p>
                  </div>
                </div>
                <div className="feature">
                  <Truck size={18} />
                  <div>
                    <h4>Free Delivery</h4>
                    <p>Complimentary shipping on all artisan pieces.</p>
                  </div>
                </div>
              </div>

              <div className="purchase-section">
                {product.status === 'available' ? (
                  <div className="action-group">
                    <div className="qty-selector">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14}/></button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}><Plus size={14}/></button>
                    </div>
                    <button
                      onClick={() => addToCart(product, quantity)}
                      className="add-to-bag-btn"
                    >
                      ADD TO COLLECTION
                    </button>
                  </div>
                ) : (
                  <div className="sold-notice">THIS PIECE HAS FOUND A NEW HOME</div>
                )}
                <div className="secure-note text-center mt-4">One-of-a-kind piece • Secure checkout</div>
              </div>

              <div className="artisan-note-block">
                <img src="/assets/hero.webp" alt="Artisan" className="artisan-avatar" />
                <div className="note-content">
                  <h5>Artisan's Note</h5>
                  <p>"I gather these leaves from the forests of Kentucky. Copper doesn't just cover them; it memorializes them, turning a fragile leaf into a lasting heirloom."</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <section className="detail-section">
          <div className="detail-copy">
            <span className="eyebrow-small">The Process</span>
            <h2>Three days of unhurried craftsmanship.</h2>
            <p>
              The electroforming process used to create this {product.name} takes approximately 72 hours. We submerge the real leaf in a special solution where copper particles slowly bond to the organic surface, creating a thick, durable shell that mimics every microscopic detail.
            </p>
          </div>
          <div className="detail-image">
            <img src="/assets/process.webp" alt="Process" />
          </div>
        </section>
      </main>

      <footer className="product-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <svg viewBox="0 0 48 66" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M39 3C23 9 9 22 8 39c-1 12 5 20 14 20 16 0 21-23 17-56Z" />
            </svg>
            <span>LEAVES OF KENTUCKY</span>
          </div>
          <div className="footer-nav">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/#contacts">Contact</Link>
          </div>
          <div className="footer-copy">© 2026 ARTISAN JEWELRY MADE SLOWLY</div>
        </div>
      </footer>

      <style jsx>{`
        .product-page-wrapper { background: #faf9f4; color: #25362e; min-height: 100vh; }
        .product-main { max-width: 1400px; margin: 0 auto; padding: 40px 5% 100px; }

        .product-nav { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dcded4; padding-bottom: 24px; margin-bottom: 60px; }
        .back-link { display: flex; align-items: center; gap: 10px; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #53675a; transition: color .3s; }
        .back-link:hover { color: #a86743; }
        .product-serial { font-size: 10px; letter-spacing: 2px; color: #8a9087; text-transform: uppercase; }

        .product-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 80px; align-items: start; }

        .main-image-container { position: relative; aspect-ratio: 1 / 1.2; background: #f0f1e8; overflow: hidden; }
        .main-image { width: 100%; height: 100%; object-fit: cover; transition: transform 2s; }
        .main-image-container:hover .main-image { transform: scale(1.08); }

        .carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; background: rgba(255, 255, 255, 0.7); border: 0; display: grid; place-items: center; cursor: pointer; transition: all 0.3s; color: #17372c; z-index: 10; backdrop-filter: blur(4px); }
        .carousel-arrow:hover { background: rgba(255, 255, 255, 0.9); color: #a86743; }
        .arrow-left { left: 0; }
        .arrow-right { right: 0; }

        .sold-overlay { position: absolute; inset: 0; background: rgba(245, 243, 234, 0.4); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 11; }
        .sold-overlay span { background: #244638; color: white; padding: 12px 30px; font-size: 11px; font-weight: 700; letter-spacing: 4px; }

        .thumbnail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px; }
        .thumb-btn { border: 0; padding: 0; aspect-ratio: 1/1.1; background: #e9e8de; cursor: pointer; transition: .3s; }
        .thumb-btn.active { ring: 1px solid #a86743; opacity: 1; }
        .thumb-btn:not(.active) { opacity: 0.4; }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

        .sticky-info { position: sticky; top: 120px; }
        .category-tag { font-size: 10px; font-weight: 700; letter-spacing: 4px; color: #a86743; text-transform: uppercase; margin-bottom: 12px; }
        .product-title { font-family: var(--serif); font-size: clamp(40px, 5vw, 80px); line-height: 0.95; color: #17372c; margin: 0 0 30px; letter-spacing: -1px; }

        .price-row { display: flex; align-items: center; gap: 24px; margin-bottom: 50px; }
        .price-amount { font-family: var(--serif); font-size: 32px; font-style: italic; color: #a86743; }
        .price-line { height: 1px; flex: 1; background: #dcded4; }

        .product-description { font-family: var(--serif); font-size: 22px; line-height: 1.6; color: #6c746e; margin-bottom: 60px; font-weight: 300; }

        .artisan-features { display: grid; grid-template-columns: 1fr 1fr; gap: 40px 24px; margin-bottom: 60px; }
        .feature { display: flex; flex-direction: column; gap: 12px; }
        .feature h4 { font-size: 9px; font-weight: 700; letter-spacing: 2px; color: #17372c; text-transform: uppercase; margin: 0; }
        .feature p { font-size: 12px; color: #6c746e; line-height: 1.4; margin: 0; }
        .feature :global(svg) { color: #a86743; }

        .purchase-section { margin-bottom: 60px; }
        .action-group { display: flex; gap: 15px; }
        .qty-selector { display: flex; align-items: center; border: 1px solid #dcded4; height: 60px; background: white; }
        .qty-selector button { width: 45px; height: 100%; border: 0; background: transparent; cursor: pointer; display: grid; place-items: center; }
        .qty-selector span { width: 30px; text-align: center; font-weight: 700; font-size: 13px; }

        .add-to-bag-btn { flex: 1; background: #244638; color: white; border: 0; height: 60px; font-size: 11px; font-weight: 700; letter-spacing: 5px; cursor: pointer; transition: .3s; box-shadow: 0 10px 30px rgba(36, 70, 56, 0.1); }
        .add-to-bag-btn:hover { background: #17372c; transform: translateY(-2px); }
        .sold-notice { width: 100%; border: 1px solid #dcded4; height: 60px; display: grid; place-items: center; color: #8a9087; font-size: 11px; font-weight: 700; letter-spacing: 3px; font-style: italic; }
        .secure-note { font-size: 9px; letter-spacing: 1px; color: #8a9087; text-transform: uppercase; margin-top: 15px; text-align: center; }

        .artisan-note-block { display: flex; gap: 30px; align-items: start; padding-top: 60px; border-top: 1px solid #dcded4; margin-top: 60px; }
        .artisan-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; filter: grayscale(100%); background: #e9e8de; }
        .note-content h5 { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #17372c; text-transform: uppercase; margin: 0 0 10px; }
        .note-content p { font-family: var(--serif); font-size: 14px; font-style: italic; color: #6c746e; line-height: 1.6; margin: 0; }

        .detail-section { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; margin-top: 120px; padding-top: 80px; border-top: 1px solid #dcded4; }
        .eyebrow-small { font-size: 9px; font-weight: 700; letter-spacing: 4px; color: #a86743; text-transform: uppercase; display: block; margin-bottom: 20px; }
        .detail-copy h2 { font-family: var(--serif); font-size: 48px; color: #17372c; line-height: 1.1; margin: 0 0 24px; }
        .detail-copy p { font-size: 15px; color: #6c746e; line-height: 1.7; }
        .detail-image { aspect-ratio: 16/9; background: #eeeee4; overflow: hidden; }
        .detail-image img { width: 100%; height: 100%; object-fit: cover; }

        .product-footer { background: #17372c; color: #e5e9df; padding: 80px 5%; }
        .footer-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { display: flex; align-items: center; gap: 15px; }
        .footer-logo svg { width: 30px; height: 45px; color: #d9dfcc; }
        .footer-logo span { font-family: var(--serif); font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
        .footer-nav { display: flex; gap: 40px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
        .footer-nav a:hover { color: #a86743; }
        .footer-copy { font-size: 10px; color: #859a88; letter-spacing: 1px; }

        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: 1fr; gap: 40px; }
          .product-info-column { order: 2; }
          .sticky-info { position: static; }
          .detail-section { grid-template-columns: 1fr; gap: 40px; }
          .footer-content { flex-direction: column; gap: 40px; text-align: center; }
        }
      `}</style>
    </div>
  );
}
