import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/*
  src/components/ui/input.tsx
  Wrapper de campo (label + input/textarea) sobre los primitivos de shadcn.
  Se mantiene esta forma (en vez del <Input> "pelado" de shadcn) porque todos
  los formularios de la app arman el campo con label incluido.
*/

const INPUT_BASE_CLASS =
  "h-11 w-full min-w-0 rounded-md border border-border bg-transparent px-4 py-2 text-base outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-destructive aria-invalid:ring-destructive/20"

const INPUT_WITH_PREFIX_CLASS =
  "flex items-center h-11 w-full min-w-0 rounded-md border border-border bg-transparent outline-none has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50"

const INPUT_PREFIX_CLASS =
  "shrink-0 pl-4 text-base text-muted-foreground select-none md:text-sm"

const INPUT_INNER_CLASS =
  "h-full w-full min-w-0 bg-transparent py-2 pr-4 text-base outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

type BaseProps = {
  label?: string
  className?: string
  labelClassName?: string
  inputClassName?: string
  rows?: number
  optional?: boolean
  id?: string
  prefix?: ReactNode
}

type InputVariant = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & { textarea?: false | undefined }
type TextareaVariant = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id"> & { textarea: true }

type InputProps = InputVariant | TextareaVariant

export function Input({
  label,
  className,
  labelClassName,
  inputClassName,
  textarea = false,
  rows = 4,
  optional = false,
  id,
  prefix,
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  const field = textarea ? (
    <Textarea
      id={inputId}
      rows={rows}
      className={cn(INPUT_BASE_CLASS, "min-h-24 resize-none", inputClassName)}
      {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : prefix ? (
    <div className={cn(INPUT_WITH_PREFIX_CLASS, inputClassName)}>
      <span className={INPUT_PREFIX_CLASS}>{prefix}</span>
      <input
        id={inputId}
        className={INPUT_INNER_CLASS}
        {...(props as InputHTMLAttributes<HTMLInputElement>)}
      />
    </div>
  ) : (
    <input
      id={inputId}
      className={cn(INPUT_BASE_CLASS, inputClassName)}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  )

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label ? (
        <Label htmlFor={inputId} className={labelClassName}>
          {label}
          {optional ? " (opcional)" : null}
        </Label>
      ) : null}
      {field}
    </div>
  )
}
