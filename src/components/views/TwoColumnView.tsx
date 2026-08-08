import type { ReactNode } from 'react';
import MainContent from '../layout/MainContent';
import MainHeader from '../interface/MainHeader';
import BackButton from '../buttons/BackButton';

interface TwoColumnViewProps {
  title: string;
  left: ReactNode;
  right: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
}

const VIEW_LAYOUT_CLASS =
  'flex min-h-0 flex-1 flex-col';

const VIEW_COLUMNS_CLASS =
  'relative flex h-full w-full flex-1 flex-row gap-(--size-4xl) p-(--size-m)';

const VIEW_RIGHT_COLUMN_CLASS =
  'flex min-h-0 w-full flex-1';

const VIEW_FOOTER_CLASS =
  'flex justify-end gap-3 pt-(--size-m)';

export default function TwoColumnView({
  title,
  left,
  right,
  footer,
  onBack,
}: TwoColumnViewProps) {
  return (
    <MainContent>
      <MainHeader
        title={title}
        action={
          <BackButton onClick={onBack} />
        }
      />

      <div className={VIEW_LAYOUT_CLASS}>
        <div className={VIEW_COLUMNS_CLASS}>
          {left}

          <div className={VIEW_RIGHT_COLUMN_CLASS}>
            {right}
          </div>
        </div>
      </div>

      <div className={VIEW_FOOTER_CLASS}>
        {footer}
      </div>
    </MainContent>
  );
}