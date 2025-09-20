import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Property } from '../types';

interface PropertyManagementProps {
  properties: Property[];
  onPropertyUpdate: () => void;
}

interface PropertyFormData {
  title: string;
  description: string;
  price_per_night: number;
  distance_from_venue: string;
  amenities: string[];
  total_units: number;
  available_units: number;
  image_url: string;
  image_urls: string[];
}

export function PropertyManagement({ properties, onPropertyUpdate }: PropertyManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price_per_night: 0,
    distance_from_venue: '',
    amenities: [],
    total_units: 1,
    available_units: 1,
    image_url: '',
    image_urls: []
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price_per_night: 0,
      distance_from_venue: '',
      amenities: [],
      total_units: 1,
      available_units: 1,
      image_url: '',
      image_urls: []
    });
  };

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setFormData({
      title: property.title,
      description: property.description,
      price_per_night: property.price_per_night,
      distance_from_venue: property.distance_from_venue,
      amenities: property.amenities,
      total_units: property.total_units,
      available_units: property.available_units,
      image_url: property.image_url,
      image_urls: property.image_urls || []
    });
  };

  const handleSave = async (propertyId?: string) => {
    setLoading(true);
    try {
      if (propertyId) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(formData)
          .eq('id', propertyId);
        if (error) throw error;
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([formData]);
        if (error) throw error;
      }

      onPropertyUpdate();
      setEditingId(null);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      onPropertyUpdate();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const handleAmenitiesChange = (amenityText: string) => {
    const amenities = amenityText.split(',').map(a => a.trim()).filter(a => a);
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleImageUrlsChange = (urlText: string) => {
    const urls = urlText.split(',').map(url => url.trim()).filter(url => url);
    setFormData(prev => ({ ...prev, image_urls: urls }));
  };
  const PropertyForm = ({ property, isNew = false }: { property?: Property; isNew?: boolean }) => (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance from Venue</label>
          <input
            type="text"
            value={formData.distance_from_venue}
            onChange={(e) => setFormData(prev => ({ ...prev, distance_from_venue: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2.5km from venue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₦)</label>
          <input
            type="number"
            value={formData.price_per_night}
            onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
          <input
            type="number"
            value={formData.total_units}
            onChange={(e) => setFormData(prev => ({ ...prev, total_units: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Units</label>
          <input
            type="number"
            value={formData.available_units}
            onChange={(e) => setFormData(prev => ({ ...prev, available_units: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label>
          <input
            type="text"
            value={formData.amenities.join(', ')}
            onChange={(e) => handleAmenitiesChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="WiFi, AC, Parking, Kitchen"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Images (comma-separated URLs)
        </label>
        <input
          type="text"
          value={formData.image_urls.join(', ')}
          onChange={(e) => handleImageUrlsChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image2.jpg, https://example.com/image3.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add multiple image URLs separated by commas for the image carousel
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancel
        </button>
        <button
          onClick={() => handleSave(property?.id)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 inline mr-1" />
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </button>
      </div>

      {showAddForm && <PropertyForm isNew />}

      <div className="grid gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {editingId === property.id ? (
              <div className="p-6">
                <PropertyForm property={property} />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.distance_from_venue}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(property)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <p className="text-sm text-gray-600 mb-3">{property.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price per night:</span>
                      <span className="font-semibold">{formatPrice(property.price_per_night)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total units:</span>
                      <span>{property.total_units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available units:</span>
                      <span className={`font-semibold ${
                        property.available_units === 0 ? 'text-red-600' : 
                        property.available_units <= 2 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {property.available_units}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {properties.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No properties found
          </div>
        )}
      </div>
    </div>
  );
}