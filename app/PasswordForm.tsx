'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './page.module.css';

export default function PasswordForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No password required — accept empty input
    if (password === '') {
      setError(false);
      router.push('/database');
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <form
      className={styles.homeMenu}
      onSubmit={handleSubmit}
    >
      <div className={styles.inputWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="No password required"
          className={`${styles.homeInput} ${error ? styles.homeInputError : ''}`}
        />
        {showPassword ? (
          <EyeOff
            size={18}
            className={styles.eyeIcon}
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <Eye
            size={18}
            className={styles.eyeIcon}
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>
      <button
        type="submit"
        className={styles.homeBtn}
      >
        VERIFY
      </button>
    </form>
  );
}
