import React, { useEffect, useState } from "react"
import * as styles from "./index.module.scss"

const TabButton = ({ title, focusTab, setFocusTab, idx }) => {
  const focus = focusTab === idx
  return (
    <div
      className={`${styles.tabButton} ${focus ? styles.selectedTab : null}`}
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

export const TabList = ({ activities, setActivity }) => {
  const [focusTab, setFocusTab] = useState(0)
  const tabButtons = activities.map(({ title }, idx) => {
    return (
      <TabButton
        title={title}
        focusTab={focusTab}
        setFocusTab={setFocusTab}
        idx={idx}
        key={idx}
      />
    )
  })

  useEffect(() => {
    if (focusTab >= tabButtons.length) {
      setFocusTab(tabButtons.length - 1)
    } else if (focusTab < 0) {
      setFocusTab(0)
    }
    setActivity(activities[focusTab])
  }, [focusTab])

  return <div className={styles.tabList}>{tabButtons}</div>
}
