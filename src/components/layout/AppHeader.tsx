
'use client';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/#collections', label: 'Colecciones' },
  { href: '/#create-idea', label: 'Crea tu idea' },
  { href: '/#contact', label: 'Contacto' },
];

export default function AppHeader() {
  const { getItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      setItemCount(getItemCount());
    }
  }, [getItemCount, isClient]);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-0">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            className='pt-2'
            src="/logo.png" // Path to your logo in the public folder
            alt="CAMISETIA Logo"
            width={160} // Adjusted width
            height={40} // Adjusted height
            priority // Load logo quickly
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 font-body">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="icon" aria-label="Cuenta de usuario">
            <User className="h-6 w-6 text-accent" />
          </Button>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Carrito de compras" className="relative">
              <ShoppingCart className="h-6 w-6 text-accent" />
              {isClient && itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú" className="md:hidden">
                <Menu className="h-7 w-7 text-accent" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background p-6">
              <Link href="/" className="mb-8 block">
                <Image
                  src="/logo.png" // Path to your logo in the public folder
                  alt="CAMISETIA Logo"
                  width={160} // Adjusted width
                  height={50} // Adjusted height
                  priority
                />
              </Link>
              <nav className="flex flex-col space-y-5 font-body">
                {navItems.map((item) => (
                  <SheetClose key={item.label} asChild>
                    <Link
                      href={item.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                 <SheetClose asChild>
                    <Link
                      href="/cart"
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" /> Carrito {isClient && itemCount > 0 && `(${itemCount})`}
                    </Link>
                  </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
