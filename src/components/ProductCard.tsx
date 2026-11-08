'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.status === 'available') {
      addToCart(product, 1);
    }
  };

  return (
    <article className="product-card group">
      <Link href={`/product/${product.id}`} className="block">
        <div className="product-image">
          {product.status === 'sold' && (
            <span className="product-badge">SOLD OUT</span>
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="quick-view">
            VIEW DETAILS
          </div>
        </div>

        <div className="product-info">
          <span className="product-category">
            {product.category.toUpperCase()}
          </span>
          <h3>{product.name}</h3>
        </div>
      </Link>

      <div className="product-bottom px-1">
        <span className="product-price">
          {money(product.price)}
        </span>
        {product.status === 'available' ? (
          <button
            onClick={handleAddToCart}
            className="add-btn"
          >
            ADD TO BAG +
          </button>
        ) : (
          <span className="text-[9px] font-semibold text-[#8a9087]">
            SOLD OUT
          </span>
        )}
      </div>
    </article>
  );
}
