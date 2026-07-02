import styles from './About.module.css';

export function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.grid}>
        <div className={styles.image}>
          <div className={styles.frame}>
            <span className={styles.frameInner}>N&E</span>
          </div>
          <div className={styles.tag}>Since 2019</div>
        </div>
        <div className={styles.text}>
          <p className={styles.label}>Our Story</p>
          <h2 className={styles.title}>
            Crafted in<br />darkness, revealed<br />by <em>firelight</em>
          </h2>
          <div className={styles.divider} />
          <p>
            Noir &amp; Ember was born from a singular obsession: the transformative power of fire.
            Our chef, Étienne Morel, spent years in the kitchens of Paris before finding his voice
            in the ancient art of ember cooking.
          </p>
          <p>
            Every dish is a meditation on contrast — the char and the tender, the bitter and the
            sweet, the shadow and the glow. We invite you to surrender to the experience.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNum}>2</div>
              <div className={styles.statLabel}>Michelin Stars</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>47</div>
              <div className={styles.statLabel}>Signature Dishes</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>800+</div>
              <div className={styles.statLabel}>Wine Labels</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
