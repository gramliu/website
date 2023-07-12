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

const links = [
  {
    label: "About",
    link: "about",
  },
  {
    label: "Portfolio",
    link: "portfolio",
  },
  {
    label: "Resume",
    link: "Gram_Liu_Resume.pdf",
    target: "_blank",
  },
];

const divider = <span className="text-divider text-2xl">|</span>;

export default function NavPill() {
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
    if (linkTarget.target) {
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
          delay: 0.7,
        }}
      >
        <div className="flex justify-center border rounded-[30rem] border-gray-500 bg-bgcolor-primary p-3 md:p-4">
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <a
              href="#home"
              className="no-underline font-semibold transition-all cursor-pointer hover:text-text-highlight"
            >
              <LogoIcon className="h-8 w-auto" />
            </a>
            {divider}
            {navLinksDivided}
            {divider}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-text-primary font-sans font-semibold text-base hover:bg-none focus:bg-none">
                    Other
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid grid-cols-1 gap-3 p-6 w-48 bg-bgcolor-primary text-text-primary drop-shadow">
                      <li>
                        <NavigationMenuLink
                          href="https://instagram.com/gram_cooks"
                          target="_blank"
                          className="hover:text-text-highlight font-semibold"
                        >
                          Cooking
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          href="/bookshelf"
                          className="hover:text-text-highlight font-semibold"
                        >
                          Bookshelf
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
