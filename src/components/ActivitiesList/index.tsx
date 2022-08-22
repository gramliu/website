import { useState } from "react";
import activities from "../../config/activities";
import ActivityEntry from "../ActivityEntry";
import TabList from "../TabList";
import styles from "./index.module.scss";

export default function ActivitiesList() {
  const [activity, setActivity] = useState(activities[0]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>What I&apos;ve Done</div>
      <div className={styles.content}>
        <TabList activities={activities} setActivity={setActivity} />
        <ActivityEntry {...activity} />
      </div>
    </div>
  );
}
