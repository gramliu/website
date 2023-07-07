import React from "react";

export default function MailIcon({ className }: { className: string }) {
  return (
    <svg id="mail" x="0px" y="0px" viewBox="0 0 512 512" className={className}>
      <path
        d="M467,80.609H45c-24.813,0-45,20.187-45,45v260.782c0,24.813,20.187,45,45,45h422c24.813,0,45-20.187,45-45V125.609
        C512,100.796,491.813,80.609,467,80.609z M461.127,110.609l-6.006,5.001L273.854,266.551c-10.346,8.614-25.364,8.614-35.708,0
        L56.879,115.61l-6.006-5.001H461.127z M30,132.267L177.692,255.25L30,353.543V132.267z M467,401.391H45
        c-7.248,0-13.31-5.168-14.699-12.011l171.445-114.101l17.204,14.326c10.734,8.938,23.893,13.407,37.051,13.407
        c13.158,0,26.316-4.469,37.051-13.407l17.204-14.326l171.444,114.1C480.31,396.224,474.248,401.391,467,401.391z M482,353.543
        l-147.692-98.292L482,132.267V353.543z"
      />
    </svg>
  );
}
