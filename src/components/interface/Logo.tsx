import type { SVGProps } from 'react';

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="189" height="175" viewBox="0 0 189 175" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <style>{`
        .logo-blob {
          transform-box: fill-box;
          transform-origin: center;
          mix-blend-mode: normal;
        }
        @keyframes blob1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          20%  { transform: translate(38px, -22px) scale(1.25); }
          45%  { transform: translate(-30px, 26px) scale(0.8); }
          70%  { transform: translate(22px, 34px) scale(1.15); }
          100% { transform: translate(-18px, -20px) scale(1); }
        }
        @keyframes blob2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(-40px, 18px) scale(0.85); }
          50%  { transform: translate(28px, -30px) scale(1.3); }
          75%  { transform: translate(34px, 20px) scale(0.9); }
          100% { transform: translate(-20px, -16px) scale(1.1); }
        }
        @keyframes blob3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(24px, 30px) scale(1.2); }
          55%  { transform: translate(-34px, -18px) scale(0.75); }
          80%  { transform: translate(-14px, 26px) scale(1.1); }
          100% { transform: translate(30px, -14px) scale(1); }
        }
        @keyframes blob4 {
          0%   { transform: translate(0px, 0px) scale(1); }
          22%  { transform: translate(-26px, -30px) scale(1.15); }
          48%  { transform: translate(32px, 16px) scale(0.85); }
          72%  { transform: translate(-18px, 24px) scale(1.25); }
          100% { transform: translate(20px, -22px) scale(1); }
        }
        @keyframes blob5 {
          0%   { transform: translate(0px, 0px) scale(1); }
          18%  { transform: translate(30px, 24px) scale(0.9); }
          46%  { transform: translate(-22px, -28px) scale(1.2); }
          74%  { transform: translate(-32px, 14px) scale(1); }
          100% { transform: translate(16px, -18px) scale(1.1); }
        }
        .b1 { animation: blob1 1.6s ease-in-out infinite; }
        .b2 { animation: blob2 1.1s ease-in-out infinite; }
        .b3 { animation: blob3 1.9s ease-in-out infinite; }
        .b4 { animation: blob4 1.3s ease-in-out infinite; }
        .b5 { animation: blob5 2.1s ease-in-out infinite; }
      `}</style>

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
          <circle className="logo-blob b1" cx="40" cy="50" r="55" fill="#E7FC6F" opacity="0.85" />
          <circle className="logo-blob b2" cx="140" cy="40" r="50" fill="#C4DEEB" opacity="0.85" />
          <circle className="logo-blob b3" cx="150" cy="120" r="60" fill="#C7ACFF" opacity="0.9" />
          <circle className="logo-blob b4" cx="60" cy="130" r="48" fill="#E7FC6F" opacity="0.8" />
          <circle className="logo-blob b5" cx="95" cy="85" r="42" fill="#C4DEEB" opacity="0.85" />
        </g>
      </g>
    </svg>
  );
}