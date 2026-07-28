import { twMerge } from 'tailwind-merge';

/* HeaderStyle: clases de estilo, estas si se pueden variar */
const HeaderStyle = {
  header: 'h-(--size-3xl) bg-black',
};

export default function Header() {
  return (
    <header className={twMerge('z-100', HeaderStyle.header)}></header>
  );
}
