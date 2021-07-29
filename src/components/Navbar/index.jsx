import { makeStyles, useTheme } from "@material-ui/styles"
import React from "react"
import { LogoIcon } from "../../icons/logo"

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    width: "100vw",
    top: "1em",
    display: "flex",
    justifyContent: "space-between",
  },
  navLink: {
    color: theme.palette.textColor,
    textDecoration: "none",
    fontSize: "1.2em",
    paddingLeft: "1em",
    paddingRight: "1em",
    transition: "background-color 0.5s",
    "&:hover": {
      color: theme.palette.highlight,
    },
  },
  navLinkContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
    label: "❓ About",
    link: "#about",
  },
  {
    label: "🧾 Portfolio",
    link: "#portfolio",
  },
  {
    label: "🍳 Cooking",
    link: "https://instagram.com/gram_eats",
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
        {links.map((link) => {
          return (
            <a href={link.link} className={classes.navLink}>
              {link.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default Navbar
