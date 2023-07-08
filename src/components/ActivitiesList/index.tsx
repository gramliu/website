import { useState } from "react";
import activities from "../../config/activities";
import ActivityEntry from "../ActivityEntry";
import TabList from "../TabList";

export default function ActivitiesList() {
  const [activity, setActivity] = useState(activities[0]);

  return (
    <div className="flex flex-col justify-center pt-80 w-10/12 md:w-6/12 mx-auto mb-20 md:mb-80">
      <div className="text-4xl font-bold mx-auto">What I&apos;ve Done</div>
      <div className="mt-8 gap-4 pl-0 md:pl-[10%] flex flex-col md:flex-row">
        <TabList activities={activities} setActivity={setActivity} />
        <ActivityEntry {...activity} />
      </div>
    </div>
  );
}
