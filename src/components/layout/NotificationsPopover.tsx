/*
  src/components/layout/NotificationsPopover.tsx
  Panel flotante de notificaciones de solicitudes de turno.
  Muestra las solicitudes pendientes realizadas por los clientes desde /site,
  permitiendo al administrador confirmar o rechazar cada una.
*/

import { useState } from 'react';
import {
  Bell,
  Check,
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { BookingRequest } from '@/database/types';
import { currencyFormatter } from '@/database/data';
import { formatDateKeyToDisplay } from '@/utils/dateName';
import { cn } from '@/lib/utils';

interface NotificationsPopoverProps {
  requests: BookingRequest[];
  onConfirm: (request: BookingRequest) => void;
  onReject: (request: BookingRequest) => void;
  className?: string;
  triggerClassName?: string;
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  } catch {
    return '';
  }
}

export default function NotificationsPopover({
  requests,
  onConfirm,
  onReject,
  className,
  triggerClassName,
}: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const count = pendingRequests.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={count > 0 ? `Notificaciones (${count} pendientes)` : 'Notificaciones'}
          title={count > 0 ? `Notificaciones (${count} pendientes)` : 'Notificaciones'}
          className={cn(
            'relative flex size-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none cursor-pointer',
            isOpen && 'bg-accent/50 text-foreground',
            triggerClassName,
          )}
        >
          <Bell className="size-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground shadow-md animate-in zoom-in-50">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={14}
        className={cn(
          'w-[380px] max-w-[92vw] overflow-hidden rounded-3xl border border-border bg-popover/95 p-0 shadow-2xl backdrop-blur-xl',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5 bg-card/40">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">Solicitudes de turno</h3>
            {count > 0 && (
              <span className="flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {count} {count === 1 ? 'pendiente' : 'pendientes'}
              </span>
            )}
          </div>
          {count > 0 && (
            <span className="text-[11px] text-muted-foreground">Web /site</span>
          )}
        </div>

        {/* Content list */}
        <div className="max-h-[460px] overflow-y-auto p-3 flex flex-col gap-3 [scrollbar-width:thin]">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
                <Bell className="size-6 opacity-60" />
              </div>
              <p className="font-medium text-sm text-foreground">Sin solicitudes pendientes</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Cuando un cliente solicite un turno desde el sitio web, vas a poder revisarlo y confirmarlo acá.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => {
              const formattedDate = formatDateKeyToDisplay(req.date);
              const relativeTime = formatRelativeTime(req.createdAt);

              return (
                <div
                  key={req.id}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  {/* Top: Client name & Time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase">
                        {req.client.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{req.client.name}</p>
                        <span className="text-[11px] text-muted-foreground">{relativeTime}</span>
                      </div>
                    </div>
                    {req.price !== undefined && req.price > 0 && (
                      <span className="shrink-0 rounded-lg bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-foreground">
                        {currencyFormatter.format(req.price)}
                      </span>
                    )}
                  </div>

                  {/* Service & Professional Info */}
                  <div className="flex flex-col gap-1.5 rounded-xl bg-muted/40 p-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Sparkles className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{req.service}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">Con {req.member}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate capitalize">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{req.startTime} - {req.endTime} hs</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {req.client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="size-3 shrink-0" />
                        <span className="font-mono text-[11px]">{req.client.phone}</span>
                      </div>
                    )}
                    {req.client.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="size-3 shrink-0" />
                        <span className="truncate max-w-[160px] text-[11px]">{req.client.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Client Note */}
                  {req.client.notes && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-accent/20 px-2.5 py-1.5 text-xs text-muted-foreground italic">
                      <MessageSquare className="size-3 shrink-0 mt-0.5 text-muted-foreground" />
                      <span className="line-clamp-2">{req.client.notes}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    <Button
                      variant="destructive"
                      size="sm"
                      icon={<X size={14} />}
                      onClick={() => onReject(req)}
                      className="flex-1 h-8 rounded-xl text-xs gap-1.5"
                    >
                      Rechazar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      icon={<Check size={14} />}
                      onClick={() => onConfirm(req)}
                      className="flex-1 h-8 rounded-xl text-xs gap-1.5 font-medium shadow-sm"
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
