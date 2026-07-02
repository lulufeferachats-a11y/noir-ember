import { useEffect, useState } from 'react';
import styles from './ReservationEditModal.module.css';
import type { Reservation, ReservationStatus } from '../types';

interface ReservationEditModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onSave: (id: number, updates: Partial<Reservation>) => Promise<void>;
}

interface FormState {
  customerName: string;
  guests: string;
  reservationDate: string;
  reservationTime: string;
  phone: string;
  email: string;
  notes: string;
  status: ReservationStatus;
}

const EMPTY_FORM: FormState = {
  customerName: '', guests: '', reservationDate: '', reservationTime: '',
  phone: '', email: '', notes: '', status: 'pending',
};

export function ReservationEditModal({ reservation, onClose, onSave }: ReservationEditModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservation) {
      setForm({
        customerName: reservation.customerName,
        guests: String(reservation.guests),
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime.slice(0, 5),
        phone: reservation.phone,
        email: reservation.email ?? '',
        notes: reservation.notes ?? '',
        status: reservation.status,
      });
      setError(null);
    }
  }, [reservation]);

  if (!reservation) return null;

  const update = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.guests || !form.reservationDate || !form.reservationTime || !form.phone.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(reservation.id, {
        customerName: form.customerName.trim(),
        guests: Number(form.guests),
        reservationDate: form.reservationDate,
        reservationTime: form.reservationTime,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.box} role="dialog" aria-label="Edit reservation">
        <h3 className={styles.title}>Edit Reservation</h3>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editName">Name</label>
            <input id="editName" className={styles.input} value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editGuests">Guests</label>
            <input id="editGuests" className={styles.input} type="number" min={1} max={50} value={form.guests} onChange={(e) => update('guests', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editDate">Date</label>
            <input id="editDate" className={styles.input} type="date" value={form.reservationDate} onChange={(e) => update('reservationDate', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editTime">Time</label>
            <input id="editTime" className={styles.input} type="time" value={form.reservationTime} onChange={(e) => update('reservationTime', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editPhone">Phone</label>
            <input id="editPhone" className={styles.input} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editEmail">Email</label>
            <input id="editEmail" className={styles.input} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="editNotes">Notes</label>
            <input id="editNotes" className={styles.input} placeholder="Special requests..." value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="editStatus">Status</label>
            <select id="editStatus" className={styles.input} value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={styles.save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
