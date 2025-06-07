
'use client';

import { useCart, type CartItem } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, MinusCircle, ShoppingBag, ArrowLeft, Sparkles, Send, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';

// La constante AI_DESIGN_PLACEHOLDER_IMG_CHECK ha sido eliminada ya que no se utiliza más en esta página.

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, getItemCount } = useCart();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      title: 'Producto eliminado',
      description: 'El producto ha sido eliminado de tu carrito.',
      duration: 2000,
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };
  
  const handleClearCart = () => {
    clearCart();
    toast({
      title: 'Carrito vaciado',
      description: 'Todos los productos han sido eliminados de tu carrito.',
      duration: 2000,
    });
  };

  const generateWhatsAppMessage = useCallback(() => {
    let message = "Hola CAMISETIA, quiero hacer el siguiente pedido:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.quantity} x ${item.shirtType.name} `;
      if (item.size) {
        message += `Talla ${item.size.name}, `;
      }
      message += `Color ${item.color.name}. `;
      
      if (item.design.id.startsWith('ai-generated')) {
        message += `Diseño: Diseño Personalizado IA`;
        message += ".\n"; // Fin de la línea principal del ítem
        if (item.aiPrompt) {
            message += `  Tu idea original para la IA: "${item.aiPrompt}".\n`;
        }
        message += `  (La imagen que generaste con IA ha sido guardada automáticamente en nuestro sistema).\n`;
      } else {
        message += `Diseño: ${item.design.name}.\n`; // Fin de la línea principal del ítem
      }
      message += "\n"; // Añadir un salto de línea extra entre ítems para mejor legibilidad
    });
    message += `Subtotal: $${getCartTotal().toLocaleString('es-CO')}\n\n`;
    message += "¡Gracias!";
    return encodeURIComponent(message);
  }, [cartItems, getCartTotal]);

  if (!isClient) {
    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Cargando carrito...</p>
        </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12 md:py-20 text-center min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <ShoppingBag className="w-24 h-24 text-primary mb-6" />
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-4">Tu Carrito está Vacío</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Parece que no has agregado ningún producto a tu carrito todavía.
        </p>
        <Button asChild size="lg" className="font-headline">
          <Link href="/#create-idea">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver y Personalizar
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-10 text-center">Tu Carrito de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row overflow-hidden shadow-lg border-border bg-card">
              <div className="relative w-full sm:w-1/3 md:w-1/4 aspect-square sm:aspect-[3/4] flex-shrink-0">
                <Image
                  src={item.design.imgSrc} 
                  alt={`${item.shirtType.name} - ${item.color.name} - ${item.design.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  data-ai-hint={item.design.hint || (item.shirtType.id.includes('short') ? 'shortsleeve shirt' : 'longsleeve shirt')}
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-lg md:text-xl font-headline font-semibold text-foreground">{item.shirtType.name}</h2>
                {item.size && <p className="text-sm text-muted-foreground">Talla: {item.size.name}</p>}
                <p className="text-sm text-muted-foreground">Color: {item.color.name}</p>
                <p className="text-sm text-muted-foreground">
                  Diseño: {item.design.name}
                  {item.design.id.startsWith('ai-generated') && <Sparkles className="inline-block w-4 h-4 ml-1 text-accent" />}
                </p>
                {item.aiPrompt && (
                  <div className="mt-1 p-2 bg-muted/30 rounded-md">
                    <p className="text-xs font-semibold text-accent flex items-center"><Sparkles className="w-3 h-3 mr-1.5"/> Tu idea para IA:</p>
                    <p className="text-xs text-muted-foreground italic break-words">&quot;{item.aiPrompt}&quot;</p>
                  </div>
                )}
                <p className="text-lg font-semibold text-primary mt-2 sm:mt-auto">${(item.price * item.quantity).toLocaleString('es-CO')}</p>
                 <div className="flex items-center space-x-3 mt-3">
                  <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} aria-label="Reducir cantidad">
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar cantidad">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 mt-3 sm:ml-auto self-start sm:self-end"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar
                  </Button>
              </div>
            </Card>
          ))}
           {cartItems.length > 0 && (
            <div className="mt-6 text-right">
              <Button variant="outline" onClick={handleClearCart} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 border-destructive hover:border-destructive/90">
                <Trash2 className="mr-2 h-4 w-4" /> Vaciar Carrito
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl border-primary bg-card">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-headline text-primary">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 p-3 rounded-lg border border-primary/50 bg-primary/10 text-primary font-medium text-sm flex items-center gap-2.5 shadow-sm">
                <ImageIcon className="h-5 w-5 shrink-0" />
                <span>Nota: Te compartiremos una imagen simulada de tu diseño en la camiseta o gorra por WhatsApp.</span>
              </div>
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Subtotal ({getItemCount()} items):</span>
                <span className="font-semibold text-foreground">${getCartTotal().toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Envío:</span>
                <span className="font-semibold text-foreground">Por calcular</span>
              </div>
              <Separator className="my-4 bg-border/60" />
              <div className="flex justify-between font-body text-xl md:text-2xl">
                <span className="font-bold text-foreground">Total Estimado:</span>
                <span className="font-bold text-primary">${getCartTotal().toLocaleString('es-CO')}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <Button 
                asChild 
                size="lg" 
                className="w-full font-headline text-base"
              >
                <a 
                  href={`https://wa.me/3173196276?text=${isClient ? generateWhatsAppMessage() : 'Cargando detalles del pedido...'}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Enviar pedido a WhatsApp"
                  className="flex items-center justify-center"
                >
                  <Send className="mr-1.5 h-5 w-5" />
                  Enviar Pedido a
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="ml-1.5 h-5 w-5"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.669-1.611-.916-2.207c-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.634a11.86 11.86 0 005.79 1.525h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full font-headline">
                <Link href="/#create-idea">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Continuar Comprando
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
       <footer className="text-center p-8 text-muted-foreground font-body text-sm border-t border-border/40 mt-16">
        <p>&copy; {new Date().getFullYear()} CAMISETIA. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

