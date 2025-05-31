import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="text-center py-16 md:py-28">
      <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-tight">
        <span className="text-primary">Diseñamos y</span>
        <br className="md:hidden" />
        <span className="text-foreground"> Personalizamos</span>
        <br /> 
        <span className="text-primary">el mismo día</span>
      </h1>
      <p className="mt-8 font-body text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
        Camisetas, Hoodies, Gorras y Productos Personalizados en Medellín. Estampados Medellín.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-10 font-headline font-bold text-base md:text-lg px-10 py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-lg hover:shadow-primary/40 transition-all duration-300"
      >
        <Link href="#create-idea">COMENCEMOS</Link>
      </Button>
    </section>
  );
}
