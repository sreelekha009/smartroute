import React, { useEffect, useState } from 'react';
import { ApiClient, extractErrorMessage } from '../api/client';
import { RoadDto, LocationDto } from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import { EmptyState } from '../components/common/EmptyState';
import {
  GitFork,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';

export const RoadsPage: React.FC = () => {
  const [roads, setRoads] = useState<RoadDto[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sourceLocationId: '',
    destinationLocationId: '',
    distanceKm: '2.5',
    durationMinutes: '6.0',
    bidirectional: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<RoadDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rds, locs] = await Promise.all([
        ApiClient.getRoads(),
        ApiClient.getLocations(),
      ]);
      setRoads(rds);
      setLocations(locs);
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      sourceLocationId: locations[0]?.id || '',
      destinationLocationId: locations[1]?.id || '',
      distanceKm: '3.0',
      durationMinutes: '7.0',
      bidirectional: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (road: RoadDto) => {
    setEditingId(road.id);
    setFormData({
      sourceLocationId: road.sourceLocationId,
      destinationLocationId: road.destinationLocationId,
      distanceKm: road.distanceKm.toString(),
      durationMinutes: road.durationMinutes ? road.durationMinutes.toString() : '',
      bidirectional: road.bidirectional,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!editingId) {
      if (!formData.sourceLocationId) errors.sourceLocationId = 'Source is required';
      if (!formData.destinationLocationId) errors.destinationLocationId = 'Destination is required';
      if (formData.sourceLocationId === formData.destinationLocationId) {
        errors.destinationLocationId = 'Source and destination must be distinct';
      }
    }

    const dist = parseFloat(formData.distanceKm);
    if (isNaN(dist) || dist < 0) {
      errors.distanceKm = 'Distance must be a non-negative number';
    }

    if (formData.durationMinutes) {
      const dur = parseFloat(formData.durationMinutes);
      if (isNaN(dur) || dur < 0) {
        errors.durationMinutes = 'Duration must be a non-negative number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await ApiClient.updateRoad(editingId, {
          distanceKm: parseFloat(formData.distanceKm),
          durationMinutes: formData.durationMinutes ? parseFloat(formData.durationMinutes) : undefined,
          bidirectional: formData.bidirectional,
        });
        success('Road updated successfully');
      } else {
        await ApiClient.createRoad({
          sourceLocationId: formData.sourceLocationId,
          destinationLocationId: formData.destinationLocationId,
          distanceKm: parseFloat(formData.distanceKm),
          durationMinutes: formData.durationMinutes ? parseFloat(formData.durationMinutes) : undefined,
          bidirectional: formData.bidirectional,
        });
        success('New road connection added');
      }

      setIsModalOpen(false);
      fetchData();
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
      await ApiClient.deleteRoad(deleteTarget.id);
      success('Road segment removed from network');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
  }));

  const filtered = roads.filter(
    (r) =>
      r.sourceLocationName.toLowerCase().includes(search.toLowerCase()) ||
      r.destinationLocationName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <Card>
        <CardHeader
          title="Roads & Graph Connections"
          subtitle={`Total of ${roads.length} physical road segments in database`}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Road Connection
            </Button>
          }
        />
        <CardContent className="p-5 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by endpoint names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading roads...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={GitFork}
              title="No road segments found"
              description="No road connections match your search filter."
            />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Source Location</th>
                    <th className="p-3">Direction</th>
                    <th className="p-3">Destination Location</th>
                    <th className="p-3">Distance (km)</th>
                    <th className="p-3">Duration (mins)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-medium text-slate-900">{r.sourceLocationName}</td>
                      <td className="p-3">
                        {r.bidirectional ? (
                          <Badge variant="teal" size="sm" className="gap-1">
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>Two-Way</span>
                          </Badge>
                        ) : (
                          <Badge variant="slate" size="sm" className="gap-1">
                            <ArrowRight className="w-3 h-3" />
                            <span>One-Way</span>
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 font-medium text-slate-900">{r.destinationLocationName}</td>
                      <td className="p-3 font-mono font-semibold text-brand-600">{r.distanceKm.toFixed(1)} km</td>
                      <td className="p-3 font-mono text-slate-500">{r.durationMinutes ? `${r.durationMinutes.toFixed(0)} min` : '—'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Edit road"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Delete road"
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
        title={editingId ? 'Edit Road Segment' : 'Add Road Connection'}
        subtitle="Configure endpoints, road distance weight, and directional flow"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingId && (
            <div className="space-y-3">
              <Select
                label="Source Location"
                value={formData.sourceLocationId}
                onChange={(e) => setFormData({ ...formData, sourceLocationId: e.target.value })}
                options={locationOptions}
                error={formErrors.sourceLocationId}
                required
              />

              <Select
                label="Destination Location"
                value={formData.destinationLocationId}
                onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}
                options={locationOptions}
                error={formErrors.destinationLocationId}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Distance (km)"
              type="number"
              step="any"
              value={formData.distanceKm}
              onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
              error={formErrors.distanceKm}
              required
            />

            <Input
              label="Duration (Minutes)"
              type="number"
              step="any"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              error={formErrors.durationMinutes}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={formData.bidirectional}
              onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <span className="font-medium">Bidirectional (Both forward and return travel permitted)</span>
          </label>

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
              {editingId ? 'Save Road' : 'Create Road'}
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
            <span>Remove Road Segment</span>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete the road between{' '}
            <strong>{deleteTarget?.sourceLocationName}</strong> and{' '}
            <strong>{deleteTarget?.destinationLocationName}</strong>?
          </p>
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
              Delete Road
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
