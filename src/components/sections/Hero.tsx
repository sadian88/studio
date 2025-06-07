import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="text-center py-16 md:py-28 bg-[url('/patron.png')] bg-opacity-80">
      <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-tight bg-gradient-to-r from-yellow-400 to-cyan-500 text-transparent bg-clip-text">
        <span>Diseñamos con ia</span>
        <br className="md:hidden" /> {/* Hide on medium and larger screens */}
        <span>tu camiseta única</span>
      </h1>
      <p className="mt-8 font-body text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
        Camisetas, Gorras personalizadas.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-10 font-headline font-bold text-base md:text-lg px-10 py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-lg hover:shadow-primary/40 transition-all duration-300"
      >
        <Link href="#create-idea">Diseña tu prenda</Link>
      </Button>
    </section>
  );
}
