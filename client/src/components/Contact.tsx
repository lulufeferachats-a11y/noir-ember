import styles from './Contact.module.css';

interface ContactProps {
  address: string;
  phone: string;
  email: string;
  onChatClick: () => void;
}

export function Contact({ address, phone, email, onChatClick }: ContactProps) {
  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.grid}>
        <div>
          <p className={styles.label}>Find Us</p>
          <h2 className={styles.title}>Contact &amp;<br />Location</h2>
          <div className={styles.divider} />
          <div className={styles.info}>
            <div className={styles.detail}>
              <div className={styles.icon} aria-hidden="true">📍</div>
              <div className={styles.detailText}>
                <h4>Address</h4>
                <p>{address}</p>
              </div>
            </div>
            <div className={styles.detail}>
              <div className={styles.icon} aria-hidden="true">📞</div>
              <div className={styles.detailText}>
                <h4>Reservations</h4>
                <p>{phone}</p>
              </div>
            </div>
            <div className={styles.detail}>
              <div className={styles.icon} aria-hidden="true">✉️</div>
              <div className={styles.detailText}>
                <h4>Email</h4>
                <p>{email}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Reserve Your Evening</p>
          <p className={styles.cardText}>
            For private events, group bookings of 8+, or chef's table enquiries, our team is at your service.
          </p>
          <button className={styles.cardCta} onClick={onChatClick}>Chat with Us</button>
        </div>
      </div>
    </section>
  );
}
