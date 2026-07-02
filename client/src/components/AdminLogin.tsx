import { useState, type FormEvent } from 'react';
import styles from './AdminLogin.module.css';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  error: string | null;
}

export function AdminLogin({ onLogin, error }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onLogin(username, password);
    setSubmitting(false);
  };

  return (
    <div className={styles.login}>
      <h3>Staff Access</h3>
      <p>Enter your credentials to access the reservation dashboard.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
