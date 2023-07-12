import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Activity } from "../config/activities";

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
      className={clsx(
        "p-4 bg-none text-text-primary hover:text-text-highlight cursor-pointer transition-all",
        "border-l-0 border-b-2 border-b-background-light",
        "sm:border-b-0 sm:border-l-2 sm:border-l-background-light",
        focus
          ? clsx(
              "text-text-highlight bg-bgcolor-light transition-all",
              "border-l-0 border-b-2 border-b-text-highlight",
              "sm:border-b-0 sm:border-l-2 sm:border-l-text-highlight"
            )
          : null
      )}
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

  return (
    <div className="flex sm:flex-col w-12/12 sm:w-4/12 md:w-6/12 overflow-x-scroll sm:overflow-x-auto relative text-lg">
      {tabButtons}
    </div>
  );
}
