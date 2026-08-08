import type { ReactNode } from 'react';
import MainContent from '../layout/MainContent';
import MainHeader from '../interface/MainHeader';
import BackButton from '../buttons/BackButton';

interface ViewLayoutProps {
  title: string;
  left: ReactNode;
  right: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
}

const VIEW_LAYOUT_CLASS =
  'flex min-h-0 w-full flex-1 flex-col p-(--size-l)';

const VIEW_COLUMNS_CLASS =
  'relative flex h-full w-full flex-1 flex-row gap-(--size-4xl)';

const VIEW_LEFT_COLUMN_CLASS =
  'flex min-h-0 w-full flex-1';

const VIEW_RIGHT_COLUMN_CLASS =
  'flex min-h-0 w-full flex-1';

const VIEW_FOOTER_CLASS =
  'flex justify-end gap-3 p-(--size-l) bg-neutral-900 z-10';

export default function ViewLayout({
  title,
  left,
  right,
  footer,
  onBack,
}: ViewLayoutProps) {
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
          <div className={VIEW_LEFT_COLUMN_CLASS}>
            {left}
          </div>

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