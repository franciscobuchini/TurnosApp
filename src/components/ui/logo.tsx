import type { SVGProps } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Logo(props: SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;

  return (
    <svg className={twMerge('w-auto overflow-visible', className)} width="189" height="175" viewBox="-14 -12 217 199" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <defs>
        <clipPath id="logoClip">
          <path d="M61.3633 7.22777C99.7669 -13.3506 114.099 16.5442 114.137 16.6233C114.137 16.6233 131.726 1.54123 150.136 12.9465C171.384 26.1112 163.654 54.1387 163.637 54.2014C163.764 54.2191 189 57.7782 189 93.4143C189 129.359 146.863 139.571 146.863 139.571C146.859 139.658 145.582 164.845 114.137 173C86.0155 180.293 71.1981 157.16 71.1816 157.134C71.1816 157.134 50.2117 175.106 31.499 157.134C15.9548 142.204 24.5449 126.499 24.5449 126.499C24.5449 126.499 -0.00022267 126.499 1.51504e-09 97.4993C0.000479176 52.5948 38.0459 47.6672 38.0459 47.6672C38.0459 47.6672 38.4537 19.5038 61.3633 7.22777ZM94 74.0022V86.0012H100V92.0002H106V98.0002H148V92.0002H160V74.0022H154V80.0012H106V74.0022H94ZM118 32.0002V73.9973H130V32.0002H118ZM136 32.0002V73.9973H142V32.0002H136Z" />
        </clipPath>
        <filter id="logoBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <g clipPath="url(#logoClip)">
        <rect x="0" y="0" width="189" height="175" fill="#C7ACFF" />
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