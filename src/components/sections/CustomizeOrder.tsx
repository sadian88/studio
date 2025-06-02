
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ShoppingCart, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { generateDesign } from '@/ai/flows/generate-design-flow';

const shirtTypes = [
 { id: 'short-sleeve', name: 'Manga Corta', imgSrc: 'https://placehold.co/200x300.png', hint: 'shortsleeve shirt', price: 20 },
 { id: 'long-sleeve', name: 'Manga Larga', imgSrc: 'https://placehold.co/200x300.png', hint: 'longsleeve shirt', price: 25 },
];

const colors = [
  { id: 'black', name: 'Negro', hex: '#000000', twClass: 'bg-black', borderClass: 'border-gray-600' },
  { id: 'white', name: 'Blanco', hex: '#FFFFFF', twClass: 'bg-white', borderClass: 'border-gray-400' },
  { id: 'yellow', name: 'Amarillo', hex: '#FACC15', twClass: 'bg-yellow-400' },
  { id: 'red', name: 'Rojo', hex: '#EF4444', twClass: 'bg-red-500' },
];

const designs = [
  { id: 'design1', name: 'Diseño Abstracto Moderno', imgSrc: '/disenios/caballopunk.png', hint: 'abstract design', priceModifier: 5 },
  { id: 'design2', name: 'Patrón Gráfico Urbano', imgSrc: 'https://placehold.co/250x250.png', hint: 'graphic pattern', priceModifier: 5 },
  { id: 'design3', name: 'Arte Minimalista Elegante', imgSrc: 'https://placehold.co/250x250.png', hint: 'minimalist art', priceModifier: 3 },
  { id: 'design4', name: 'Logo Vintage Clásico', imgSrc: 'https://placehold.co/250x250.png', hint: 'vintage logo', priceModifier: 4 },
  { id: 'design5', name: 'Ilustración Naturaleza Fresca', imgSrc: 'https://placehold.co/250x250.png', hint: 'nature illustration', priceModifier: 6 },
];

const AI_GENERATED_DESIGN_PRICE_MODIFIER = 7;
const AI_DESIGN_PLACEHOLDER_IMG = 'https://placehold.co/250x250.png';
const AI_DESIGN_PLACEHOLDER_HINT = 'AI custom design';

export default function CustomizeOrder() {
  const [selectedShirtTypeId, setSelectedShirtTypeId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectDesign = (designId: string) => {
    setSelectedDesignId(designId);
    setAiPrompt('');
    setAiGeneratedImageUrl(null);
  };

  const handleAiPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(event.target.value);
    setSelectedDesignId(null);
    setAiGeneratedImageUrl(null);
  };

  const handleGenerateAiDesign = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Entrada Requerida", description: "Por favor, ingresa una descripción para tu diseño.", variant: "destructive", duration: 3000 });
      return;
    }
    setIsGeneratingImage(true);
    setAiGeneratedImageUrl(null);
    try {
      const result = await generateDesign({ prompt: aiPrompt.trim() });
      if (result.imageDataUri) {
        setAiGeneratedImageUrl(result.imageDataUri);
        toast({ title: "¡Diseño IA Generado!", description: "Tu imagen personalizada ha sido creada.", duration: 3000 });
      } else {
        throw new Error("No se recibió imagen del flujo de Genkit.");
      }
    } catch (error) {
      console.error("Error generating AI design:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      toast({
        title: "Error al Generar Diseño",
        description: `No se pudo generar la imagen. ${errorMessage} Intenta de nuevo o con otra descripción.`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedShirtTypeId || !selectedColorId || (!selectedDesignId && !aiPrompt.trim())) {
      if (isClient) {
        toast({
          title: '¡Completa tu selección!',
          description: 'Por favor, elige tipo de prenda, color y un diseño o describe tu idea.',
          variant: 'destructive',
          duration: 3000,
        });
      }
      return;
    }

    const shirtType = shirtTypes.find(st => st.id === selectedShirtTypeId);
    const color = colors.find(c => c.id === selectedColorId);

    if (!shirtType || !color) {
        toast({ title: 'Error', description: 'Tipo de prenda o color no válido.', variant: 'destructive' });
        return;
    }

    let designForCart: { id: string; name: string; imgSrc: string; hint?: string };
    let itemPrice = shirtType.price;
    let promptForCart: string | undefined = undefined;

    if (aiPrompt.trim()) {
      const uniqueAiIdSuffix = aiGeneratedImageUrl ? `-${Date.now()}` : '-placeholder';
      designForCart = {
        id: `ai-generated${uniqueAiIdSuffix}`,
        name: 'Diseño Personalizado (IA)',
        imgSrc: aiGeneratedImageUrl || AI_DESIGN_PLACEHOLDER_IMG,
        hint: aiGeneratedImageUrl ? 'AI generated custom design' : AI_DESIGN_PLACEHOLDER_HINT
      };
      itemPrice += AI_GENERATED_DESIGN_PRICE_MODIFIER;
      promptForCart = aiPrompt.trim();
    } else if (selectedDesignId) {
      const selectedDesign = designs.find(d => d.id === selectedDesignId);
      if (!selectedDesign) {
        toast({ title: 'Error', description: 'Diseño seleccionado no válido.', variant: 'destructive' });
        return;
      }
      designForCart = { id: selectedDesign.id, name: selectedDesign.name, imgSrc: selectedDesign.imgSrc, hint: selectedDesign.hint };
      itemPrice += selectedDesign.priceModifier;
    } else {
      toast({ title: 'Error', description: 'Debes seleccionar un diseño o describir tu idea.', variant: 'destructive' });
      return;
    }

    const itemToAdd = {
      imageSrc: designForCart.imgSrc, // Use designForCart.imgSrc which is now correctly set
      shirtType: { id: shirtType.id, name: shirtType.name, imgSrc: shirtType.imgSrc }, // pass imgSrc for shirtType too
      color: { id: color.id, name: color.name, hex: color.hex },
      design: designForCart,
      price: itemPrice,
      ...(promptForCart && { aiPrompt: promptForCart }),
    };

    addToCart(itemToAdd);

    if (isClient) {
      toast({
        title: '¡Producto Agregado al Carrito!',
        description: (
          <div>
            <p><strong>{shirtType.name} - {color.name} - {designForCart.name}</strong></p>
            {promptForCart && <p className="text-xs">Tu idea: {promptForCart.substring(0,50)}...</p>}
            <p>Personalización añadida correctamente.</p>
          </div>
        ),
        duration: 3000,
      });
    }
  };

  const SectionTitle: React.FC<{ title: string; step: number }> = ({ title, step }) => (
    <div className="flex items-center mb-6">
      <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-3">{step}</div>
      <h3 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">{title}</h3>
    </div>
  );

  const selectedShirtType = shirtTypes.find(st => st.id === selectedShirtTypeId);
  const selectedColor = colors.find(c => c.id === selectedColorId);
  const finalSelectedDesign = designs.find(d => d.id === selectedDesignId);

  let currentPrice = selectedShirtType?.price || 0;
  let designSummaryName = 'No seleccionado';
  let designPriceString = '';

  if (aiPrompt.trim()) {
    currentPrice += AI_GENERATED_DESIGN_PRICE_MODIFIER;
    designSummaryName = `Diseño IA: "${aiPrompt.trim().substring(0, 30)}..."`;
    designPriceString = `+$${AI_GENERATED_DESIGN_PRICE_MODIFIER}`;
  } else if (finalSelectedDesign) {
    currentPrice += finalSelectedDesign.priceModifier;
    designSummaryName = finalSelectedDesign.name;
    designPriceString = `+$${finalSelectedDesign.priceModifier}`;
  }

  return (
    <section id="create-idea" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-center text-primary mb-12 md:mb-16">
          Arma tu Pedido Personalizado
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 md:gap-x-12">
          {/* Columna Principal de Contenido */}
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            <div>
              <SectionTitle title="Elige el Tipo de Prenda" step={1} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {shirtTypes.map((type) => (
                  <Card
                    key={type.id}
                    onClick={() => setSelectedShirtTypeId(type.id)}
                    className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-accent/30 hover:-translate-y-1 rounded-xl overflow-hidden ${
                      selectedShirtTypeId === type.id ? 'ring-4 ring-accent shadow-accent/20' : 'ring-1 ring-border hover:ring-accent/50'
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
                      {selectedShirtTypeId === type.id && (
                        <div className="absolute top-3 right-3 bg-accent rounded-full p-1.5 shadow-md">
                          <CheckCircle2 className="w-6 h-6 text-accent-foreground" />
                        </div>
                      )}
                       <div className="p-5 bg-card/80 backdrop-blur-sm">
                        <h4 className="text-xl font-body font-bold text-center text-foreground group-hover:text-primary transition-colors">{type.name}</h4>
                        <p className="text-center text-sm text-muted-foreground">${type.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle title="Selecciona un Color" step={2} />
              <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColorId(color.id)}
                    aria-label={`Seleccionar color ${color.name}`}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 shadow-md ${color.twClass} ${color.id === 'black' ? color.borderClass : ''} ${color.id === 'white' ? color.borderClass : ''} ${
                      selectedColorId === color.id ? 'ring-4 ring-offset-2 ring-accent ring-offset-background' : 'ring-1 ring-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColorId === color.id && (
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white mix-blend-difference m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle title="Elige o Describe tu Diseño" step={3} />
              <h4 className="text-xl font-body font-semibold text-foreground mb-4">Opción A: Escoge un Diseño Exclusivo</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {designs.map((design) => (
                  <Card
                    key={design.id}
                    onClick={() => handleSelectDesign(design.id)}
                    className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-accent/30 hover:-translate-y-1 rounded-xl overflow-hidden group ${
                      selectedDesignId === design.id ? 'ring-4 ring-accent shadow-accent/20' : 'ring-1 ring-border hover:ring-accent/50'
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
                      {selectedDesignId === design.id && (
                        <div className="absolute top-2 right-2 bg-accent rounded-full p-1 shadow-md">
                          <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                        </div>
                      )}
                      <div className="p-3 bg-card/80 backdrop-blur-sm">
                        <p className="text-xs md:text-sm font-body text-center text-foreground truncate group-hover:text-primary transition-colors">{design.name}</p>
                         <p className="text-center text-xs text-muted-foreground">+${design.priceModifier}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-8 bg-border/40" />

              <div>
                <h4 className="text-xl font-body font-semibold text-foreground mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent" />
                  Opción B: Describe tu idea para nuestro generador IA
                </h4>
                <Textarea
                  placeholder="Ej: Un astronauta surfeando en una pizza con temática espacial y colores neón..."
                  value={aiPrompt}
                  onChange={handleAiPromptChange}
                  className="min-h-[100px] text-base border-input focus:ring-accent bg-card placeholder:text-muted-foreground/70"
                  rows={4}
                />
                <Button
                    onClick={handleGenerateAiDesign}
                    disabled={!aiPrompt.trim() || isGeneratingImage}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-accent text-accent hover:bg-accent/10 hover:text-accent"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando Imagen...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Diseño con IA
                      </>
                    )}
                  </Button>
                {aiPrompt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Costo adicional por diseño IA: +${AI_GENERATED_DESIGN_PRICE_MODIFIER}
                  </p>
                )}

                {(aiPrompt || aiGeneratedImageUrl) && (
                    <div className="mt-4 p-4 border border-dashed border-accent/30 rounded-lg bg-card/30">
                        <h5 className="text-sm font-body font-semibold text-accent mb-2">Vista Previa Diseño IA</h5>
                        <div className="flex justify-center items-center w-full max-w-xs mx-auto aspect-square bg-muted/20 rounded-md overflow-hidden">
                        {isGeneratingImage ? (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                                <p className="text-sm">Cargando diseño...</p>
                            </div>
                        ) : aiGeneratedImageUrl ? (
                            <Image
                                src={aiGeneratedImageUrl}
                                alt="Diseño generado por IA"
                                width={250}
                                height={250}
                                className="object-contain w-full h-full"
                            />
                        ) : (
                             <Image
                                src={AI_DESIGN_PLACEHOLDER_IMG}
                                alt="Placeholder Diseño IA"
                                width={250}
                                height={250}
                                className="object-contain w-full h-full opacity-40"
                                data-ai-hint={AI_DESIGN_PLACEHOLDER_HINT}
                              />
                        )}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna del Resumen (Sticky) */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-xl border border-border sticky top-24 z-10">
              <h3 className="text-2xl md:text-3xl font-headline font-semibold text-center text-primary mb-6">Resumen de tu Selección</h3>
              {selectedShirtType || selectedColor || finalSelectedDesign || aiPrompt.trim() ? (
                <div className="space-y-3 mb-8 text-center font-body text-muted-foreground">
                  <p><strong>Tipo de Prenda:</strong> {selectedShirtType?.name || 'No seleccionado'} ({selectedShirtType ? `$${selectedShirtType.price}` : ''})</p>
                  <p><strong>Color:</strong> {selectedColor?.name || 'No seleccionado'}</p>
                  <p><strong>Diseño:</strong> {designSummaryName} {designPriceString && `(${designPriceString})`}</p>

                  {(selectedShirtType && (finalSelectedDesign || aiPrompt.trim())) && (
                    <p className="text-lg font-bold text-foreground mt-2">
                      Precio Unitario Estimado: ${currentPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center font-body text-muted-foreground mb-8">Selecciona tus opciones para ver el resumen aquí.</p>
              )}
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!isClient || !selectedShirtTypeId || !selectedColorId || (!selectedDesignId && !aiPrompt.trim()) || isGeneratingImage}
                className="w-full font-headline font-bold text-base md:text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-lg hover:shadow-primary/40 transition-all duration-300 disabled:opacity-70"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al Carrito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
