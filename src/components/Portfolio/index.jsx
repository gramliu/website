import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { highlighted } from "../../config"
import { HighlightedProject } from "./HighlightedProject"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: theme.palette.textColor,
    paddingBottom: "20rem",
  },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
    display: "flex",
    width: "60%",
  },
  content: {
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
}))

const Portfolio = () => {
  const theme = useTheme()
  const classes = useStyles(theme)
  return (
    <>
      <div className={classes.container} id="portfolio">
        <div className={classes.header}>Things I've Built</div>
        <div className={classes.content}>
          {highlighted.map((project, index) => (
            <HighlightedProject
              project={project}
              flip={index % 2 != 0}
              key={index}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Portfolio
