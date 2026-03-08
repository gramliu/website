import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import LogoIcon from "../icons/logo";

type NavLink = {
  label: string;
  link: string;
  target?: string;
};

const links: NavLink[] = [
  {
    label: "About",
    link: "/#about",
  },
  {
    label: "Portfolio",
    link: "/#portfolio",
  },
  {
    label: "Blog",
    link: "/blogs",
  },
  {
    label: "Library",
    link: "/library",
  },
];

const divider = <span className="text-divider text-2xl">|</span>;

function scrollToSection(targetId: string) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const navHeight = 100;
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

export default function NavPill() {
  const router = useRouter();
  const path = router.pathname;
  const isHome = path === "/";

  const navLinks = links.map((linkTarget, index) => {
    if (!linkTarget.link.startsWith("/#") || !isHome) {
      return (
        <a
          href={linkTarget.link}
          className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
          target={linkTarget.target}
          key={index}
        >
          {linkTarget.label}
        </a>
      );
    } else {
      return (
        <div
          className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
          onClick={() => {
            scrollToSection(linkTarget.link.substring(2));
          }}
          key={index}
        >
          {linkTarget.label}
        </div>
      );
    }
  });
  const navLinksDivided = navLinks.reduce((acc, curr) => {
    return acc.length === 0 ? [curr] : [...acc, divider, curr];
  }, [] as ReactElement[]);

  return (
    <div
      className="fixed w-full flex justify-center pt-8 backdrop-blur-sm z-10"
      id="navbar"
    >
      <motion.div
        initial={{ opacity: 0, translateY: -100 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          duration: 1,
          delay: isHome ? 0.7 : 0,
        }}
      >
        <div className="flex justify-center border rounded-[30rem] border-gray-500 bg-bgcolor-primary p-3 pr-4 md:p-4 md:pr-5">
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <Link
              href="/#home"
              className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
            >
              <LogoIcon className="h-8 w-auto" />
            </Link>
            {divider}
            {navLinksDivided}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
