import Link from 'next/link';
import { User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const navItems = [
  { href: '#collections', label: 'Colecciones' },
  { href: '#create-idea', label: 'Crea tu idea' },
  { href: '#contact', label: 'Contacto' },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="text-2xl md:text-3xl font-headline font-bold text-foreground">
          FlashPrint<span className="text-primary">Designs</span>
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
            <User className="h-6 w-6 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Carrito de compras">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú" className="md:hidden">
                <Menu className="h-7 w-7 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background p-6">
              <Link href="/" className="text-2xl font-headline font-bold text-foreground mb-8 block">
                FlashPrint<span className="text-primary">Designs</span>
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
