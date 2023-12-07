import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { scroller } from "react-scroll";
import LogoIcon from "../icons/logo";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  {
    label: "About",
    link: "/#about",
  },
  {
    label: "Portfolio",
    link: "/#portfolio",
  },
  {
    label: "Resume",
    link: "/Gram_Liu_Resume.pdf",
    target: "_blank",
  },
  {
    label: "Bookshelf",
    link: "/bookshelf",
  },
];

const divider = <span className="text-divider text-2xl">|</span>;

export default function NavPill() {
  const router = useRouter();
  const path = router.pathname;
  const isHome = path === "/";

  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen && scrollTarget) {
      // Drawer was closed. Go to scroll target
      scroller.scrollTo(scrollTarget, {
        smooth: true,
      });
    }
  }, [drawerOpen, scrollTarget]);

  const navLinks = links.map((linkTarget, index) => {
    if (!linkTarget.link.startsWith("/#") || !isHome) {
      return (
        <a
          href={linkTarget.link}
          className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
          target={linkTarget.target}
          key={index}
          onClick={() => setDrawerOpen(false)}
        >
          {linkTarget.label}
        </a>
      );
    } else {
      return (
        <div
          className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
          onClick={() => {
            scroller.scrollTo(linkTarget.link, {
              smooth: true,
            });
            setScrollTarget(linkTarget.link);
            setDrawerOpen(false);
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
  }, [] as JSX.Element[]);

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
