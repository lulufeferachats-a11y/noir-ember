import { useState, useEffect } from 'react';
import styles from './RestaurantContentEditor.module.css';
import type { RestaurantConfig, RestaurantHour, MenuCategory, MenuItem } from '../types';
import type { AdminCredentials } from '../services/adminService';
import { updateRestaurantSettings } from '../services/adminService';

interface RestaurantContentEditorProps {
  restaurant: RestaurantConfig;
  credentials: AdminCredentials;
  onSaved: () => void;
}

export function RestaurantContentEditor({ restaurant, credentials, onSaved }: RestaurantContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'menu' | 'capacity' | 'infos'>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(restaurant.name);
  const [address, setAddress] = useState(restaurant.address);
  const [phone, setPhone] = useState(restaurant.phone);
  const [email, setEmail] = useState(restaurant.email);
  const [hours, setHours] = useState<RestaurantHour[]>(restaurant.settings.hours || []);
  const [menu, setMenu] = useState<MenuCategory[]>(restaurant.settings.menu || []);
  const [maxCapacity, setMaxCapacity] = useState(String(restaurant.settings.maxCapacityPerSlot ?? 40));
  const [slotDuration, setSlotDuration] = useState(String(restaurant.settings.slotDurationMinutes ?? 90));
  const [parking, setParking] = useState(restaurant.settings.parking ?? '');
  const [terrace, setTerrace] = useState(restaurant.settings.terrace ?? '');
  const [dressCode, setDressCode] = useState(restaurant.settings.dressCode ?? '');
  const [vegetarianInfo, setVegetarianInfo] = useState(restaurant.settings.vegetarianInfo ?? '');
  const [veganInfo, setVeganInfo] = useState(restaurant.settings.veganInfo ?? '');
  const [allergyInfo, setAllergyInfo] = useState(restaurant.settings.allergyInfo ?? '');
  const [wineInfo, setWineInfo] = useState(restaurant.settings.wineInfo ?? '');
  const [privateEvents, setPrivateEvents] = useState(restaurant.settings.privateEvents ?? '');

  useEffect(() => {
    setName(restaurant.name);
    setAddress(restaurant.address);
    setPhone(restaurant.phone);
    setEmail(restaurant.email);
    setHours(restaurant.settings.hours || []);
    setMenu(restaurant.settings.menu || []);
    setMaxCapacity(String(restaurant.settings.maxCapacityPerSlot ?? 40));
    setSlotDuration(String(restaurant.settings.slotDurationMinutes ?? 90));
    setParking(restaurant.settings.parking ?? '');
    setTerrace(restaurant.settings.terrace ?? '');
    setDressCode(restaurant.settings.dressCode ?? '');
    setVegetarianInfo(restaurant.settings.vegetarianInfo ?? '');
    setVeganInfo(restaurant.settings.veganInfo ?? '');
    setAllergyInfo(restaurant.settings.allergyInfo ?? '');
    setWineInfo(restaurant.settings.wineInfo ?? '');
    setPrivateEvents(restaurant.settings.privateEvents ?? '');
  }, [restaurant]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateRestaurantSettings(credentials, {
        name,
        address,
        phone,
        email,
        settings: {
          ...restaurant.settings,
          hours,
          menu,
          maxCapacityPerSlot: parseInt(maxCapacity) || 40,
          slotDurationMinutes: parseInt(slotDuration) || 90,
          parking,
          terrace,
          dressCode,
          vegetarianInfo,
          veganInfo,
          allergyInfo,
          wineInfo,
          privateEvents,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (index: number, field: keyof RestaurantHour, value: string | boolean) => {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };
  const addHour = () => setHours(prev => [...prev, { day: '', open: '19:00', close: '23:00', closed: false }]);
  const removeHour = (index: number) => setHours(prev => prev.filter((_, i) => i !== index));

  const addCategory = () => setMenu(prev => [...prev, { category: 'New Category', items: [] }]);
  const updateCategory = (catIndex: number, name: string) => setMenu(prev => prev.map((c, i) => i === catIndex ? { ...c, category: name } : c));
  const removeCategory = (catIndex: number) => setMenu(prev => prev.filter((_, i) => i !== catIndex));
  const addItem = (catIndex: number) => setMenu(prev => prev.map((c, i) => i === catIndex ? { ...c, items: [...c.items, { name: '', description: '', price: '' }] } : c));
  const updateItem = (catIndex: number, itemIndex: number, field: keyof MenuItem, value: string) => setMenu(prev => prev.map((c, i) => i === catIndex ? { ...c, items: c.items.map((item, j) => j === itemIndex ? { ...item, [field]: value } : item) } : c));
  const removeItem = (catIndex: number, itemIndex: number) => setMenu(prev => prev.map((c, i) => i === catIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c));

  const TABS = [
    { key: 'general', label: '🏠 General' },
    { key: 'hours', label: '🕐 Hours' },
    { key: 'menu', label: '🍽️ Menu' },
    { key: 'capacity', label: '👥 Capacity' },
    { key: 'infos', label: '💬 Chatbot Info' },
  ] as const;

  return (
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <h3 className={styles.editorTitle}>Restaurant Content</h3>
        <div className={styles.saveArea}>
          {error && <span className={styles.errorMsg}>{error}</span>}
          {saved && <span className={styles.savedMsg}>✓ Saved!</span>}
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button key={tab.key} className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'general' && (
          <div className={styles.section}>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Restaurant Name</label>
                <input className={styles.input} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Address</label>
                <input className={styles.input} value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className={styles.section}>
            <p className={styles.hint}>Define your opening hours. The chatbot will use these to answer customers.</p>
            {hours.map((h, i) => (
              <div key={i} className={styles.hourRow}>
                <input className={styles.input} placeholder="e.g. Monday" value={h.day} onChange={e => updateHour(i, 'day', e.target.value)} style={{ flex: 2 }} />
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={h.closed} onChange={e => updateHour(i, 'closed', e.target.checked)} />
                  Closed
                </label>
                {!h.closed && (
                  <>
                    <input className={styles.input} type="time" value={h.open ?? ''} onChange={e => updateHour(i, 'open', e.target.value)} style={{ flex: 1 }} />
                    <span className={styles.to}>to</span>
                    <input className={styles.input} type="time" value={h.close ?? ''} onChange={e => updateHour(i, 'close', e.target.value)} style={{ flex: 1 }} />
                  </>
                )}
                <button className={styles.removeBtn} onClick={() => removeHour(i)}>✕</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addHour}>+ Add a time slot</button>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className={styles.section}>
            <p className={styles.hint}>Add your menu categories and dishes.</p>
            {menu.map((cat, catIndex) => (
              <div key={catIndex} className={styles.menuCategory}>
                <div className={styles.categoryHeader}>
                  <input className={styles.input} placeholder="Category name" value={cat.category} onChange={e => updateCategory(catIndex, e.target.value)} />
                  <button className={styles.removeBtn} onClick={() => removeCategory(catIndex)}>✕ Remove</button>
                </div>
                {cat.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={styles.menuItem}>
                    <input className={styles.input} placeholder="Dish name" value={item.name} onChange={e => updateItem(catIndex, itemIndex, 'name', e.target.value)} />
                    <input className={styles.input} placeholder="€24" value={item.price} onChange={e => updateItem(catIndex, itemIndex, 'price', e.target.value)} style={{ maxWidth: 100 }} />
                    <input className={styles.input} placeholder="Description" value={item.description} onChange={e => updateItem(catIndex, itemIndex, 'description', e.target.value)} style={{ flex: 2 }} />
                    <button className={styles.removeBtn} onClick={() => removeItem(catIndex, itemIndex)}>✕</button>
                  </div>
                ))}
                <button className={styles.addBtn} onClick={() => addItem(catIndex)}>+ Add a dish</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addCategory} style={{ marginTop: '1rem' }}>+ Add a category</button>
          </div>
        )}

        {activeTab === 'capacity' && (
          <div className={styles.section}>
            <p className={styles.hint}>The chatbot will refuse reservations when the restaurant is full.</p>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Maximum covers per slot</label>
                <input className={styles.input} type="number" min="1" max="500" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} />
                <span className={styles.fieldHint}>Total guests the restaurant can seat at one time</span>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Slot duration (minutes)</label>
                <input className={styles.input} type="number" min="30" max="240" value={slotDuration} onChange={e => setSlotDuration(e.target.value)} />
                <span className={styles.fieldHint}>How long a table is reserved (e.g. 90 minutes)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'infos' && (
          <div className={styles.section}>
            <p className={styles.hint}>These texts are used by the chatbot to answer customer questions.</p>
            {[
              { label: 'Parking', value: parking, set: setParking },
              { label: 'Terrace', value: terrace, set: setTerrace },
              { label: 'Dress code', value: dressCode, set: setDressCode },
              { label: 'Vegetarian options', value: vegetarianInfo, set: setVegetarianInfo },
              { label: 'Vegan options', value: veganInfo, set: setVeganInfo },
              { label: 'Allergy information', value: allergyInfo, set: setAllergyInfo },
              { label: 'Wine & sommelier', value: wineInfo, set: setWineInfo },
              { label: 'Private events', value: privateEvents, set: setPrivateEvents },
            ].map(({ label, value, set }) => (
              <div key={label} className={styles.field} style={{ marginBottom: '1.2rem' }}>
                <label className={styles.label}>{label}</label>
                <textarea className={styles.textarea} value={value} onChange={e => set(e.target.value)} rows={2} placeholder={`What the chatbot says about ${label.toLowerCase()}…`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}