
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ShoppingCart, ArrowRight, Sparkles, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { generateDesign } from '@/ai/flows/generate-design-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const productTypes = [
 { id: 'short-sleeve', name: 'Manga Corta', imgSrc: '/camisetas/cnegramangacorta.png', hint: 'shortsleeve shirt', price: 20, hasSizes: true },
 { id: 'long-sleeve', name: 'Manga Larga', imgSrc: '/camisetas/cnegramangalarga.png', hint: 'longsleeve shirt', price: 25, hasSizes: true },
 { id: 'cap-printed', name: 'Gorra Estampada', imgSrc: '/camisetas/gorra.png', hint: 'cap design', price: 18, hasSizes: false },
];

const sizes = [
  { id: 's', name: 'S' },
  { id: 'm', name: 'M' },
  { id: 'l', name: 'L' },
  { id: 'xl', name: 'XL' },
];

const colors = [
  { id: 'black', name: 'Negro', hex: '#000000', twClass: 'bg-black', borderClass: 'border-gray-400' },
  { id: 'white', name: 'Blanco', hex: '#FFFFFF', twClass: 'bg-white', borderClass: 'border-gray-400' },
  { id: 'yellow', name: 'Amarillo', hex: '#F6E85C', twClass: 'bg-yellow-400' },
  { id: 'red', name: 'Rojo', hex: '#EF4444', twClass: 'bg-red-500' },
];

const designs = [
  { id: 'design1', name: 'Diseño Abstracto Caballo', imgSrc: '/disenios/caballopunk.png', hint: 'abstract design', priceModifier: 5 },
  { id: 'design2', name: 'Patrón Gráfico Urbano', imgSrc: '/disenios/rikymorty.png', hint: 'graphic pattern', priceModifier: 5 },
  { id: 'design3', name: 'Arte Minimalista Elegante', imgSrc: '/disenios/spider.png', hint: 'minimalist art', priceModifier: 3 },
  { id: 'design4', name: 'Logo Vintage Clásico', imgSrc: '/disenios/onepushman.png', hint: 'vintage logo', priceModifier: 4 },
  { id: 'design5', name: 'Ilustración Naturaleza Fresca', imgSrc: '/disenios/gym.png', hint: 'nature illustration', priceModifier: 6 },
];

const AI_GENERATED_DESIGN_PRICE_MODIFIER = 7;
const AI_DESIGN_PLACEHOLDER_IMG = 'https://placehold.co/250x250.png';
const AI_DESIGN_PLACEHOLDER_HINT = 'AI custom design';

export default function CustomizeOrder() {
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const { toast } = useToast();
  const { addToCart } = useCart();

  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const designSectionRef = useRef<HTMLDivElement>(null);
  const summarySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedProductType = productTypes.find(pt => pt.id === selectedProductTypeId);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); 
  };

  useEffect(() => {
    if (selectedProductTypeId) {
      if (selectedProductType?.hasSizes && sizeSectionRef.current) {
        scrollToSection(sizeSectionRef);
      } else if (!selectedProductType?.hasSizes && colorSectionRef.current) {
        scrollToSection(colorSectionRef);
      }
    }
  }, [selectedProductTypeId, selectedProductType]);

  useEffect(() => {
    if (selectedProductTypeId && selectedProductType?.hasSizes && selectedSize && colorSectionRef.current) {
      scrollToSection(colorSectionRef);
    }
  }, [selectedSize, selectedProductTypeId, selectedProductType]);

  useEffect(() => {
    if (selectedProductTypeId && (!selectedProductType?.hasSizes || selectedSize) && selectedColorId && designSectionRef.current) {
      scrollToSection(designSectionRef);
    }
  }, [selectedColorId, selectedSize, selectedProductTypeId, selectedProductType]);
  
  useEffect(() => {
    if (
      selectedProductTypeId &&
      (!selectedProductType?.hasSizes || selectedSize) &&
      selectedColorId &&
      (selectedDesignId || aiGeneratedImageUrl) &&
      summarySectionRef.current
    ) {
      scrollToSection(summarySectionRef);
    }
  }, [selectedDesignId, aiGeneratedImageUrl, selectedColorId, selectedSize, selectedProductTypeId, selectedProductType]);


  const handleSelectProductType = (productTypeId: string) => {
    setSelectedProductTypeId(productTypeId);
    setSelectedSize(null); 
    setSelectedColorId(null);
    setSelectedDesignId(null);
    setAiPrompt('');
    setAiGeneratedImageUrl(null);
  };

  const handleSelectSize = (sizeId: string) => {
    setSelectedSize(sizeId);
  };
  
  const handleSelectColor = (colorId: string) => {
    setSelectedColorId(colorId);
  };

  const handleSelectDesign = (designId: string) => {
    setSelectedDesignId(designId);
    setAiPrompt(''); 
    setAiGeneratedImageUrl(null); 
  };

  const handleAiPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(event.target.value);
    if (event.target.value.trim()) {
      setSelectedDesignId(null); 
    }
  };

  const handleGenerateAiDesign = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Entrada Requerida", description: "Por favor, ingresa una descripción para tu diseño.", variant: "destructive", duration: 3000 });
      return;
    }
    setIsGeneratingImage(true);
    setAiGeneratedImageUrl(null); 
    setSelectedDesignId(null); 
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
    if (!selectedProductTypeId || (selectedProductType?.hasSizes && !selectedSize) || !selectedColorId || (!selectedDesignId && !aiPrompt.trim())) {
      let description = 'Por favor, completa todos los pasos de personalización.';
      if (!selectedProductTypeId) description = 'Por favor, elige un tipo de prenda.';
      else if (selectedProductType?.hasSizes && !selectedSize) description = 'Por favor, elige una talla.';
      else if (!selectedColorId) description = 'Por favor, elige un color.';
      else if (!selectedDesignId && !aiPrompt.trim()) description = 'Por favor, elige un diseño predefinido o describe tu idea para IA.';
      
      toast({
        title: '¡Completa tu selección!',
        description,
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    if (aiPrompt.trim() && !aiGeneratedImageUrl && !selectedDesignId) {
        toast({
            title: 'Diseño IA no generado',
            description: 'Por favor, genera tu diseño IA o selecciona uno predefinido antes de añadir al carrito.',
            variant: 'destructive',
            duration: 3000,
        });
        return;
    }

    const productType = productTypes.find(st => st.id === selectedProductTypeId);
    const sizeObject = selectedProductType?.hasSizes && selectedSize ? sizes.find(s => s.id === selectedSize) : undefined;
    const color = colors.find(c => c.id === selectedColorId);

    if (!productType || !color || (selectedProductType?.hasSizes && !sizeObject && productType.id !== 'cap-printed') ) {
        toast({ title: 'Error', description: 'Tipo de prenda, talla o color no válido.', variant: 'destructive' });
        return;
    }

    let designForCart: { id: string; name: string; imgSrc: string; hint?: string };
    let itemPrice = productType.price;
    let promptForCart: string | undefined = undefined;

    if (aiPrompt.trim() && aiGeneratedImageUrl) {
      const uniqueAiId = `ai-generated-${Date.now()}`;
      designForCart = {
        id: uniqueAiId,
        name: 'Diseño Personalizado (IA)',
        imgSrc: aiGeneratedImageUrl,
        hint: 'AI generated custom design'
      };
      itemPrice += AI_GENERATED_DESIGN_PRICE_MODIFIER;
      promptForCart = aiPrompt.trim();
    } else if (selectedDesignId) {
      const selectedDesign = designs.find(d => d.id === selectedDesignId);
      if (!selectedDesign) {
        toast({ title: 'Error', description: 'Diseño seleccionado no válido.', variant: 'destructive' });
        return;
      }
      designForCart = { ...selectedDesign };
      itemPrice += selectedDesign.priceModifier;
    } else {
      toast({ title: 'Error de Selección', description: 'Debes seleccionar un diseño predefinido o generar un diseño con IA.', variant: 'destructive' });
      return;
    }

    const itemToAdd = {
      shirtType: { id: productType.id, name: productType.name, imgSrc: productType.imgSrc },
      ...(sizeObject && { size: sizeObject }), 
      color: { id: color.id, name: color.name, hex: color.hex },
      design: designForCart,
      price: itemPrice,
      ...(promptForCart && { aiPrompt: promptForCart }),
    };

    addToCart(itemToAdd);

    toast({
      title: '¡Producto Agregado al Carrito!',
      description: (
        <div>
          <p><strong>{productType.name} {sizeObject ? `- ${sizeObject.name}` : ''} - {color.name} - {designForCart.name}</strong></p>
          {promptForCart && <p className="text-xs">Tu idea: {promptForCart.substring(0,50)}...</p>}
          <p>Personalización añadida correctamente.</p>
        </div>
      ),
      duration: 3000,
    });
  };

  const SectionTitle: React.FC<{ title: string; step: number }> = ({ title, step }) => (
    <div className="flex items-center mb-6">
      <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-3">{step}</div>
      <h3 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">{title}</h3>
    </div>
  );

  const selectedColor = colors.find(c => c.id === selectedColorId);
  const finalSelectedDesign = designs.find(d => d.id === selectedDesignId);
  const currentSelectedSize = selectedProductType?.hasSizes && selectedSize ? sizes.find(s => s.id === selectedSize) : undefined;

  let currentPrice = selectedProductType?.price || 0;
  let designSummaryName = 'No seleccionado';
  let designPriceString = '';

  if (aiPrompt.trim() && aiGeneratedImageUrl) {
    currentPrice += AI_GENERATED_DESIGN_PRICE_MODIFIER;
    designSummaryName = `Diseño IA: "${aiPrompt.trim().substring(0, 30)}..."`;
    designPriceString = `+$${AI_GENERATED_DESIGN_PRICE_MODIFIER.toFixed(2)}`;
  } else if (finalSelectedDesign) {
    currentPrice += finalSelectedDesign.priceModifier;
    designSummaryName = finalSelectedDesign.name;
    designPriceString = `+$${finalSelectedDesign.priceModifier.toFixed(2)}`;
  }

  let stepCounter = 1;

  const colorsToDisplay = useMemo(() => {
    if (selectedProductType?.id === 'cap-printed') {
      return colors.filter(color => color.id === 'black' || color.id === 'white');
    }
    return colors;
  }, [selectedProductType]);


  return (
    <section id="create-idea" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-center text-primary mb-12 md:mb-16">
          Arma tu Pedido Personalizado
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 md:gap-x-12">
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            
            <div className="scroll-mt-24"> 
              <SectionTitle title="Elige el Tipo de Prenda" step={stepCounter++} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {productTypes.map((type) => (
                  <Card
                    key={type.id}
                    onClick={() => handleSelectProductType(type.id)}
                    className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-accent/30 hover:-translate-y-1 rounded-xl overflow-hidden ${
                      selectedProductTypeId === type.id ? 'ring-4 ring-accent shadow-accent/20' : 'ring-1 ring-border hover:ring-accent/50'
                    } bg-card`}
                  >
                    <CardContent className="p-0 relative">
                      <div className={`w-full relative bg-secondary rounded-t-xl ${type.id === 'cap-printed' ? 'aspect-video' : 'aspect-[3/4]'}`}>
                        <Image
                          src={type.imgSrc}
                          alt={type.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover"
                          data-ai-hint={type.hint}
                        />
                      </div>
                      {selectedProductTypeId === type.id && (
                        <div className="absolute top-3 right-3 bg-accent rounded-full p-1.5 shadow-md">
                          <CheckCircle2 className="w-6 h-6 text-accent-foreground" />
                        </div>
                      )}
                       <div className="p-5 bg-card/80 backdrop-blur-sm">
                        <h4 className="text-xl font-body font-bold text-center text-foreground group-hover:text-primary transition-colors">{type.name}</h4>
                        <p className="text-center text-sm text-muted-foreground">${type.price.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            
            {selectedProductTypeId && selectedProductType?.hasSizes && (
              <div ref={sizeSectionRef} className="scroll-mt-24">
                <SectionTitle title="Elige una Talla" step={stepCounter++} />
                <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                  {sizes.map((size) => (
                    <Button
                      key={size.id}
                      variant={selectedSize === size.id ? 'default' : 'outline'}
                      onClick={() => handleSelectSize(size.id)}
                      className={`w-20 h-12 rounded-lg text-base font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        selectedSize === size.id 
                        ? 'bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg' 
                        : 'bg-card hover:bg-muted border-border'
                      }`}
                    >
                      {size.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            
            {selectedProductTypeId && (!selectedProductType?.hasSizes || selectedSize) && (
              <div ref={colorSectionRef} className="scroll-mt-24">
                <SectionTitle title="Selecciona un Color" step={selectedProductType?.hasSizes ? stepCounter : stepCounter++} />
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                  {colorsToDisplay.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleSelectColor(color.id)}
                      aria-label={`Seleccionar color ${color.name}`}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 shadow-md ${color.twClass} ${
                        color.id === 'black' ? color.borderClass : '' 
                      } ${
                        color.id === 'white' ? color.borderClass : '' 
                      } ${
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
            )}

            
            {selectedProductTypeId && (!selectedProductType?.hasSizes || selectedSize) && selectedColorId && (
              <div ref={designSectionRef} className="scroll-mt-24">
                <SectionTitle title="Elige o Describe tu Diseño" step={selectedProductType?.hasSizes ? stepCounter +1 : stepCounter} />
                <h4 className="text-xl font-body font-semibold text-foreground mb-4">Opción A: Escoge un Diseño Exclusivo</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                  {designs.map((design) => (
                    <Card
                      key={design.id}
                      onClick={() => handleSelectDesign(design.id)}
                      className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-accent/30 hover:-translate-y-1 rounded-xl overflow-hidden group ${
                        selectedDesignId === design.id && !aiPrompt ? 'ring-4 ring-accent shadow-accent/20' : 'ring-1 ring-border hover:ring-accent/50'
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
                        {selectedDesignId === design.id && !aiPrompt && (
                          <div className="absolute top-2 right-2 bg-accent rounded-full p-1 shadow-md">
                            <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                          </div>
                        )}
                        <div className="p-3 bg-card/80 backdrop-blur-sm">
                          <p className="text-xs md:text-sm font-body text-center text-foreground truncate group-hover:text-primary transition-colors">{design.name}</p>
                           <p className="text-center text-xs text-muted-foreground">+${design.priceModifier.toFixed(2)}</p>
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

                  <Alert className="mb-4 border-primary/30 bg-primary/10 text-primary-foreground shadow-md">
                    <Info className="h-5 w-5 !text-primary" />
                    <AlertTitle className="font-headline text-primary">¡Información Importante!</AlertTitle>
                    <AlertDescription className="text-foreground/80 space-y-1.5">
                      <p className="flex items-start">
                        <Sparkles className="inline-block w-4 h-4 mr-1.5 mt-0.5 shrink-0 text-primary" />
                        <span>Puedes generar hasta <strong>3 diseños con nuestra IA cada 24 horas</strong>. ¡Explora tu creatividad!</span>
                      </p>
                      <p className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-4 h-4 mr-1.5 mt-0.5 shrink-0 text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                        <span>Si ya tienes una imagen o un diseño listo, ¡genial! Puedes saltarte este paso. Al enviar tu pedido por WhatsApp, podrás compartirnos tu archivo.</span>
                      </p>
                    </AlertDescription>
                  </Alert>

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
                  {aiPrompt.trim() && ( 
                    <p className="text-xs text-muted-foreground mt-2">
                      Costo adicional por diseño IA: +${AI_GENERATED_DESIGN_PRICE_MODIFIER.toFixed(2)}
                    </p>
                  )}

                  {(aiPrompt.trim() || aiGeneratedImageUrl) && ( 
                      <div className={`mt-4 p-4 border border-dashed rounded-lg bg-card/30 ${aiPrompt.trim() ? 'border-accent/50' : 'border-transparent'}`}>
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
                               aiPrompt.trim() &&
                               <Image
                                  src={AI_DESIGN_PLACEHOLDER_IMG}
                                  alt="Placeholder Diseño IA"
                                  width={250}
                                  height={250}
                                  className="object-contain w-full h-full opacity-40"
                                  data-ai-hint={AI_DESIGN_PLACEHOLDER_HINT}
                                />
                          )}
                          { !aiPrompt.trim() && !aiGeneratedImageUrl && !isGeneratingImage && (
                              <p className="text-sm text-muted-foreground p-4 text-center">Ingresa una descripción y haz clic en &quot;Generar Diseño con IA&quot; para ver una vista previa.</p>
                          )}
                          </div>
                      </div>
                  )}
                   {aiPrompt.trim() && (
                    <div className="mt-4 p-3 rounded-lg border border-accent/50 bg-accent/10 text-accent font-medium text-sm flex items-center gap-2.5 shadow-sm">
                      <Info className="h-5 w-5 shrink-0" />
                      <span>Importante: La imagen generada por IA debes enviarla a nuestro WhatsApp para confirmar el diseño.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          
          <div className="lg:col-span-1 mt-12 lg:mt-0 sticky top-24 z-10 self-start">
            <div ref={summarySectionRef} className="bg-card p-6 md:p-8 rounded-xl shadow-xl border border-border scroll-mt-24">
              <h3 className="text-2xl md:text-3xl font-headline font-semibold text-center text-primary mb-6">Resumen de tu Selección</h3>
              {selectedProductType || selectedColor || finalSelectedDesign || (aiPrompt.trim() && aiGeneratedImageUrl) ? (
                <div className="space-y-3 mb-8 text-center font-body text-muted-foreground">
                  <p><strong>Tipo de Prenda:</strong> {selectedProductType?.name || 'No seleccionado'} ({selectedProductType ? `$${selectedProductType.price.toFixed(2)}` : ''})</p>
                  {selectedProductType?.hasSizes && <p><strong>Talla:</strong> {currentSelectedSize?.name || 'No seleccionada'}</p>}
                  <p><strong>Color:</strong> {selectedColor?.name || 'No seleccionado'}</p>
                  <p><strong>Diseño:</strong> {designSummaryName} {designPriceString && `(${designPriceString})`}</p>

                  {(selectedProductType && (finalSelectedDesign || (aiPrompt.trim() && aiGeneratedImageUrl))) && (
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
                disabled={
                  !isClient || 
                  !selectedProductTypeId || 
                  (selectedProductType?.hasSizes && !selectedSize) || 
                  !selectedColorId || 
                  (!selectedDesignId && (!aiPrompt.trim() || !aiGeneratedImageUrl)) ||
                  (aiPrompt.trim() && !aiGeneratedImageUrl && !selectedDesignId) || 
                  isGeneratingImage
                }
                className="w-full font-headline font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-lg hover:shadow-primary/40 transition-all duration-300 disabled:opacity-70"
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

