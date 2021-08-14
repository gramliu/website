import React, { useState } from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { Activity } from "./Activity"
import { activities } from "../../config"
import { TabList } from "./TabList"
import anime from "animejs"

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
    gridTemplateColumns: "1fr 4fr",
    columnGap: "1rem",
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
          <TabList
            activities={activities}
            setActivity={setActivity}
          />
          <Activity activity={activity} />
        </div>
      </div>
    </>
  )
}

export default Activities
