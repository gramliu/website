import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { Activity } from "./Activity"
import { activities } from "../../config"
import { TabList } from "./TabList"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: theme.palette.textColor,
    paddingBottom: "20rem",
    fontFamily: "'Argentum Sans', sans-serif",
    marginLeft: "20%",
  },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
    display: "flex",
  },
  content: {
    marginTop: "2rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    rowGap: "5rem",
  },
}))

const Activities = () => {
  const theme = useTheme()
  const classes = useStyles(theme)
  return (
    <>
      <div className={classes.container} id="activities">
        <div className={classes.header}>What I've Done</div>
        <div className={classes.content}>
          <TabList activities={activities} />
        </div>
      </div>
    </>
  )
}

export default Activities
