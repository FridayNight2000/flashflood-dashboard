import type { Metadata } from 'next';

import './page.css';
import PasswordForm from './PasswordForm';

export const metadata: Metadata = {
  title: 'Flash-Flood Database in Japan',
  description: 'Explore flash-flood stations and event insights across Japan.',
};

export default function Home() {
  return (
    <div className="h-full overflow-hidden relative bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('/dark_square_grid_background.jpeg')] bg-no-repeat bg-center bg-cover flex justify-center items-center">
      <div className="flex flex-col items-center gap-[50px]">
        {/* 3. LOGO */}
        <div className="text-center flex flex-col gap-2.5">
          <div className="text-[62px] font-bold tracking-[-3px] leading-none text-[aliceblue]">FLASH-FLOOD</div>
          <div className="home-tagline text-[10px] text-white/[0.28] tracking-[4px] flex items-center gap-2.5">JAPAN DATABASE · 2002 - 2023</div>
        </div>
        {/* 4. Password Input */}
        <PasswordForm />
      </div>
    </div>
  );
}
