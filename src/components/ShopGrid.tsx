"use client";

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';

// Display order of the store categories. Anything not listed here is appended alphabetically.
const ORDER = [
  'art shows',
  'bracelets',
  'brooches',
  'earrings',
  'hair pins',
  'jewelry sets',
  'necklaces',
  'pendants',
  'rings',
];

const norm = (c?: string | null) => (c ?? '').trim().toLowerCase();
const label = (c: string) => c.replace(/\b\w/g, (ch) => ch.toUpperCase());

export function ShopGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState('all');

  // Only categories that actually contain pieces get a button, so no dead ends.
  const categories = useMemo(() => {
    const present = Array.from(new Set(products.map((p) => norm(p.category)).filter(Boolean)));
    return present.sort((a, b) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [products]);

  const visible = active === 'all' ? products : products.filter((p) => norm(p.category) === active);

  return (
    <>
      {categories.length > 1 && (
        <nav className="shp-filters" aria-label="Filter by category">
          <button
            type="button"
            className={`shp-filter ${active === 'all' ? 'is-active' : ''}`}
            onClick={() => setActive('all')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`shp-filter ${active === c ? 'is-active' : ''}`}
              onClick={() => setActive(c)}
            >
              {label(c)}
            </button>
          ))}
        </nav>
      )}

      <div className="products-grid">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
