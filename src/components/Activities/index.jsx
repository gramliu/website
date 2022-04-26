import React, { useState } from "react"
import { activities } from "../../config"
import { Activity } from "./Activity"
import { TabList } from "./TabList"
import * as styles from "./Activities.module.scss"

const Activities = () => {
  const [activity, setActivity] = useState(activities[0])

  return (
    <>
      <div className={styles.container} id="activities">
        <div className={styles.header}>What I've Done</div>
        <div className={styles.content}>
          <TabList activities={activities} setActivity={setActivity} />
          <Activity activity={activity} />
        </div>
      </div>
    </>
  )
}

export default Activities
