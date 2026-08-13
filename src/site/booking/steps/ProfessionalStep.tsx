/*
  src/site/booking/steps/ProfessionalStep.tsx
  Paso opcional: sólo se muestra cuando hay más de un profesional
  calificado libre en el horario elegido (ver useBookingFlow.selectSlot).
  "Cualquiera disponible" queda arriba de todo para minimizar fricción a
  quien no tiene preferencia.
*/

import Image from '@/components/ui/image';
import type { SitePublicTeamMember } from '@/database/siteData';

interface ProfessionalStepProps {
  memberNames: string[];
  team: SitePublicTeamMember[];
  onSelect: (name: string) => void;
}

export default function ProfessionalStep({ memberNames, team, onSelect }: ProfessionalStepProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onSelect(memberNames[0])}
        className="cursor-pointer rounded-(--site-radius) border border-(--site-border) px-4 py-3 text-left font-medium transition-colors hover:bg-(--site-bg)"
      >
        Cualquiera disponible
      </button>

      {memberNames.map((name) => {
        const member = team.find((teamMember) => teamMember.name === name);

        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className="flex cursor-pointer items-center gap-3 rounded-(--site-radius) border border-(--site-border) px-4 py-3 text-left transition-colors hover:bg-(--site-bg)"
          >
            <Image src={member?.photo} name={name} className="size-8 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">{name}</span>
              {member?.role && <span className="text-xs text-(--site-text-muted)">{member.role}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
