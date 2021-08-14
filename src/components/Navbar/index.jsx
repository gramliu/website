import { makeStyles, useTheme } from "@material-ui/styles"
import React from "react"
import { LogoIcon } from "../../icons/logo"
import scrollTo from "gatsby-plugin-smoothscroll"

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    width: "100vw",
    display: "flex",
    justifyContent: "space-between",
    zIndex: 100,
    fontFamily: "'Josefin Sans', sans-serif",
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
    marginRight: "2rem",
  },
  logo: {
    "& svg": {
      height: "50px",
    },
    "& svg circle": {
      transition: "fill 0.5s",
    },
    "& svg:hover circle": {
      fill: "#e7ecef20",
    },
  },
}))

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
    label: "Cooking",
    link: "https://instagram.com/gram_eats",
    target: "_blank",
  },
]

const Navbar = () => {
  const theme = useTheme()
  const classes = useStyles(theme)
  return (
    <div className={classes.container}>
      <div className={classes.iconLink}>
        <a href="#" className={classes.navLink}>
          <div className={classes.logo}>
            <LogoIcon />
          </div>
        </a>
      </div>
      <div className={classes.navLinkContainer}>
        {links.map((link, idx) => {
          if (link.target) {
            return (
              <a
                href={link.link}
                className={classes.navLink}
                target={link.target}
                key={idx}
              >
                {link.label}
              </a>
            )
          } else {
            return (
              <div
                className={classes.navLink}
                onClick={() => scrollTo(link.link)}
                key={idx}
              >
                {link.label}
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

export default Navbar
