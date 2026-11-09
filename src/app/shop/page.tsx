import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import './shop.css';

// Always read the live inventory (new pieces, sold pieces) instead of freezing it at build time.
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="site-wrapper">
      <Header />

      <main className="section-shell shp-main">
        <div className="shop-top shp-top">
          <div className="section-heading">
            <span className="eyebrow">THE COLLECTION</span>
            <h2>Jewelry with a story</h2>
          </div>
          <p className="max-w-md text-[var(--muted)] font-[family-name:var(--serif)] text-lg">
            Every leaf leaves its own one-of-a-kind impression in copper.
            Find the piece that speaks to you from our Kentucky studio.
          </p>
        </div>

        <div className="products-grid">
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {(!products || products.length === 0) && (
          <div className="py-32 text-center">
            <p className="font-[family-name:var(--serif)] text-2xl text-[var(--muted)]">
              Our studio is currently preparing new pieces...
            </p>
          </div>
        )}
      </main>

      <footer className="site-footer">
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
        <div className="footer-bottom">
          <span>© 2026 Leaves of Kentucky</span>
          <span>Made with respect for nature</span>
        </div>
      </footer>
    </div>
  );
}
