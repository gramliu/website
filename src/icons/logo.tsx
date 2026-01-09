import clsx from "clsx";
import React from "react";

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 802.96 802.96"
      height="150"
      width="150"
      className={clsx("group text-text-highlight", className)}
    >
      <circle
        className="logo-circle group-hover:fill-bgcolor-highlight transition-all"
        cx="401.48"
        cy="401.48"
        r="391.48"
        fill="none"
        stroke="currentColor"
        strokeWidth="20px"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <path
        className="logo-G"
        d="M599.17,342.4a189.78,189.78,0,0,0-87.17-21c-105.29,0-190.65,85.36-190.65,190.65S406.71,702.65,512,702.65,702.65,617.29,702.65,512H491.34"
        transform="translate(-110.52 -110.52)"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="50px"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
    </svg>
  );
}
