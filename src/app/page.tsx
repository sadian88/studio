
import Hero from '@/components/sections/Hero';
import ProductGallery from '@/components/sections/ProductGallery';
import CustomizeOrder from '@/components/sections/CustomizeOrder';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4">
        <Hero />
        <ProductGallery />
        <CustomizeOrder />
      </main>
      <footer className="text-center p-8 text-muted-foreground font-body text-sm border-t border-border/40 mt-16">
        <p>&copy; {new Date().getFullYear()} CAMISETIA. Todos los derechos reservados.</p> 
        <p className="mt-1">Diseñado con ❤️ en Medellín</p>
      </footer>
    </div>
  );
}
