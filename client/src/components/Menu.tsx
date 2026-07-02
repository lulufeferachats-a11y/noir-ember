import { useState } from 'react';
import styles from './Menu.module.css';
import type { MenuCategory } from '../types';

interface MenuProps {
  categories: MenuCategory[];
}

export function Menu({ categories }: MenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!categories.length) return null;

  return (
    <section id="menu" className={styles.menu}>
      <div className={styles.header}>
        <p className={styles.label}>Culinary Experience</p>
        <h2 className={styles.title}>The Menu</h2>
        <div className={styles.divider} />
        <div className={styles.tabs}>
          {categories.map((cat, i) => (
            <button
              key={cat.category}
              className={`${styles.tab} ${i === activeIndex ? styles.tabActive : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              {cat.category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {categories[activeIndex].items.map((item) => (
          <div key={item.name} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemName}>
                {item.name}
                {item.tags?.map((tag) => (
                  <span key={tag} className={styles.badge}>{tag}</span>
                ))}
              </span>
              <span className={styles.itemPrice}>{item.price}</span>
            </div>
            <p className={styles.itemDesc}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
