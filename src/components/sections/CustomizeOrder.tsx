
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ShoppingCart, ArrowRight, Sparkles, Loader2, Info, Download, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { generateDesign } from '@/ai/flows/generate-design-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const productTypes = [
 { id: 'short-sleeve', name: 'Manga Corta', imgSrc: '/camisetas/cnegramangacorta.png', hint: 'shortsleeve shirt', price: 50000, hasSizes: true },
 { id: 'long-sleeve', name: 'Manga Larga', imgSrc: '/camisetas/cnegramangalarga.png', hint: 'longsleeve shirt', price: 65000, hasSizes: true },
 { id: 'cap-printed', name: 'Gorra Estampada', imgSrc: '/camisetas/gorra.png', hint: 'cap design', price: 30000, hasSizes: false },
];

const sizes = [
  { id: 's', name: 'S' },
  { id: 'm', name: 'M' },
  { id: 'l', name: 'L' },
  { id: 'xl', name: 'XL' },
];

const colors = [
  { id: 'black', name: 'Negro', hex: '#000000', twClass: 'bg-black', borderClass: 'border-2 border-foreground' },
  { id: 'white', name: 'Blanco', hex: '#FFFFFF', twClass: 'bg-white', borderClass: 'border-gray-400' },
  { id: 'yellow', name: 'Amarillo', hex: '#F6E85C', twClass: 'bg-yellow-400' },
  { id: 'red', name: 'Rojo', hex: '#EF4444', twClass: 'bg-red-500' },
];

const designs = [
  { id: 'p1', name: 'Diseño 1', imgSrc: '/disenios/p1.png', hint: 'design 1', priceModifier: 0 },
  { id: 'p2', name: 'Diseño 2', imgSrc: '/disenios/p2.png', hint: 'design 2', priceModifier: 0 },
  { id: 'p3', name: 'Diseño 3', imgSrc: '/disenios/p3.png', hint: 'design 3', priceModifier: 0 },
  { id: 'p4', name: 'Diseño 4', imgSrc: '/disenios/p4.png', hint: 'design 4', priceModifier: 0 },
  { id: 'p5', name: 'Diseño 5', imgSrc: '/disenios/p5.png', hint: 'design 5', priceModifier: 0 },
  { id: 'p6', name: 'Diseño 6', imgSrc: '/disenios/p6.png', hint: 'design 6', priceModifier: 0 },
];

const aiStyles = [
    { id: 'ciberpunk', name: 'CiberPunk', promptSuffix: 'estilo CiberPunk' },
    { id: 'realista', name: 'Realista', promptSuffix: 'estilo Realista' },
    { id: 'poster', name: 'Poster', promptSuffix: 'estilo Poster' },
    { id: 'urbano-graffiti', name: 'Urbano Graffiti', promptSuffix: 'estilo Urbano Graffiti' },
    { id: 'neon', name: 'Neon', promptSuffix: 'estilo Neon' },
    { id: 'tierno', name: 'Tierno', promptSuffix: 'estilo Tierno' },
    { id: 'flat', name: 'Flat', promptSuffix: 'estilo Flat (Plano)' },
];

const aiBackgrounds = [
    { id: 'fondo-negro', name: 'Fondo Negro', promptSuffix: 'con fondo negro' },
    { id: 'fondo-blanco', name: 'Fondo Blanco', promptSuffix: 'con fondo blanco' },
];

const AI_GENERATED_DESIGN_PRICE_MODIFIER = 0;
const AI_DESIGN_PLACEHOLDER_IMG = 'https://placehold.co/250x250.png';
const AI_DESIGN_PLACEHOLDER_HINT = 'AI custom design';
const MAX_AI_PROMPT_LENGTH = 150;

export default function CustomizeOrder() {
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [userAiPrompt, setUserAiPrompt] = useState<string>('');
  const [selectedAiStyle, setSelectedAiStyle] = useState<string | null>(null);
  const [selectedAiBackground, setSelectedAiBackground] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const { toast } = useToast();
  const { addToCart } = useCart();

  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const designSectionRef = useRef<HTMLDivElement>(null);
  const summarySectionRef = useRef<HTMLDivElement>(null);
  const aiGenerationSectionRef = useRef<HTMLDivElement>(null);


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
    setUserAiPrompt('');
    setSelectedAiStyle(null);
    setSelectedAiBackground(null);
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
    setUserAiPrompt(''); 
    setSelectedAiStyle(null);
    setSelectedAiBackground(null);
    setAiGeneratedImageUrl(null); 
  };

  const handleUserAiPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = event.target.value;
    if (newPrompt.length <= MAX_AI_PROMPT_LENGTH) {
        setUserAiPrompt(newPrompt);
    } else {
        setUserAiPrompt(newPrompt.substring(0, MAX_AI_PROMPT_LENGTH));
    }
    if (newPrompt.trim()) {
      setSelectedDesignId(null); 
    }
  };

  const handleGenerateAiDesign = async () => {
    if (!userAiPrompt.trim()) {
      toast({ title: "Descripción Requerida", description: "Por favor, ingresa una descripción para tu idea.", variant: "destructive", duration: 3000 });
      return;
    }
    if (!selectedAiStyle) {
      toast({ title: "Estilo Requerido", description: "Por favor, selecciona un estilo para tu diseño IA.", variant: "destructive", duration: 3000 });
      return;
    }
    if (!selectedAiBackground) {
      toast({ title: "Fondo Requerido", description: "Por favor, selecciona un fondo para tu diseño IA.", variant: "destructive", duration: 3000 });
      return;
    }

    setIsGeneratingImage(true);
    setAiGeneratedImageUrl(null); 
    setSelectedDesignId(null); 

    const styleObj = aiStyles.find(s => s.id === selectedAiStyle);
    const backgroundObj = aiBackgrounds.find(b => b.id === selectedAiBackground);

    const fullPrompt = `${userAiPrompt.trim()}, ${styleObj?.promptSuffix}, ${backgroundObj?.promptSuffix}`;

    try {
      const result = await generateDesign({ prompt: fullPrompt });
      if (result.imageDataUri) {
        setAiGeneratedImageUrl(result.imageDataUri);
        toast({ title: "¡Diseño IA Generado!", description: "Tu imagen personalizada ha sido creada.", duration: 3000 });
      } else {
        throw new Error("No se recibió imagen del flujo de generación.");
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

  const handleSaveImage = () => {
    if (!aiGeneratedImageUrl) return;
    const link = document.createElement('a');
    link.href = aiGeneratedImageUrl;
    const userPromptPart = userAiPrompt.trim().substring(0, 20).replace(/\s+/g, '_') || 'ai_design';
    const stylePart = selectedAiStyle || 'custom_style';
    link.download = `cami_design_${userPromptPart}_${stylePart}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Imagen Guardada", description: "La descarga de la imagen debería haber comenzado.", duration: 3000});
  };

  const handleAddToCart = () => {
    if (!selectedProductTypeId || (selectedProductType?.hasSizes && !selectedSize) || !selectedColorId || (!selectedDesignId && !userAiPrompt.trim())) {
      let description = 'Por favor, completa todos los pasos de personalización.';
      if (!selectedProductTypeId) description = 'Por favor, elige un tipo de prenda.';
      else if (selectedProductType?.hasSizes && !selectedSize) description = 'Por favor, elige una talla.';
      else if (!selectedColorId) description = 'Por favor, elige un color.';
      else if (!selectedDesignId && !userAiPrompt.trim()) description = 'Por favor, elige un diseño predefinido o describe tu idea para IA.';
      
      toast({
        title: '¡Completa tu selección!',
        description,
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    if (userAiPrompt.trim() && (!selectedAiStyle || !selectedAiBackground)) {
        toast({
            title: 'Estilo y Fondo Requeridos para IA',
            description: 'Por favor, selecciona un estilo y un fondo si vas a generar un diseño con IA.',
            variant: 'destructive',
            duration: 3000,
        });
        return;
    }

    if (userAiPrompt.trim() && !aiGeneratedImageUrl && !selectedDesignId) {
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

    if (userAiPrompt.trim() && aiGeneratedImageUrl) {
      const uniqueAiId = `ai-generated-${Date.now()}`;
      designForCart = {
        id: uniqueAiId,
        name: 'Diseño Personalizado (IA)',
        imgSrc: aiGeneratedImageUrl,
        hint: 'AI generated custom design'
      };
      itemPrice += AI_GENERATED_DESIGN_PRICE_MODIFIER;
      promptForCart = userAiPrompt.trim(); 
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

  if (userAiPrompt.trim() && aiGeneratedImageUrl) {
    currentPrice += AI_GENERATED_DESIGN_PRICE_MODIFIER;
    designSummaryName = `Diseño IA: "${userAiPrompt.trim().substring(0, 30)}..."`;
    if (AI_GENERATED_DESIGN_PRICE_MODIFIER > 0) {
      designPriceString = `+$${AI_GENERATED_DESIGN_PRICE_MODIFIER.toLocaleString('es-CO')}`;
    } else if (AI_GENERATED_DESIGN_PRICE_MODIFIER === 0) {
        designPriceString = ''; 
    }
  } else if (finalSelectedDesign) {
    currentPrice += finalSelectedDesign.priceModifier;
    designSummaryName = finalSelectedDesign.name;
    if (finalSelectedDesign.priceModifier > 0) {
      designPriceString = `+$${finalSelectedDesign.priceModifier.toLocaleString('es-CO')}`;
    } else if (finalSelectedDesign.priceModifier === 0) {
      designPriceString = '';
    }
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
                        <p className="text-center text-sm text-muted-foreground">${type.price.toLocaleString('es-CO')}</p>
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
                <div className="flex items-center mb-6">
                  <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-3">
                    {selectedProductType?.hasSizes ? stepCounter + 1 : stepCounter}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">
                    Elige o Describe tu <a href="#ai-generation-area" className="text-accent hover:underline" onClick={(e) => { e.preventDefault(); scrollToSection(aiGenerationSectionRef);}}>Diseño con IA</a>
                  </h3>
                </div>
                <h4 className="text-xl font-body font-semibold text-foreground mb-4">Opción A: Escoge un Diseño Exclusivo</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                  {designs.map((design) => (
                    <Card
                      key={design.id}
                      onClick={() => handleSelectDesign(design.id)}
                      className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-accent/30 hover:-translate-y-1 rounded-xl overflow-hidden group ${
                        selectedDesignId === design.id && !userAiPrompt ? 'ring-4 ring-accent shadow-accent/20' : 'ring-1 ring-border hover:ring-accent/50'
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
                        {selectedDesignId === design.id && !userAiPrompt && (
                          <div className="absolute top-2 right-2 bg-accent rounded-full p-1 shadow-md">
                            <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                          </div>
                        )}
                        <div className="p-3 bg-card/80 backdrop-blur-sm">
                          <p className="text-xs md:text-sm font-body text-center text-foreground truncate group-hover:text-primary transition-colors">{design.name}</p>
                           {design.priceModifier > 0 && <p className="text-center text-xs text-muted-foreground">+${design.priceModifier.toLocaleString('es-CO')}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="my-8 bg-border/40" />

                <div ref={aiGenerationSectionRef} id="ai-generation-area" className="scroll-mt-24">
                    <h4 className="text-xl font-body font-semibold text-foreground mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-accent" />
                        Opción B: Describe tu idea para nuestro generador IA
                    </h4>

                    <Alert className="mb-6 border-primary/30 bg-primary/10 text-primary-foreground shadow-md">
                        <Info className="h-5 w-5 !text-primary" />
                        <AlertTitle className="font-headline text-primary">¡Información Importante!</AlertTitle>
                        <AlertDescription className="text-foreground/80 space-y-1.5">
                        <p className="flex items-start">
                            <Sparkles className="inline-block w-4 h-4 mr-1.5 mt-0.5 shrink-0 text-primary" />
                            <span>Puedes generar hasta <strong>3 diseños con nuestra IA cada 24 horas</strong>. ¡Explora tu creatividad!</span>
                        </p>
                        <p className="flex items-start">
                           <UploadCloud className="inline-block w-4 h-4 mr-1.5 mt-0.5 shrink-0 text-primary" />
                           <span>Si ya tienes una imagen o un diseño listo, ¡genial! Puedes saltarte este paso. Al enviar tu pedido por WhatsApp, podrás compartirnos tu archivo.</span>
                        </p>
                        </AlertDescription>
                    </Alert>

                    <div className="mb-4 p-4 border border-dashed border-border rounded-lg bg-card/50">
                        <div className="mb-4">
                            <label htmlFor="ai-style" className="block text-sm font-medium text-foreground mb-1">Estilo (Obligatorio):</label>
                            <div className="flex flex-wrap gap-2">
                                {aiStyles.map(style => (
                                <Button
                                    key={style.id}
                                    variant={selectedAiStyle === style.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedAiStyle(style.id)}
                                    className={selectedAiStyle === style.id ? 'bg-accent text-accent-foreground' : ''}
                                >
                                    {style.name}
                                </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="ai-background" className="block text-sm font-medium text-foreground mb-1">Fondo (Obligatorio):</label>
                            <div className="flex flex-wrap gap-2">
                                {aiBackgrounds.map(bg => (
                                <Button
                                    key={bg.id}
                                    variant={selectedAiBackground === bg.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedAiBackground(bg.id)}
                                    className={selectedAiBackground === bg.id ? 'bg-accent text-accent-foreground' : ''}
                                >
                                    {bg.name}
                                </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Textarea
                        placeholder="Ej: Un gato ninja, un león psicodélico..."
                        value={userAiPrompt}
                        onChange={handleUserAiPromptChange}
                        maxLength={MAX_AI_PROMPT_LENGTH}
                        className="min-h-[100px] text-base border-input focus:ring-accent bg-card placeholder:text-muted-foreground/70"
                        rows={3}
                    />
                    <div className="text-right text-xs text-muted-foreground mt-1">
                        {userAiPrompt.length}/{MAX_AI_PROMPT_LENGTH} caracteres
                    </div>
                    <Button
                        onClick={handleGenerateAiDesign}
                        disabled={!userAiPrompt.trim() || !selectedAiStyle || !selectedAiBackground || isGeneratingImage}
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
                    {userAiPrompt.trim() && AI_GENERATED_DESIGN_PRICE_MODIFIER > 0 && ( 
                        <p className="text-xs text-muted-foreground mt-2">
                        Costo adicional por diseño IA: +${AI_GENERATED_DESIGN_PRICE_MODIFIER.toLocaleString('es-CO')}
                        </p>
                    )}

                    {(userAiPrompt.trim() || aiGeneratedImageUrl) && ( 
                        <div className={`mt-4 p-4 border border-dashed rounded-lg bg-card/30 ${userAiPrompt.trim() ? 'border-accent/50' : 'border-transparent'}`}>
                            <h5 className="text-sm font-body font-semibold text-accent mb-2">Vista Previa Diseño IA</h5>
                            <div className="flex flex-col items-center">
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
                                        data-ai-hint="AI generated custom design"
                                    />
                                ) : ( 
                                    userAiPrompt.trim() &&
                                    <Image
                                        src={AI_DESIGN_PLACEHOLDER_IMG}
                                        alt="Placeholder Diseño IA"
                                        width={250}
                                        height={250}
                                        className="object-contain w-full h-full opacity-40"
                                        data-ai-hint={AI_DESIGN_PLACEHOLDER_HINT}
                                    />
                                )}
                                { !userAiPrompt.trim() && !aiGeneratedImageUrl && !isGeneratingImage && (
                                    <p className="text-sm text-muted-foreground p-4 text-center">Ingresa una descripción y haz clic en &quot;Generar Diseño con IA&quot; para ver una vista previa.</p>
                                )}
                                </div>
                                {aiGeneratedImageUrl && !isGeneratingImage && (
                                <Button onClick={handleSaveImage} variant="secondary" size="sm" className="mt-3">
                                    <Download className="mr-2 h-4 w-4" />
                                    Guardar Imagen
                                </Button>
                                )}
                            </div>
                        </div>
                    )}
                    {userAiPrompt.trim() && (
                        <div className="mt-4 p-3 rounded-lg border border-accent/50 bg-accent/10 text-accent font-medium text-sm flex items-center gap-2.5 shadow-sm">
                        <Info className="h-5 w-5 shrink-0" />
                        <span>Importante: La imagen generada por IA se guarda automáticamente en nuestro sistema. Te contactaremos por WhatsApp para confirmar los detalles del diseño.</span>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>

          
          <div className="lg:col-span-1 mt-12 lg:mt-0 sticky top-24 z-10 self-start">
            <div ref={summarySectionRef} className="bg-card p-6 md:p-8 rounded-xl shadow-xl border border-border scroll-mt-24">
              <h3 className="text-2xl md:text-3xl font-headline font-semibold text-center text-primary mb-6">Resumen de tu Selección</h3>
              {selectedProductType || selectedColor || finalSelectedDesign || (userAiPrompt.trim() && aiGeneratedImageUrl) ? (
                <div className="space-y-3 mb-8 text-center font-body text-muted-foreground">
                  <p><strong>Tipo de Prenda:</strong> {selectedProductType?.name || 'No seleccionado'} {selectedProductType ? `($${selectedProductType.price.toLocaleString('es-CO')})` : ''}</p>
                  {selectedProductType?.hasSizes && <p><strong>Talla:</strong> {currentSelectedSize?.name || 'No seleccionada'}</p>}
                  <p><strong>Color:</strong> {selectedColor?.name || 'No seleccionado'}</p>
                  <p><strong>Diseño:</strong> {designSummaryName} {designPriceString}</p>

                  {(selectedProductType && (finalSelectedDesign || (userAiPrompt.trim() && aiGeneratedImageUrl))) && (
                    <p className="text-lg font-bold text-foreground mt-2">
                      Precio Unitario Estimado: ${currentPrice.toLocaleString('es-CO')}
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
                  (!selectedDesignId && (!userAiPrompt.trim() || !aiGeneratedImageUrl || !selectedAiStyle || !selectedAiBackground)) ||
                  (userAiPrompt.trim() && (!selectedAiStyle || !selectedAiBackground || !aiGeneratedImageUrl) && !selectedDesignId) || 
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

