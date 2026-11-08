"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import './admin.css';

interface AddProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Earrings',
    status: 'available'
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError('');

    try {
      if (images.length === 0) {
        throw new Error('Please upload at least one image');
      }

      // 1. Upload images to Supabase Storage
      const imageUrls = [];
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // 2. Insert product record
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          status: formData.status,
          images: imageUrls
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-overlay">
      <div className="adm-modal">
        <div className="adm-modal-head">
          <div>
            <h2 className="adm-modal-title">Add New Piece</h2>
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
                    <option>Earrings</option>
                    <option>Necklaces</option>
                    <option>Bracelets</option>
                    <option>Home Decor</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="adm-stack">
              <div>
                <label className="adm-label">Gallery Images</label>
                <div className="adm-gallery">
                  {previews.map((preview, index) => (
                    <div key={index} className="adm-gal-item">
                      <img src={preview} alt="" />
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
                  {previews.length < 6 && (
                    <label className="adm-upload">
                      <Upload size={20} />
                      <span>UPLOAD</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
                <p className="adm-hint">Up to 6 high-resolution images.</p>
              </div>

              <div className="adm-submit-wrap">
                <button disabled={loading} type="submit" className="adm-btn adm-btn-block">
                  {loading ? (
                    <>
                      <Loader2 size={16} className="adm-spin-icon" />
                      PROCESSING...
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
