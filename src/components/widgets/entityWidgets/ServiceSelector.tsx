import Badge from '../../interface/Badge';
import { getservices } from '../../../database/data';

const SERVICE_SELECTOR_CLASSES = 'flex flex-wrap gap-(--size-s)';
const SERVICE_BADGE_CLASSES = 'cursor-pointer border border-neutral-200 bg-white text-neutral-700';
const SERVICE_BADGE_ACTIVE_CLASSES = 'border-neutral-900 bg-neutral-900 text-white';
const SERVICE_FIELD_CLASSES = 'flex flex-col gap-2';
const SERVICE_LABEL_CLASSES = 'px-(--size-m) text-sm font-medium text-neutral-700';

interface ServiceSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const availableServices = getservices();

  return (
    <div className={SERVICE_FIELD_CLASSES}>
      <label className={SERVICE_LABEL_CLASSES}>Servicios que presta</label>
      <div className={SERVICE_SELECTOR_CLASSES}>
        {availableServices.map((service) => {
          const isActive = value.includes(service.name);

          return (
            <Badge
              key={service.name}
              className={`${SERVICE_BADGE_CLASSES} ${isActive ? SERVICE_BADGE_ACTIVE_CLASSES : ''}`.trim()}
              onClick={() => {
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
