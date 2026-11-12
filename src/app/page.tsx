'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching products:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error('System error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category?.toLowerCase() === filter.toLowerCase()));
    }
  };

  return (
    <div className="site-wrapper bg-[#faf9f4]" suppressHydrationWarning>
      <Header />

      <main suppressHydrationWarning>
        {/* 1. HERO */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">REAL LEAVES <span>/</span> COPPER <span>/</span> TIMELESS BEAUTY</div>
            <h1>A piece of nature.<br/>Preserved forever.</h1>
            <p>Real leaves, transformed into one-of-a-kind copper jewelry, inspired by Kentucky’s natural beauty.</p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/shop">SHOP THE COLLECTION</Link>
              <Link className="button button-outline" href="#process">OUR CRAFT</Link>
            </div>
            <div className="hero-note"><span>Handcrafted</span><i></i><span>Never made twice</span></div>
          </div>
          <div className="hero-image">
            <img src="/assets/hero.webp" alt="Artisan Jewelry" />
          </div>
        </section>

        {/* 2. BENEFITS */}
        <section className="benefits">
          <div className="benefit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20 3C10 3 4 8 4 15c0 3 2 5 5 5 7 0 11-7 11-17Z"/><path d="M3 22 16 8M8 17l-1-5M12 13l5-1"/></svg>
            <span>Real botanical forms</span>
          </div>
          <div className="benefit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 12h4l3 3 4-4 3 3 4-2M7 12V7c0-2 3-2 3 0v3M10 9V5c0-2 3-2 3 0v5M13 8V4c0-2 3-2 3 0v7M16 9c0-2 3-2 3 0v6c0 5-3 7-7 7-3 0-5-2-7-5l-2-3"/></svg>
            <span>Handcrafted with care</span>
          </div>
          <div className="benefit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15M12 6H8a3 3 0 1 1 3-4c1 2 1 4 1 4ZM12 6h4a3 3 0 1 0-3-4c-1 2-1 4-1 4Z"/></svg>
            <span>Gift-ready packaging</span>
          </div>
        </section>

        {/* 3. CATEGORIES */}
        <section className="categories section-shell">
          <div className="section-heading ornament-heading">
            <span className="eyebrow">FIND YOUR NATURAL STATEMENT</span>
            <h2>Inspired by nature</h2>
          </div>
          <div className="category-grid">
            <div onClick={() => handleFilter('earrings')} className="category-card">
              <img src="/assets/birch-earrings.webp" alt="Earrings" />
              <span>Earrings <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></span>
            </div>
            <div onClick={() => handleFilter('necklaces')} className="category-card">
              <img src="/assets/oak-pendant.webp" alt="Necklaces" />
              <span>Necklaces <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></span>
            </div>
            <div onClick={() => handleFilter('bracelets')} className="category-card">
              <img src="/assets/oak-bracelet.webp" alt="Bracelets" />
              <span>Bracelets <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></span>
            </div>
            <div onClick={() => handleFilter('rings')} className="category-card">
              <img src="/assets/willow-ring.webp" alt="Rings" />
              <span>Rings <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></span>
            </div>
          </div>
        </section>

        {/* 4. SHOP */}
        <section className="shop section-shell" id="shop">
          <div className="shop-top">
            <div className="section-heading">
              <span className="eyebrow">THE COLLECTION</span>
              <h2>Jewelry with a story</h2>
            </div>
            <p>Every leaf leaves its own one-of-a-kind impression in copper. Find the piece that speaks to you.</p>
          </div>

          <div className="filter-row">
            {['all', 'earrings', 'necklaces', 'bracelets', 'rings'].map(f => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => handleFilter(f)}
              >
                {f === 'all' ? 'All jewelry' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="empty-products py-20 animate-pulse text-[var(--muted)]">Loading collection...</div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="empty-products py-20 text-center">No pieces found in this category.</div>
            )}
          </div>

          <div className="center-action">
            <Link href="/shop" className="text-link">VIEW THE FULL COLLECTION <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></Link>
          </div>
        </section>

        {/* 5. PROCESS */}
        <section className="process" id="process">
          <div className="process-image">
            <img src="/assets/process.webp" alt="Artisan Process" />
          </div>
          <div className="process-copy">
            <span className="eyebrow">FROM LEAF TO HEIRLOOM</span>
            <h2>Nature makes the shape.<br/>We preserve it.</h2>
            <p>Every piece begins with a real leaf, thoughtfully gathered and selected by hand. Through electroforming, layer after layer of copper preserves its finest veins and edges.</p>
            <ol className="process-steps">
              <li><span>01</span><div><strong>We find the perfect leaf</strong><small>Only naturally beautiful, characterful forms.</small></div></li>
              <li><span>02</span><div><strong>We preserve it in copper</strong><small>Our unhurried process takes up to three days.</small></div></li>
              <li><span>03</span><div><strong>We finish by hand</strong><small>We polish, patina, and assemble every detail.</small></div></li>
            </ol>
            <button className="text-link">DISCOVER OUR PROCESS <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></button>
          </div>
        </section>

        {/* 6. STORY */}
        <section className="story section-shell" id="story">
          <div className="story-card">
            <span className="large-quote">“</span>
            <blockquote>“I don’t create a leaf’s shape — nature already did that. My work is simply to help it stay with you a little longer.”</blockquote>
            <div className="maker"><span className="maker-line"></span><div><strong>Elena Young</strong><small>Founder & artisan</small></div></div>
          </div>
          <div className="story-side">
            <span className="eyebrow">A SMALL STUDIO. A LOT OF HEART.</span>
            <h2>Made slowly.<br/>Made to be worn.</h2>
            <p>We work in small batches in our Kentucky studio. No assembly lines, no identical forms — just thoughtful craftsmanship, honest materials, and leaves with stories of their own.</p>
            <div className="story-stats">
              <div><strong>6</strong><span>years of craft</span></div>
              <div><strong>1 000+</strong><span>one-of-a-kind pieces</span></div>
              <div><strong>100%</strong><span>handmade</span></div>
            </div>
          </div>
        </section>

        {/* 7. GIFT BANNER */}
        <section className="gift-banner">
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="bg-ornament"><path d="M20 3C10 3 4 8 4 15c0 3 2 5 5 5 7 0 11-7 11-17Z"/><path d="M3 22 16 8M8 17l-1-5M12 13l5-1"/></svg>
            <span className="eyebrow">A THOUGHTFUL GIFT</span>
            <h2>Give a little piece of the forest</h2>
            <p>Every order arrives in our signature gift box with a handmade card and your personal message, at no extra cost.</p>
          </div>
          <Link href="/shop" className="button button-light">FIND A GIFT <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15M14 6l6 6-6 6"/></svg></Link>
        </section>

        {/* 8. REVIEWS */}
        <section className="reviews section-shell">
          <div className="section-heading ornament-heading">
            <span className="eyebrow">KIND WORDS FROM OUR CUSTOMERS</span>
            <h2>Pieces that feel personal</h2>
          </div>
          <div className="review-grid">
            <article>
              <div className="stars">★★★★★</div>
              <p>“The leaf veins are so vivid, as if it were just picked. The earrings are incredibly light, and the packaging is a delight, too.”</p>
              <footer>Anna M. <span>Maple Leaf Earrings</span></footer>
            </article>
            <article>
              <div className="stars">★★★★★</div>
              <p>“I gave my wife the pendant for our anniversary. It’s more than jewelry—it’s a little natural artifact. Thank you for your incredible work.”</p>
              <footer>Michael K. <span>Oak Leaf Pendant</span></footer>
            </article>
            <article>
              <div className="stars">★★★★★</div>
              <p>“The bracelet is even lovelier in person. The warm copper looks beautiful against the skin. You can feel the care that went into it.”</p>
              <footer>Elena V. <span>Oak Leaf Bracelet</span></footer>
            </article>
          </div>
        </section>

        {/* 9. NEWSLETTER */}
        <section className="newsletter">
          <div>
            <span className="eyebrow">NOTES FROM THE STUDIO</span>
            <h2>A little nature in your inbox</h2>
            <p>New pieces, stories from the studio, and invitations to local markets—never more than twice a month.</p>
          </div>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" required />
            <button className="button button-dark" type="submit">SUBSCRIBE</button>
          </form>
        </section>
      </main>

      <footer className="site-footer" id="contacts">
        <div className="footer-brand">
          <div className="brand brand-light flex items-center gap-[15px]">
            <svg className="w-[34px] h-[49px] text-[#d9dfcc]" viewBox="0 0 48 66" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M39 3C23 9 9 22 8 39c-1 12 5 20 14 20 16 0 21-23 17-56Z" />
              <path d="M5 64 33 13M15 48l-2-15M21 37l14-5M26 26l-1-10M12 54l15-4" />
            </svg>
            <span><strong>LEAVES OF KENTUCKY</strong><small>ARTISAN JEWELRY</small></span>
          </div>
          <p className="italic mt-5 ml-[49px] text-[#aebcac]">Nature’s beauty,<br/>made to stay with you.</p>
        </div>

        <div className="footer-links">
          <h3>Shop</h3>
          <button onClick={() => handleFilter('earrings')}>Earrings</button>
          <button onClick={() => handleFilter('necklaces')}>Necklaces</button>
          <button onClick={() => handleFilter('bracelets')}>Bracelets</button>
          <button onClick={() => handleFilter('rings')}>Rings</button>
        </div>

        <div className="footer-links">
          <h3>Customer care</h3>
          <Link href="#">Shipping & delivery</Link>
          <Link href="#">Jewelry care</Link>
          <Link href="#">Returns & exchanges</Link>
        </div>

        <div className="footer-contact">
          <h3>Our studio</h3>
          <p>Berea, Kentucky, USA</p>
          <a href="mailto:hello@leavesofkentucky.com" style={{ borderBottom: '1px solid #6e8070', paddingBottom: '2px' }}>hello@leavesofkentucky.com</a>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Leaves of Kentucky</span>
          <span>Made with respect for nature</span>
        </div>
      </footer>
    </div>
  );
}
