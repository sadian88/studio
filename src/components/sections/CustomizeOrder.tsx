'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const shirtTypes = [
  { id: 'short-sleeve', name: 'Manga Corta', imgSrc: 'https://placehold.co/300x400.png', hint: 'shortsleeve shirt' },
  { id: 'long-sleeve', name: 'Manga Larga', imgSrc: 'https://placehold.co/300x400.png', hint: 'longsleeve shirt' },
];

const colors = [
  { id: 'black', name: 'Negro', hex: '#000000', twClass: 'bg-black' },
  { id: 'white', name: 'Blanco', hex: '#FFFFFF', twClass: 'bg-white', borderClass: 'border-gray-400' },
  { id: 'yellow', name: 'Amarillo', hex: '#FACC15', twClass: 'bg-yellow-400' }, // Tailwind yellow-400
  { id: 'red', name: 'Rojo', hex: '#EF4444', twClass: 'bg-red-500' }, // Tailwind red-500
];

const designs = [
  { id: 'design1', name: 'Diseño Abstracto Moderno', imgSrc: 'https://placehold.co/250x250.png', hint: 'abstract design' },
  { id: 'design2', name: 'Patrón Gráfico Urbano', imgSrc: 'https://placehold.co/250x250.png', hint: 'graphic pattern' },
  { id: 'design3', name: 'Arte Minimalista Elegante', imgSrc: 'https://placehold.co/250x250.png', hint: 'minimalist art' },
  { id: 'design4', name: 'Logo Vintage Clásico', imgSrc: 'https://placehold.co/250x250.png', hint: 'vintage logo' },
  { id: 'design5', name: 'Ilustración Naturaleza Fresca', imgSrc: 'https://placehold.co/250x250.png', hint: 'nature illustration' },
];

export default function CustomizeOrder() {
  const [selectedShirtType, setSelectedShirtType] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = () => {
    if (!selectedShirtType || !selectedColor || !selectedDesign) {
      if (isClient) {
        toast({
          title: '¡Completa tu selección!',
          description: 'Por favor, elige tipo de prenda, color y diseño para continuar.',
          variant: 'destructive',
          duration: 3000,
        });
      }
      return;
    }

    const shirtTypeName = shirtTypes.find(st => st.id === selectedShirtType)?.name;
    const colorName = colors.find(c => c.id === selectedColor)?.name;
    const designName = designs.find(d => d.id === selectedDesign)?.name;

    if (isClient) {
      toast({
        title: '¡Producto Personalizado Agregado!',
        description: (
          <div>
            <p><strong>Tipo:</strong> {shirtTypeName}</p>
            <p><strong>Color:</strong> {colorName}</p>
            <p><strong>Diseño:</strong> {designName}</p>
          </div>
        ),
        action: <Button variant="outline" size="sm" onClick={() => console.log('Ver carrito clickeado')}>Ver Carrito</Button>,
        duration: 5000,
      });
    }
    // setSelectedShirtType(null);
    // setSelectedColor(null);
    // setSelectedDesign(null);
  };
  
  const SectionTitle: React.FC<{ title: string; step: number }> = ({ title, step }) => (
    <div className="flex items-center mb-6">
      <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-3">{step}</div>
      <h3 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">{title}</h3>
    </div>
  );

  return (
    <section id="create-idea" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-center text-primary mb-16">
          Arma tu Pedido Personalizado
        </h2>

        {/* Paso 1: Tipo de Prenda */}
        <div className="mb-12 md:mb-16">
          <SectionTitle title="Elige el Tipo de Prenda" step={1} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {shirtTypes.map((type) => (
              <Card
                key={type.id}
                onClick={() => setSelectedShirtType(type.id)}
                className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-primary/30 hover:-translate-y-1 rounded-xl overflow-hidden ${
                  selectedShirtType === type.id ? 'ring-4 ring-primary shadow-primary/20' : 'ring-1 ring-border hover:ring-primary/50'
                } bg-card`}
              >
                <CardContent className="p-0 relative">
                  <div className="aspect-[3/4] w-full relative">
                    <Image
                      src={type.imgSrc}
                      alt={type.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      data-ai-hint={type.hint}
                    />
                  </div>
                  {selectedShirtType === type.id && (
                    <div className="absolute top-3 right-3 bg-primary rounded-full p-1.5 shadow-md">
                      <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                  )}
                   <div className="p-5 bg-card/80 backdrop-blur-sm">
                    <h4 className="text-xl font-body font-bold text-center text-foreground group-hover:text-primary transition-colors">{type.name}</h4>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Paso 2: Elige Color */}
        <div className="mb-12 md:mb-16">
          <SectionTitle title="Selecciona un Color" step={2} />
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                aria-label={`Seleccionar color ${color.name}`}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 shadow-md ${color.twClass} ${color.borderClass || ''} ${
                  selectedColor === color.id ? 'ring-4 ring-offset-2 ring-primary ring-offset-background' : 'ring-1 ring-border'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.id && (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white mix-blend-difference m-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Paso 3: Escoge Diseño */}
        <div className="mb-12 md:mb-16">
          <SectionTitle title="Escoge un Diseño Exclusivo" step={3} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {designs.map((design) => (
              <Card
                key={design.id}
                onClick={() => setSelectedDesign(design.id)}
                className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-primary/30 hover:-translate-y-1 rounded-xl overflow-hidden group ${
                  selectedDesign === design.id ? 'ring-4 ring-primary shadow-primary/20' : 'ring-1 ring-border hover:ring-primary/50'
                } bg-card`}
              >
                <CardContent className="p-0 relative">
                   <div className="aspect-square w-full relative">
                    <Image
                      src={design.imgSrc}
                      alt={design.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={design.hint}
                    />
                  </div>
                  {selectedDesign === design.id && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="p-3 bg-card/80 backdrop-blur-sm">
                    <p className="text-xs md:text-sm font-body text-center text-foreground truncate group-hover:text-primary transition-colors">{design.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resumen y Botón */}
        <Separator className="my-12 md:my-16 bg-border/60" />
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-xl border border-border">
          <h3 className="text-2xl md:text-3xl font-headline font-semibold text-center text-primary mb-6">Resumen de tu Pedido</h3>
          {selectedShirtType || selectedColor || selectedDesign ? (
            <div className="space-y-3 mb-8 text-center font-body text-muted-foreground">
              <p><strong>Tipo de Prenda:</strong> {shirtTypes.find(st => st.id === selectedShirtType)?.name || 'No seleccionado'}</p>
              <p><strong>Color:</strong> {colors.find(c => c.id === selectedColor)?.name || 'No seleccionado'}</p>
              <p><strong>Diseño:</strong> {designs.find(d => d.id === selectedDesign)?.name || 'No seleccionado'}</p>
            </div>
          ) : (
            <p className="text-center font-body text-muted-foreground mb-8">Selecciona tus opciones para ver el resumen aquí.</p>
          )}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!isClient}
            className="w-full font-headline font-bold text-base md:text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-lg hover:shadow-primary/40 transition-all duration-300 disabled:opacity-70"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Agregar al Carrito
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
