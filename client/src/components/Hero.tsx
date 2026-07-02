import styles from './Hero.module.css';

interface HeroProps {
  restaurantName: string;
  onReserveClick: () => void;
}

export function Hero({ restaurantName, onReserveClick }: HeroProps) {
  const [first, second] = restaurantName.split('&').map((s) => s.trim());

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.bg} />
      <div className={styles.line} />
      <div className={styles.content}>
        <p className={styles.eyebrow}>Est. 2019 — Paris, France</p>
        <h1 className={styles.title}>
          {first}
          {second && (
            <>
              <br /><em>&amp;</em><br />{second}
            </>
          )}
        </h1>
        <p className={styles.sub}>Where darkness meets flame. A gastronomic journey through obsidian nights and ember-kissed cuisine.</p>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={onReserveClick}>Reserve a Table</button>
          <button
            className={styles.ghost}
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Menu
          </button>
        </div>
      </div>
      <div className={styles.scrollHint}>
        <span>Discover</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
