/*
  src/site/components/SiteButton.tsx
  Botón/link del sitio público, hermano de components/ui/button.tsx pero
  atado a los tokens del SiteConfig (--site-primary, --site-radius) en vez
  del acento fijo del panel admin — así el theme elegido en Personalización
  se refleja en cada botón del sitio. siteButtonVariants queda exportado
  para que agregar un "estilo de botón" nuevo (personalización futura) sea
  sumar una variante acá, no tocar cada sección.
*/

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export const siteButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-(--site-radius) px-6 py-3 text-sm font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-(--site-primary) text-(--site-primary-foreground) hover:opacity-90',
        outline: 'border border-(--site-border) text-(--site-text) hover:bg-(--site-bg)',
        ghost: 'text-(--site-text-muted) hover:text-(--site-text)',
      },
      size: {
        default: '',
        sm: 'px-4 py-2 text-sm',
        xs: 'px-3 py-1.5 text-xs',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

interface SiteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof siteButtonVariants> {
  icon?: ReactNode;
}

export default function SiteButton({ variant, size, icon, className, children, type, ...props }: SiteButtonProps) {
  return (
    <button type={type ?? 'button'} className={twMerge(siteButtonVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

interface SiteLinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof siteButtonVariants> {
  icon?: ReactNode;
}

export function SiteLinkButton({ variant, size, icon, className, children, ...props }: SiteLinkButtonProps) {
  return (
    <a className={twMerge(siteButtonVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </a>
  );
}
