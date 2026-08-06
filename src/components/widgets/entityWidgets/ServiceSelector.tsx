import Badge from '../../interface/Badge';
import { getservices } from '../../../database/data';

const SERVICE_SELECTOR_CLASS = 'flex flex-wrap gap-(--size-s)';
const SERVICE_BADGE_CLASS = 'cursor-pointer border border-neutral-200 bg-white text-neutral-700';
const SERVICE_BADGE_ACTIVE_CLASS = 'border-neutral-900 bg-neutral-900 text-white';
const SERVICE_FIELD_CLASS = 'flex flex-col gap-2';
const SERVICE_LABEL_CLASS = 'px-(--size-m) text-sm font-medium text-neutral-700';

interface ServiceSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const availableServices = getservices();

  return (
    <div className={SERVICE_FIELD_CLASS}>
      <label className={SERVICE_LABEL_CLASS}>Servicios que presta</label>
      <div className={SERVICE_SELECTOR_CLASS}>
        {availableServices.map((service) => {
          const isActive = value.includes(service.name);

          return (
            <Badge
              key={service.name}
              className={`${SERVICE_BADGE_CLASS} ${isActive ? SERVICE_BADGE_ACTIVE_CLASS : ''}`.trim()}
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
