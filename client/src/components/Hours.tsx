import styles from './Hours.module.css';
import type { RestaurantHour } from '../types';

interface HoursProps {
  hours: RestaurantHour[];
}

export function Hours({ hours }: HoursProps) {
  return (
    <section id="hours" className={styles.hours}>
      <div className={styles.inner}>
        <p className={styles.label}>When We Welcome You</p>
        <h2 className={styles.title}>Opening Hours</h2>
        <div className={styles.divider} />
        <div className={styles.grid}>
          {hours.map((h) => (
            <div key={h.day} className={styles.row}>
              <span className={styles.day}>{h.day}</span>
              <span className={`${styles.time} ${h.closed ? styles.closed : ''}`}>
                {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
              </span>
            </div>
          ))}
        </div>
        <p className={styles.note}>Last seating 90 minutes before closing. Kitchen closes at posted time.</p>
      </div>
    </section>
  );
}
