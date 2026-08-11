import { Label } from '@/components/ui/label';
import Badge from '@/components/ui/badge';
import { getservices } from '../../../database/data';
import { SERVICE_COLOR_BY_ID } from '../serviceWidgets/serviceColors';

const SERVICE_SELECTOR_CLASS = 'flex flex-wrap gap-4';
const SERVICE_FIELD_CLASS = 'flex flex-col gap-4';
const SERVICE_BADGE_CLASS = 'cursor-pointer border-none bg-background text-muted-foreground';
const SERVICE_BADGE_ACTIVE_CLASS = 'text-black';

interface ServiceSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  showOnlySelected?: boolean;
}

export default function ServiceSelector({ value, onChange, disabled = false, showOnlySelected = false }: ServiceSelectorProps) {
  const availableServices = getservices();
  const visibleServices = showOnlySelected
    ? availableServices.filter((service) => value.includes(service.name))
    : availableServices;

  return (
    <div className={SERVICE_FIELD_CLASS}>
      <Label>Servicios que presta</Label>
      {visibleServices.length === 0 ? (
        <p className="text-muted-foreground text-sm px-3">
          Este miembro no presta ningún servicio
        </p>
      ) : (
        <div className={SERVICE_SELECTOR_CLASS}>
          {visibleServices.map((service) => {
            const isActive = value.includes(service.name);
            const colorClassName = SERVICE_COLOR_BY_ID[service.colorId ?? '']?.className ?? '';

            return (
              <Badge
                key={service.name}
                className={`${SERVICE_BADGE_CLASS} ${isActive ? `${SERVICE_BADGE_ACTIVE_CLASS} ${colorClassName}` : ''}`.trim()}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  onChange(
                    value.includes(service.name)
                      ? value.filter((item) => item !== service.name)
                      : [...value, service.name],
                  );
                }}
              >
                {service.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
