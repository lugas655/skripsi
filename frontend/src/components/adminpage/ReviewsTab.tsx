import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Rating } from 'primereact/rating';
import { InputSwitch } from 'primereact/inputswitch';
import { confirmDialog } from 'primereact/confirmdialog';
import adminService, { AdminTestimonial } from '../../services/adminService';

interface ReviewsTabProps {
  showToast: (severity: "success" | "info" | "warn" | "error", summary: string, detail: string) => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ showToast }) => {
  const queryClient = useQueryClient();

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: adminService.getTestimonials,
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: adminService.deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      showToast('success', 'Ulasan dihapus', 'Ulasan berhasil dihapus.');
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: adminService.toggleTestimonialFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
    },
  });

  return (
    <div className="admin2-card">
      <div className="admin2-card-head">
        <div>
          <p className="admin2-card-title">Ulasan pengguna</p>
          <p className="admin2-card-sub">Kelola testimoni yang tampil di halaman publik</p>
        </div>
      </div>
      <DataTable
        value={testimonials}
        loading={testimonialsLoading}
        className="admin2-datatable"
        paginator
        rows={10}
        rowHover
        emptyMessage="Belum ada ulasan."
      >
        <Column
          field="name"
          header="Pengguna"
          body={(t: AdminTestimonial) => (
            <span className="admin2-cell-name">{t.name}</span>
          )}
          sortable
          style={{ width: 160 }}
        />
        <Column
          field="text"
          header="Ulasan"
          body={(t: AdminTestimonial) => (
            <p className="admin2-review-text">"{t.text}"</p>
          )}
        />
        <Column
          field="rating"
          header="Rating"
          body={(t: AdminTestimonial) => (
            <Rating value={t.rating} readOnly cancel={false} className="admin2-rating" />
          )}
          sortable
          style={{ width: 140 }}
        />
        <Column
          header="Tampilkan"
          body={(t: AdminTestimonial) => (
            <div className="admin2-switch-cell">
              <InputSwitch
                checked={t.isFeatured}
                onChange={() => toggleFeatureMutation.mutate(t.id)}
                className="admin2-switch"
              />
              <span className="admin2-cell-muted" style={{ fontSize: 11 }}>
                {t.isFeatured ? 'Ya' : 'Tidak'}
              </span>
            </div>
          )}
          style={{ width: 110 }}
        />
        <Column
          header=""
          body={(t: AdminTestimonial) => (
            <button
              className="admin2-icon-btn admin2-icon-btn--danger"
              title="Hapus ulasan"
              onClick={() =>
                confirmDialog({
                  message: 'Hapus ulasan ini secara permanen?',
                  header: 'Hapus ulasan',
                  icon: 'pi pi-trash',
                  acceptClassName: 'p-button-danger',
                  accept: () => deleteTestimonialMutation.mutate(t.id),
                })
              }
            >
              <i className="pi pi-trash" />
            </button>
          )}
          style={{ width: 56 }}
        />
      </DataTable>
    </div>
  );
};

export default ReviewsTab;
