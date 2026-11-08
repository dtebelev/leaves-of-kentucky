"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border border-[var(--line)] shadow-2xl">
        <div className="p-8 border-b border-[var(--line)] flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-[family-name:var(--serif)] text-[24px] font-medium leading-tight">Add New Piece</h2>
            <p className="text-[11px] text-[var(--muted)] tracking-[1px] uppercase mt-1">Inventory Management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[13px]">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[1.5px] text-[var(--muted)] uppercase mb-2">Item Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b border-[var(--line)] py-2 focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px]"
                  placeholder="e.g. Copper Fern Earring"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[1.5px] text-[var(--muted)] uppercase mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-[var(--line)] p-3 focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px] resize-none"
                  placeholder="Describe the materials and inspiration..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[1.5px] text-[var(--muted)] uppercase mb-2">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border-b border-[var(--line)] py-2 focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[1.5px] text-[var(--muted)] uppercase mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border-b border-[var(--line)] py-2 focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px] bg-transparent"
                  >
                    <option>Earrings</option>
                    <option>Necklaces</option>
                    <option>Bracelets</option>
                    <option>Home Decor</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[1.5px] text-[var(--muted)] uppercase mb-2">Gallery Images</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 group">
                      <Image src={preview} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {previews.length < 6 && (
                    <label className="aspect-square border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent)] hover:bg-orange-50/30 transition-all text-[var(--muted)]">
                      <Upload size={20} className="mb-2" />
                      <span className="text-[9px] font-bold tracking-[1px]">UPLOAD</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-[var(--muted)] italic">Up to 6 high-resolution images.</p>
              </div>

              <div className="pt-10">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[var(--green)] text-white py-4 text-[11px] font-bold tracking-[2px] uppercase hover:bg-[var(--green-deep)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
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
