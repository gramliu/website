import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Activity } from "../../config/activities";
import styles from "./index.module.scss";

interface TabButtonProps {
  title: string;
  focusTab: number;
  setFocusTab: Dispatch<SetStateAction<number>>;
  idx: number;
}

function TabButton({ title, focusTab, setFocusTab, idx }: TabButtonProps) {
  const focus = focusTab === idx;
  return (
    <div
      className={clsx(styles.tabButton, focus ? styles.selectedTab : null)}
      tabIndex={idx}
      onClick={(e) => {
        e.preventDefault();
        setFocusTab(idx);
      }}
    >
      {title}
    </div>
  );
}

interface TabListProps {
  activities: Activity[];
  setActivity: Dispatch<SetStateAction<Activity>>;
}

export default function TabList({ activities, setActivity }: TabListProps) {
  const [focusTab, setFocusTab] = useState(0);
  const tabButtons = activities.map(({ title }, idx) => {
    return (
      <TabButton
        title={title}
        focusTab={focusTab}
        setFocusTab={setFocusTab}
        idx={idx}
        key={idx}
      />
    );
  });

  useEffect(() => {
    if (focusTab >= tabButtons.length) {
      setFocusTab(tabButtons.length - 1);
    } else if (focusTab < 0) {
      setFocusTab(0);
    }
    setActivity(activities[focusTab]);
  }, [focusTab, activities, setActivity, tabButtons.length]);

  return <div className={styles.tabList}>{tabButtons}</div>;
}
