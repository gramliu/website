import React, { useEffect, useRef } from "react"
import { makeStyles, useTheme } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.textColor,
    paddingBottom: "20rem",
    margin: "0 auto",
    fontFamily: "'Argentum Sans', sans-serif",
  },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
  },
  content: {
    width: "30%",
    [theme.breakpoints.between("md", "lg")]: {
      width: "70%",
    },
    [theme.breakpoints.between("sm", "md")]: {
      width: "80%",
    },
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
    marginTop: "2rem",
    fontSize: "1.1rem",
    lineHeight: "1.5",
    "& a": {
      margin: "0 0.3rem 0 0.3rem",
      textDecoration: "none",
      color: theme.palette.highlight,
      ...theme.hoverLink,
    },
  },
}))

const About = () => {
  const theme = useTheme()
  const classes = useStyles(theme)

  return (
    <>
      <div className={classes.container} id="about">
        <div className={classes.header}>About Me</div>
        <div className={classes.content}>
          Hi! I'm Gram and I build things, from web apps to full stack to IoT.
          I'm a rising junior at
          <a href="https://www.cmu.edu/" target="_blank" className="hoverLink">
            Carnegie Mellon University
          </a>
          pursuing a major in Electrical and Computer Engineering. I am a big
          fan of technology and how it changes the way we think and address
          problems from education to health care, consistently pushing
          the boundaries of what we think is possible.
          <br />
          <br />
          Outside of tech, I also really enjoy cooking! I try to do the food
          justice by honing the art of food photography over on
          <a
            href="https://www.instagram.com/gram_eats/"
            target="_blank"
            className="hoverLink"
          >
            Instagram.
          </a>
        </div>
      </div>
    </>
  )
}

export default About
