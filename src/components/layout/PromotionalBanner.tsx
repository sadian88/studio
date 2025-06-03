
import { Zap } from 'lucide-react';

export default function PromotionalBanner() {
  return (
    <div className="bg-primary text-primary-foreground py-2.5 px-4 text-center font-body text-sm md:text-base">
      <p className="flex items-center justify-center">
        <Zap className="w-5 h-5 mr-2 shrink-0 text-accent" />
        siguenos en Instagram @camisetia
      </p>
    </div>
  );
}

