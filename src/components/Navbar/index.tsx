import { useEffect, useState } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import LogoIcon from "../../icons/logo";
import SandwichIcon from "../../icons/sandwich";
import styles from "./index.module.scss";
import { scroller } from "react-scroll";
import clsx from "clsx";

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
  {
    label: "Cooking",
    link: "https://instagram.com/gram_eats",
    target: "_blank",
  },
];

export default function Navbar() {
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
          className={styles.navLink}
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
          className={styles.navLink}
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

  return (
    <div className={styles.container} id="navbar">
      <div>
        <a href="#home" className={styles.navLink}>
          <div className={styles.logo}>
            <LogoIcon />
          </div>
        </a>
      </div>
      <div className={styles.navLinkContainer}>
        {drawerOpen ? null : (
          <div
            className={clsx(styles.sandwich, "sandwich")}
            key="sandwich"
            onClick={() => {
              setDrawerOpen(true);
            }}
          >
            <SandwichIcon />
          </div>
        )}
        {navLinks}
        <Drawer
          direction="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <div className={styles.drawerLinks}>{navLinks}</div>
        </Drawer>
      </div>
    </div>
  );
}
