import type { SVGProps } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Logo(props: SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;

  return (
    <svg className={twMerge('w-auto overflow-visible', className)} width="185" height="175" viewBox="-14 -12 213 199" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <defs>
        <clipPath id="logoClip">
          <path d="M83 0C96.2137 0 108.097 5.6959 116.329 14.7656C121.463 11.1337 127.733 9 134.5 9C151.897 9 166 23.103 166 40.5C166 44.9878 165.059 49.2553 163.367 53.1191C176.407 61.8127 185 76.6518 185 93.5C185 116.921 168.398 136.464 146.32 141.004C142.788 160.341 125.857 175 105.5 175C91.7302 175 79.5286 168.292 71.9795 157.968C66.6958 162.358 59.9068 165 52.5 165C35.6553 165 22 151.345 22 134.5C22 131.472 22.4429 128.547 23.2646 125.786C9.4874 119.035 0 104.877 0 88.5C0 66.7414 16.7453 48.8962 38.0518 47.1436C38.0184 46.4332 38 45.7186 38 45C38 20.1472 58.1472 0 83 0ZM97 80.002V92.001H103V98H109V104H151V98H163V80.002H157V86.001H109V80.002H97ZM121 38V79.9971H133V38H121ZM139 38V79.9971H145V38H139Z" />
        </clipPath>
        <filter id="logoBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <g clipPath="url(#logoClip)">
        <rect x="0" y="0" width="185" height="175" fill="#C7ACFF" />
        <g filter="url(#logoBlur)">
          <circle cx="40" cy="50" r="55" fill="#E7FC6F" opacity="0.85" />
          <circle cx="140" cy="40" r="50" fill="#C4DEEB" opacity="0.85" />
          <circle cx="150" cy="120" r="60" fill="#C7ACFF" opacity="0.9" />
          <circle cx="60" cy="130" r="48" fill="#E7FC6F" opacity="0.8" />
          <circle cx="95" cy="85" r="42" fill="#C4DEEB" opacity="0.85" />
        </g>
      </g>
    </svg>
  );
}