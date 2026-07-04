import { useRef, useState, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Menu } from './components/Menu';
import { Hours } from './components/Hours';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { useRestaurant } from './hooks/useRestaurant';
import styles from './App.module.css';

export default function App() {
  const { restaurant, loading, error, refetch } = useRestaurant();
  const [chatOpen, setChatOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const sendMessageRef = useRef<((text: string) => void) | null>(null);

  const handleRestaurantUpdated = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.loadingText}>Noir &amp; Ember</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.errorText}>
          We're unable to load the restaurant right now. Please try again shortly.
        </p>
      </div>
    );
  }

  const openChatAndReserve = () => {
    setChatOpen(true);
    setTimeout(() => sendMessageRef.current?.('I would like to make a reservation'), 700);
  };

  return (
    <>
      <Navigation restaurantName={restaurant.name} onReserveClick={openChatAndReserve} />
      <Hero restaurantName={restaurant.name} onReserveClick={openChatAndReserve} />
      <About />
      {restaurant.settings.menu && <Menu categories={restaurant.settings.menu} />}
      <Hours hours={restaurant.settings.hours} />
      <Contact
        address={restaurant.address}
        phone={restaurant.phone}
        email={restaurant.email}
        onChatClick={() => setChatOpen(true)}
      />
      <Footer restaurantName={restaurant.name} address={restaurant.address} />

      <button className={styles.adminTrigger} onClick={() => setAdminOpen(true)}>
        Admin
      </button>

      <Chatbot
        restaurantName={restaurant.name}
        isOpen={chatOpen}
        onToggle={() => setChatOpen((prev) => !prev)}
        onSendRef={(send) => { sendMessageRef.current = send; }}
      />

      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        restaurantName={restaurant.name}
        restaurant={restaurant}
        onRestaurantUpdated={handleRestaurantUpdated}
      />
    </>
  );
}