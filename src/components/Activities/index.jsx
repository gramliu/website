import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { Activity } from "./Activity"
import { activities } from "../../config"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: theme.palette.textColor,
    paddingBottom: "20rem",
    fontFamily: "'Argentum Sans', sans-serif",
    marginLeft: "10%",
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
        <div className={classes.header}>What I'm Doing Now</div>
        <div className={classes.content}>
          {activities.map((activity) => {
            const { title, url, role, description } = activity
            return (
              <Activity
                title={title}
                url={url}
                role={role}
                description={description}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Activities
