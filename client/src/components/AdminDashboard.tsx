import { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import { AdminLogin } from './AdminLogin';
import { ReservationEditModal } from './ReservationEditModal';
import { useAdmin } from '../hooks/useAdmin';
import type { Reservation, ReservationStatus } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

const FILTERS: Array<{ value: ReservationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export function AdminDashboard({ isOpen, onClose, restaurantName }: AdminDashboardProps) {
  const admin = useAdmin();
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (isOpen && admin.isAuthenticated) {
      admin.refresh(filter === 'all' ? undefined : filter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, admin.isAuthenticated, filter]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = async (id: number) => {
    if (window.confirm(`Delete reservation #${id}? This cannot be undone.`)) {
      await admin.removeReservation(id);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        {!admin.isAuthenticated ? (
          <>
            <div className={styles.header}>
              <span className={styles.title}>{restaurantName} Admin</span>
              <button className={styles.closeBtn} onClick={onClose}>Close</button>
            </div>
            <AdminLogin onLogin={admin.login} error={admin.error} />
          </>
        ) : (
          <>
            <div className={styles.header}>
              <span className={styles.title}>{restaurantName} — Reservations</span>
              <button className={styles.closeBtn} onClick={onClose}>Close</button>
            </div>

            {admin.stats && (
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statNum}>{admin.stats.total}</div>
                  <div className={styles.statLabel}>Total</div>
                </div>
                <div className={styles.stat}>
                  <div className={`${styles.statNum} ${styles.gold}`}>{admin.stats.pending}</div>
                  <div className={styles.statLabel}>Pending</div>
                </div>
                <div className={styles.stat}>
                  <div className={`${styles.statNum} ${styles.success}`}>{admin.stats.confirmed}</div>
                  <div className={styles.statLabel}>Confirmed</div>
                </div>
                <div className={styles.stat}>
                  <div className={`${styles.statNum} ${styles.danger}`}>{admin.stats.cancelled}</div>
                  <div className={styles.statLabel}>Cancelled</div>
                </div>
              </div>
            )}

            <div className={styles.body}>
              <div className={styles.filters}>
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
                    onClick={() => setFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {admin.isLoading ? (
                <div className={styles.empty}>Loading…</div>
              ) : admin.reservations.length === 0 ? (
                <div className={styles.empty}>No reservations found.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th><th>Guest</th><th>Date &amp; Time</th><th>Guests</th>
                        <th>Contact</th><th className={styles.hideOnMobile}>Notes</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admin.reservations.map((r) => (
                        <tr key={r.id}>
                          <td className={styles.idCell}>#{r.id}</td>
                          <td className={styles.nameCell}>{r.customerName}</td>
                          <td>
                            {formatDate(r.reservationDate)}<br />
                            <span className={styles.goldText}>{formatTime(r.reservationTime)}</span>
                          </td>
                          <td className={styles.centerCell}>{r.guests}</td>
                          <td>
                            {r.phone}
                            {r.email && <><br /><span className={styles.dimText}>{r.email}</span></>}
                          </td>
                          <td className={`${styles.notesCell} ${styles.hideOnMobile}`}>{r.notes || '—'}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[`status_${r.status}`]}`}>{r.status}</span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {r.status !== 'confirmed' && (
                                <button className={`${styles.actionBtn} ${styles.confirm}`} onClick={() => admin.updateStatus(r.id, 'confirmed')}>Confirm</button>
                              )}
                              {r.status !== 'cancelled' && (
                                <button className={`${styles.actionBtn} ${styles.cancelAction}`} onClick={() => admin.updateStatus(r.id, 'cancelled')}>Cancel</button>
                              )}
                              <button className={styles.actionBtn} onClick={() => setEditingReservation(r)}>Edit</button>
                              <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => handleDelete(r.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ReservationEditModal
        reservation={editingReservation}
        onClose={() => setEditingReservation(null)}
        onSave={admin.saveReservation}
      />
    </div>
  );
}
