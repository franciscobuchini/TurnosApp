import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm whitespace-nowrap outline-none transition-all duration-150 ease-out active:scale-[0.97] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-(--palette-01) text-black hover:bg-(--palette-01)/70",
        destructive:
          "bg-destructive text-background hover:bg-destructive/90",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-2 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "type">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Si se pasa, el botón se renderiza como <Link to={to}> (react-router). */
  to?: string
  icon?: React.ReactNode
  text?: React.ReactNode
  type?: "button" | "submit" | "reset"
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      to,
      icon,
      text,
      children,
      type,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }))
    const content = (
      <>
        {text !== undefined ? <span>{text}</span> : null}
        {children}
        {icon ? <span>{icon}</span> : null}
      </>
    )

    if (to) {
      return (
        <Link
          to={to}
          ref={ref as React.Ref<HTMLAnchorElement>}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={classes}
          aria-disabled={disabled}
          {...(props as React.ComponentProps<"a">)}
        >
          {content}
        </Link>
      )
    }

    const Comp = asChild ? Slot.Root : "button"

    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={classes}
        type={type ?? "button"}
        disabled={disabled}
        {...props}
      >
        {content}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
