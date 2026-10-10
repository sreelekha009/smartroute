import React, { useEffect, useState } from 'react';
import { ApiClient, extractErrorMessage } from '../api/client';
import { LocationDto } from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { EmptyState } from '../components/common/EmptyState';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<LocationDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getLocations();
      setLocations(data);
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', latitude: '53.3498', longitude: '-6.2603', description: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: LocationDto) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
      description: loc.description || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Location name is required';

    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }

    const lon = parseFloat(formData.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        description: formData.description.trim() || undefined,
      };

      if (editingId) {
        await ApiClient.updateLocation(editingId, payload);
        success('Location updated successfully');
      } else {
        await ApiClient.createLocation(payload);
        success('New location registered');
      }

      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ApiClient.deleteLocation(deleteTarget.id);
      success(`Location "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchLocations();
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <Card>
        <CardHeader
          title="Network Locations Directory"
          subtitle={`Total of ${locations.length} logistics centers and waypoints in database`}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Location
            </Button>
          }
        />
        <CardContent className="p-5 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading locations...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No locations found"
              description="No matching locations found for your search query."
            />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Location Name</th>
                    <th className="p-3">Latitude</th>
                    <th className="p-3">Longitude</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>{loc.name}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{loc.latitude.toFixed(4)}</td>
                      <td className="p-3 font-mono text-slate-600">{loc.longitude.toFixed(4)}</td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{loc.description || '—'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(loc)}
                          className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Edit location"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(loc)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Delete location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Location' : 'Register New Location'}
        subtitle="Specify valid decimal coordinates (-90 to 90 lat, -180 to 180 lon)"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="e.g., South Dublin Distribution Hub"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              error={formErrors.latitude}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              error={formErrors.longitude}
              required
            />
          </div>

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Facility details, dock gates, or commercial district"
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              {editingId ? 'Save Changes' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Confirm Location Deletion</span>
          </div>
        }
        subtitle="This action cannot be undone"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
            Note: Locations linked to existing roads cannot be deleted until connecting roads are removed.
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete Location
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
