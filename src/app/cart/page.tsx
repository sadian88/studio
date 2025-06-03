
'use client';

import { useCart, type CartItem } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, MinusCircle, ShoppingBag, ArrowLeft, Sparkles, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';

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
      message += `Diseño: ${item.design.name}`;
      if (item.design.id.startsWith('ai-generated')) {
          message += " (Generado por IA)";
      }
      message += ".\n";
      if (item.aiPrompt) {
        message += `  Tu idea: "${item.aiPrompt}"\n`;
      }
    });
    message += `\nSubtotal: $${getCartTotal().toFixed(2)}\n\n`;
    message += "¡Gracias por tu pedido!";
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
                <p className="text-lg font-semibold text-primary mt-2 sm:mt-auto">${(item.price * item.quantity).toFixed(2)}</p>
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
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Subtotal ({getItemCount()} items):</span>
                <span className="font-semibold text-foreground">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Envío:</span>
                <span className="font-semibold text-foreground">Por calcular</span>
              </div>
              <Separator className="my-4 bg-border/60" />
              <div className="flex justify-between font-body text-xl md:text-2xl">
                <span className="font-bold text-foreground">Total Estimado:</span>
                <span className="font-bold text-primary">${getCartTotal().toFixed(2)}</span>
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
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1.5 h-5 w-5"
                  >
                    <path d="M21.926 13.151c-.346-.173-1.401-.692-1.62-.772-.218-.08-.375-.12-.533.12-.158.24-.613.772-.752.931-.14.158-.279.178-.518.059-.24-.12-.962-.355-1.833-.913-.733-.59-1.22-1.33-1.38-1.568-.158-.24-.02-.375.1-.494.108-.108.24-.279.359-.42.12-.14.158-.24.238-.398.08-.158.04-.298-.02-.418-.059-.12-.533-1.284-.732-1.743s-.39-.38-.532-.388c-.131-.009-.28.001-.428.001h-.01c-.178 0-.457.06-.696.3c-.24.24-.923.903-.923 2.204 0 1.3.943 2.552 1.082 2.73.14.178 1.853 2.83 4.492 3.968.62.269 1.1.418 1.483.532.645.198 1.222.168 1.678.1.498-.079 1.401-.573 1.6-1.126.198-.552.198-1.027.14-1.126-.061-.101-.219-.16-.458-.333z"></path>
                    <path d="M12.074 2.074c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18.333c-4.602 0-8.333-3.73-8.333-8.333s3.73-8.333 8.333-8.333 8.333 3.731 8.333 8.333-3.731 8.333-8.333 8.333z"></path>
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
