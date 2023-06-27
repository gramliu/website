import { useEffect, useState } from "react";
import "react-modern-drawer/dist/index.css";
import { scroller } from "react-scroll";
import LogoIcon from "../../icons/logo";
import styles from "./index.module.scss";

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
    link: "https://instagram.com/gram_cooks",
    target: "_blank",
  },
];

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
      <div className={styles.pill}>
        <div className={styles.navLinks}>
          <a href="#home" className={styles.navLink}>
            <div className={styles.logo}>
              <LogoIcon />
            </div>
          </a>
          {navLinks}
        </div>
      </div>
    </div>
  );
}
