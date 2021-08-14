import React, { useEffect, useState } from "react"
import { Button, makeStyles, useTheme } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  tabList: {
    display: "flex",
    flexDirection: "column",
    width: "40%",
  },
  tabButton: {
    padding: "1rem",
    background: "none",
    color: theme.palette.textColor,
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.highlight,
    },
    borderLeft: `solid 2px ${theme.palette.backgroundLighter}`,
    transition: "background 0.25s, color 0.25s",
  },
  selectedTab: {
    color: theme.palette.highlight,
    backgroundColor: theme.palette.backgroundLight,
  },
}))

const TabButton = ({ title, focusTab, setFocusTab, idx }) => {
  const theme = useTheme()
  const classes = useStyles(theme)
  const focus = focusTab === idx
  return (
    <div
      class={`${classes.tabButton} ${focus ? classes.selectedTab : null}`}
      tabIndex={idx}
      onClick={(e) => {
        e.preventDefault()
        e.target.focus()
        setFocusTab(idx)
      }}
    >
      {title}
    </div>
  )
}

export const TabList = ({ activities }) => {
  const theme = useTheme()
  const classes = useStyles(theme)
  const [focusTab, setFocusTab] = useState(0)
  const tabButtons = activities.map(({ title }, idx) => {
    return (
      <TabButton
        title={title}
        focusTab={focusTab}
        setFocusTab={setFocusTab}
        idx={idx}
      />
    )
  })

  useEffect(() => {
    if (focusTab >= tabButtons.length) {
      setFocusTab(tabButtons.length - 1)
    } else if (focusTab < 0) {
      setFocusTab(0)
    }
  }, [focusTab])

  return <div className={classes.tabList}>{tabButtons}</div>
}
