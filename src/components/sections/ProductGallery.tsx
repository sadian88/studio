import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const products = [
  { id: 1, src: '/camisetas/cami1.png', alt: 'Diseño Camiseta Moderna', hint: 'tshirt design' },
  { id: 2, src: '/camisetas/cami2.png', alt: 'Hoodie Personalizado Urbano', hint: 'tshirt design' },
  { id: 3, src: '/camisetas/cami1.png', alt: 'Gorra Estampada Exclusiva', hint: 'tshirt design' },
  { id: 4, src: '/camisetas/cami2.png', alt: 'Camiseta Gráfica Impactante', hint: 'tshirt design' },
  { id: 5, src: '/camisetas/cami1.png', alt: 'Diseño Minimalista Prenda', hint: 'tshirt design' },
  { id: 6, src: '/camisetas/cami2.png', alt: 'Producto Único Personalizado', hint: 'tshirt design' },
];

export default function ProductGallery() {
  return (
    <section className="py-16 md:py-20">
      <h2 className="text-3xl md:text-4xl font-headline font-bold text-center text-foreground mb-12">
        Explora Nuestros Diseños
      </h2>
      <div className="flex overflow-x-auto space-x-6 pb-6 -mx-4 px-4">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64 md:w-72 group">
            <Card className="overflow-hidden bg-card border-border shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-lg transform hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative w-full">
                  <Image
                    src={product.src}
                    alt={product.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={product.hint}
                  />
                </div>
              </CardContent>
               <div className="p-4 bg-card">
                <h3 className="font-body text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">{product.alt}</h3>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
