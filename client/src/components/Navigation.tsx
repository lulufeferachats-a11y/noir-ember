import { useEffect, useState } from 'react';
import styles from './Navigation.module.css';

interface NavigationProps {
  restaurantName: string;
  onReserveClick: () => void;
}

export function Navigation({ restaurantName, onReserveClick }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#hero" className={styles.logo}>{restaurantName}</a>
      <ul className={styles.links}>
        <li><a href="#about">Our Story</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#hours">Hours</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button className={styles.cta} onClick={onReserveClick}>Reserve</button>
    </nav>
  );
}
