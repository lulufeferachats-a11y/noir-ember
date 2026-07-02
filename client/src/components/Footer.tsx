import styles from './Footer.module.css';

interface FooterProps {
  restaurantName: string;
  address: string;
}

export function Footer({ restaurantName, address }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>{restaurantName}</div>
      <div className={styles.tagline}>Where darkness meets flame</div>
      <ul className={styles.links}>
        <li><a href="#about">Our Story</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#hours">Hours</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <p className={styles.copy}>© {new Date().getFullYear()} {restaurantName}. All rights reserved. {address}</p>
    </footer>
  );
}
