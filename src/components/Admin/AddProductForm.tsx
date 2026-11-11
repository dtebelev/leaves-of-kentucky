"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, Plus, Check } from 'lucide-react';
import './admin.css';

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  /** When given, the form edits this piece instead of creating a new one. */
  product?: any;
}

// Stored in lowercase (the shop shows them in capitals); the home page filters on these exact values.
const CATEGORIES = [
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
const MAX_IMAGES = 6;

type GalleryItem = { url: string; file?: File };

export function AddProductForm({ onClose, onSuccess, product }: ProductFormProps) {
  const isEdit = Boolean(product);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price != null ? String(product.price) : '',
    category: String(product?.category ?? 'earrings').toLowerCase(),
    status: product?.status === 'sold' ? 'sold' : 'available',
    is_unique: product?.is_unique !== false,
  });
  const [gallery, setGallery] = useState<GalleryItem[]>(
    Array.isArray(product?.images) ? product.images.map((url: string) => ({ url })) : []
  );
  const [uploadError, setUploadError] = useState('');

  const categories = CATEGORIES.includes(formData.category)
    ? CATEGORIES
    : [...CATEGORIES, formData.category];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGallery(prev =>
        [...prev, ...files.map(file => ({ url: URL.createObjectURL(file), file }))].slice(0, MAX_IMAGES)
      );
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError('');

    try {
      const price = parseFloat(formData.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error('Please enter a price greater than 0');
      }
      if (gallery.length === 0) {
        throw new Error('Please add at least one image');
      }

      // 1. Upload only the newly added images to Supabase Storage; keep existing ones as they are.
      const imageUrls: string[] = [];
      for (const item of gallery) {
        if (!item.file) {
          imageUrls.push(item.url);
          continue;
        }
        const fileExt = item.file.name.split('.').pop();
        const filePath = `products/${crypto.randomUUID()}.${fileExt}`;

        const { error: storageError } = await supabase.storage
          .from('product-images')
          .upload(filePath, item.file);
        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      // 2. Save the product record
      const record = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category,
        status: formData.status,
        is_unique: formData.is_unique,
        images: imageUrls,
      };

      if (isEdit) {
        const { data, error: updateError } = await supabase
          .from('products')
          .update(record)
          .eq('id', product.id)
          .select('id');
        if (updateError) throw updateError;
        if (!data || data.length === 0) {
          throw new Error('Nothing was saved. Please sign in again and retry.');
        }
      } else {
        const { error: insertError } = await supabase.from('products').insert(record);
        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-overlay">
      <div className="adm-modal">
        <div className="adm-modal-head">
          <div>
            <h2 className="adm-modal-title">{isEdit ? 'Edit Piece' : 'Add New Piece'}</h2>
            <p className="adm-modal-sub">Inventory Management</p>
          </div>
          <button type="button" onClick={onClose} className="adm-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adm-form">
          {uploadError && <div className="adm-error">{uploadError}</div>}

          <div className="adm-cols">
            <div className="adm-stack">
              <div>
                <label className="adm-label">Item Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="adm-input"
                  placeholder="e.g. Copper Fern Earring"
                />
              </div>

              <div>
                <label className="adm-label">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="adm-textarea"
                  placeholder="Describe the materials and inspiration..."
                />
              </div>

              <div className="adm-row2">
                <div>
                  <label className="adm-label">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.5"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="adm-input"
                  />
                </div>
                <div>
                  <label className="adm-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="adm-select"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c.replace(/\b\w/g, (ch) => ch.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-row2">
                <div>
                  <label className="adm-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="adm-select"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="adm-label">One-of-a-kind</label>
                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={formData.is_unique}
                      onChange={e => setFormData({ ...formData, is_unique: e.target.checked })}
                    />
                    <span>Only one exists (max 1 per order)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="adm-stack">
              <div>
                <label className="adm-label">Gallery Images</label>
                <div className="adm-gallery">
                  {gallery.map((item, index) => (
                    <div key={item.url + index} className="adm-gal-item">
                      <img src={item.url} alt="" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="adm-gal-remove"
                        aria-label="Remove image"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {gallery.length < MAX_IMAGES && (
                    <label className="adm-upload">
                      <Upload size={20} />
                      <span>UPLOAD</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
                <p className="adm-hint">Up to {MAX_IMAGES} images. The first one is the main photo.</p>
              </div>

              <div className="adm-submit-wrap">
                <button disabled={loading} type="submit" className="adm-btn adm-btn-block">
                  {loading ? (
                    <>
                      <Loader2 size={16} className="adm-spin-icon" />
                      SAVING...
                    </>
                  ) : isEdit ? (
                    <>
                      <Check size={16} />
                      SAVE CHANGES
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      PUBLISH TO STORE
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
