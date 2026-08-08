import Badge from '../../interface/Badge';
import { getservices } from '../../../database/data';
import { SERVICE_COLOR_BY_ID } from '../serviceWidgets/serviceColors';

const SERVICE_SELECTOR_CLASS = 'flex flex-wrap gap-(--size-m)';
const SERVICE_FIELD_CLASS = 'flex flex-col gap-(--size-m)';
const SERVICE_BADGE_CLASS = 'cursor-pointer border-none bg-neutral-950 text-neutral-500';
const SERVICE_BADGE_ACTIVE_CLASS = 'text-neutral-900';
const SERVICE_LABEL_CLASS = 'text-md text-neutral-300 px-(--size-s)';

interface ServiceSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function ServiceSelector({ value, onChange, disabled = false }: ServiceSelectorProps) {
  const availableServices = getservices();

  return (
    <div className={SERVICE_FIELD_CLASS}>
      <label className={SERVICE_LABEL_CLASS}>Servicios que presta</label>
      <div className={SERVICE_SELECTOR_CLASS}>
        {availableServices.map((service) => {
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
    </div>
  );
}
