// components/brand/AnabaLogo.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import kanjiAnaba from '@/public/images/kanji.svg';

export default function AnabaLogo() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push('/')}
      className={cn(
        "relative flex cursor-pointer items-center justify-end",
        "z-50 w-fit"
      )}
    >
      <div className="flex items-center justify-center relative">
        <h1 
          className={cn(
            "anaba-title mr-2 md:mr-4",
            "text-l sm:text-l md:text-2xl"
          )}
        >
          Anaba.IO
        </h1>
        <div className={cn(
          "relative",
          "h-[60px] w-[60px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px]"
        )}>
          <Image
            src={kanjiAnaba}
            alt="Kanji Anaba"
            fill
            priority
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 60px, (max-width: 1024px) 70px, 80px"
            className='kanji-image'
          />
        </div>
      </div>
    </div>
  );
}