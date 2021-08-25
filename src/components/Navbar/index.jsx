import { makeStyles, useTheme } from "@material-ui/core/styles"
import React, { useState, useEffect } from "react"
import { LogoIcon } from "../../icons/logo"
import scrollTo from "gatsby-plugin-smoothscroll"
import { SandwichIcon } from "../../icons/sandwich"
import { Drawer } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  container: {
    position: "fixed",
    width: "100vw",
    display: "flex",
    justifyContent: "space-between",
    zIndex: 10,
    fontFamily: "'Josefin Sans', sans-serif",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
  },
  logo: {
    marginLeft: "1rem",
    [theme.breakpoints.up("lg")]: {
      marginLeft: "3rem",
    },
    "& svg": {
      height: "50px",
      width: "auto",
    },
    "& svg circle": {
      transition: "fill 0.5s",
    },
    "& svg:hover circle": {
      fill: "#e7ecef20",
    },
  },
  navLink: {
    color: theme.palette.textColor,
    textDecoration: "none",
    fontSize: "1.2em",
    fontWeight: "600",
    paddingLeft: "1em",
    paddingRight: "1em",
    transition: "background-color 0.5s",
    "&:hover": {
      color: theme.palette.highlight,
    },
    cursor: "pointer",
  },
  navLinkContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: "2rem",
    [theme.breakpoints.down("md")]: {
      "& :is(a,div):not(.sandwich)": {
        display: "none",
      },
      "& .sandwich": {
        display: "block",
      },
    },
  },
  drawer: {
    background: theme.palette.background,
  },
  drawerLinks: {
    paddingTop: "3rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sandwich: {
    fill: theme.palette.highlight,
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
    zIndex: 20,
    "& svg": {
      height: "2em",
      width: "2em",
    },
  },
}))

const links = [
  {
    label: "About",
    link: "#about",
  },
  {
    label: "Portfolio",
    link: "#portfolio",
  },
  {
    label: "Cooking",
    link: "https://instagram.com/gram_eats",
    target: "_blank",
  },
]

const Navbar = () => {
  const theme = useTheme()
  const classes = useStyles(theme)

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
          className={classes.navLink}
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
          className={classes.navLink}
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
    <div className={classes.container} id="navbar">
      <div className={classes.iconLink}>
        <a href="#home" className={classes.navLink}>
          <div className={classes.logo}>
            <LogoIcon />
          </div>
        </a>
      </div>
      <div className={classes.navLinkContainer}>
        {drawerOpen ? null : (
          <div
            className={`${classes.sandwich} sandwich`}
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
            paper: classes.drawer,
          }}
        >
          <div className={classes.drawerLinks}>{navLinks}</div>
        </Drawer>
      </div>
    </div>
  )
}

export default Navbar
