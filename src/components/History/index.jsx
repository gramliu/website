import React from "react"
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
    width: "40%",
    marginTop: "2rem",
    fontSize: "1.1rem",
    lineHeight: "1.5",
    "& a": {
      margin: "0 0.3rem 0 0.3rem",
      textDecoration: "none",
      color: theme.palette.highlight,
      transition: "text-decoration 0.25s"
    }
  },
}))

const History = () => {
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
          pursuing a major in Electrical and Computer Engineering with a minor
          in Computer Science. My programming adventures go back to 2012, when I
          decided that I wanted to make mods for Minecraft and well, there's a
          lot you can learn from modifying a game written in Java.
          <br/>
        </div>
      </div>
    </>
  )
}

export default History
