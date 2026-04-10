'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
      className="flex justify-center gap-2.5"
      onSubmit={handleSubmit}
    >
      <div className="relative flex-1 flex items-center">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="No password required"
          className={`bg-white/[0.04] border border-white/[0.08] rounded-[10px] py-2 px-4 text-white/85 font-['Inter',sans-serif] text-sm text-left outline-none transition-all duration-200 box-border placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.08] ${error ? 'home-input-error' : ''}`}
        />
        {showPassword ? (
          <EyeOff
            size={18}
            className="absolute right-4 text-white/40 cursor-pointer transition-colors duration-200 hover:text-white/85"
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <Eye
            size={18}
            className="absolute right-4 text-white/40 cursor-pointer transition-colors duration-200 hover:text-white/85"
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>
      <button
        type="submit"
        className="flex items-center justify-center py-2 px-4 no-underline cursor-pointer font-['Inter',sans-serif] text-sm font-medium tracking-[-0.2px] text-white/85 border border-white/15 rounded-[10px] bg-white/[0.08] transition-all duration-200 whitespace-nowrap hover:border-white/30 hover:bg-white/[0.12] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:translate-y-0"
      >
        VERIFY
      </button>
    </form>
  );
}
