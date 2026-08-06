import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import Box from '../interface/Box';
import Button from '../interface/Button';
import MainHeader from '../interface/MainHeader';

interface ModalProps {
  open?: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
}

const ModalOverlayClasses = {
  required: 'fixed inset-0 z-[10000] flex items-center justify-center',
  style: 'bg-black/60 backdrop-blur-(--size-xs)',
};

const ModalContainerClasses = {
  required: 'relative w-full max-w-6xl overflow-hidden rounded-3xl bg-neutral-900 text-white',
  style: '',
};

const ModalHeaderClasses = {
  required: 'p-(--size-m)',
  style: '',
};

const ModalCloseButtonClasses = {
  required: 'h-(--size-xl) w-(--size-xl) rounded-full',
  style: '',
};

const ModalBodyClasses = {
  required: 'min-h-[70vh] overflow-y-auto px-(--size-m) py-(--size-s)',
  style: '',
};

const ModalFooterClasses = {
  required: 'px-(--size-m) py-(--size-s)',
  style: '',
};

export default function Modal({
  open = false,
  title,
  children,
  footer,
  onClose,
  closeLabel = 'Cerrar modal',
  className,
  contentClassName,
  overlayClassName,
}: ModalProps) {
  if (!open) return null;

  return createPortal(
    <div className={twMerge(ModalOverlayClasses.required, ModalOverlayClasses.style, overlayClassName)}>
      <Box className={twMerge(ModalContainerClasses.required, ModalContainerClasses.style, className)}>
        {title && (
          <MainHeader
            title={title}
            className={twMerge(ModalHeaderClasses.required, ModalHeaderClasses.style)}
            action={
              onClose ? (
                <Button
                  type="button"
                  aria-label={closeLabel}
                  onClick={onClose}
                  icon={<X size={'var(--size-m)'} />}
                  className={twMerge(ModalCloseButtonClasses.required, ModalCloseButtonClasses.style)}
                />
              ) : undefined
            }
          />
        )}

        {children && (
          <div className={twMerge(ModalBodyClasses.required, ModalBodyClasses.style, contentClassName)}>
            {children}
          </div>
        )}

        {footer && (
          <div className={twMerge(ModalFooterClasses.required, ModalFooterClasses.style)}>
            {footer}
          </div>
        )}
      </Box>
    </div>,
    document.body,
  );
}
