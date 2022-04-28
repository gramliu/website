import { Drawer } from "@material-ui/core"
import scrollTo from "gatsby-plugin-smoothscroll"
import React, { useEffect, useState } from "react"
import { LogoIcon } from "../../icons/logo"
import { SandwichIcon } from "../../icons/sandwich"
import * as styles from "./index.module.scss"

const links = [
  {
    label: "About",
    link: "#about"
  },
  {
    label: "Portfolio",
    link: "#portfolio"
  },
  {
    label: "Cooking",
    link: "https://instagram.com/gram_eats",
    target: "_blank"
  }
]

const Navbar = () => {
  const [scrollTarget, setScrollTarget] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen && scrollTarget) {
      // Drawer was closed. Go to scroll target
      scrollTo(scrollTarget)
    }
  }, [drawerOpen])

  const navLinks = links.map((link, index) => {
    if (link.target) {
      return (
        <a
          href={link.link}
          className={styles.navLink}
          target={link.target}
          key={index}
          onClick={() => setDrawerOpen(false)}
        >
          {link.label}
        </a>
      )
    } else {
      return (
        <div
          className={styles.navLink}
          onClick={() => {
            scrollTo(link.link)
            setScrollTarget(link.link)
            setDrawerOpen(false)
          }}
          key={index}
        >
          {link.label}
        </div>
      )
    }
  })

  return (
    <div className={styles.container} id="navbar">
      <div className={styles.iconLink}>
        <a href="#home" className={styles.navLink}>
          <div className={styles.logo}>
            <LogoIcon />
          </div>
        </a>
      </div>
      <div className={styles.navLinkContainer}>
        {drawerOpen ? null : (
          <div
            className={`${styles.sandwich} sandwich`}
            key="sandwich"
            onClick={() => {
              setDrawerOpen(true)
            }}
          >
            <SandwichIcon />
          </div>
        )}
        {navLinks}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          classes={{
            paper: styles.drawer
          }}
        >
          <div className={styles.drawerLinks}>{navLinks}</div>
        </Drawer>
      </div>
    </div>
  )
}

export default Navbar
