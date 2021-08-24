import { makeStyles, useTheme } from "@material-ui/core"
import React, { useState } from "react"
import { activities } from "../../config"
import { Activity } from "./Activity"
import { TabList } from "./TabList"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: theme.palette.textColor,
    paddingBottom: "20rem",
    marginLeft: "30%",
    [theme.breakpoints.down("md")]: {
      width: "90%",
      margin: "0 auto",
    },
  },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
    display: "flex",
  },
  content: {
    marginTop: "2rem",
    display: "flex",
    gap: "1rem",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
}))

const Activities = () => {
  const theme = useTheme()
  const classes = useStyles(theme)
  const [activity, setActivity] = useState(activities[0])

  return (
    <>
      <div className={classes.container} id="activities">
        <div className={classes.header}>What I've Done</div>
        <div className={classes.content}>
          <TabList activities={activities} setActivity={setActivity} />
          <Activity activity={activity} />
        </div>
      </div>
    </>
  )
}

export default Activities
