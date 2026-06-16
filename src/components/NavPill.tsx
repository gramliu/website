import { motion, useReducedMotion } from "framer-motion";
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

const islandTransition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.9,
} as const;

const revealContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.16,
      staggerChildren: 0.055,
    },
  },
};

const revealItemVariants = {
  hidden: {
    opacity: 0,
    x: -8,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 32,
    },
  },
};

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
  const prefersReducedMotion = useReducedMotion();
  const path = router.pathname;
  const isHome = path === "/";
  const animationDelay = isHome ? 0.7 : 0;

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
  const navLinksDivided = navLinks.reduce((acc, curr, index) => {
    return acc.length === 0
      ? [curr]
      : [
          ...acc,
          <motion.span key={`divider-${index}`} variants={revealItemVariants}>
            {divider}
          </motion.span>,
          curr,
        ];
  }, [] as ReactElement[]);

  return (
    <div
      className="fixed w-full flex justify-center pt-8 backdrop-blur-sm z-10"
      id="navbar"
    >
      <motion.div
        className="flex justify-start overflow-hidden border rounded-[30rem] border-gray-500 bg-bgcolor-primary p-3 pr-4 md:p-4 md:pr-5 shadow-lg shadow-black/5"
        initial={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.92, width: 58 }
        }
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, width: "auto" }
        }
        transition={{
          ...islandTransition,
          delay: animationDelay,
        }}
      >
        <div className="flex flex-row items-center gap-2 md:gap-4 whitespace-nowrap">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0.85 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, delay: animationDelay }}
          >
            <Link
              href="/#home"
              className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
            >
              <LogoIcon className="h-8 w-auto" />
            </Link>
          </motion.div>
          <motion.div
            className="flex flex-row items-center gap-2 md:gap-4"
            variants={revealContainerVariants}
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            transition={{ delay: animationDelay }}
          >
            <motion.span variants={revealItemVariants}>{divider}</motion.span>
            {navLinksDivided.map((navLink) => (
              <motion.span
                key={String(navLink.key)}
                variants={revealItemVariants}
              >
                {navLink}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
