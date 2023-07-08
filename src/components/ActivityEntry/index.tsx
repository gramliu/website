import { Activity } from "../../config/activities";
import LinkIcon from "../../icons/link";

export default function ActivityEntry({
  altTitle,
  title,
  url,
  role,
  roleAlt,
  dates,
  description,
}: Activity) {
  return (
    <div className="flex flex-col w-full">
      <div className="text-2xl">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={
              "text-2xl no-underline flex items-center text-text-primary hover:translate-y-[-3px] transition-all"
            }
          >
            {altTitle || title}
            <LinkIcon className="text-text-primary fill-text-primary h-4 ml-1 opacity-80" />
          </a>
        ) : (
          <div className="text-2xl">{altTitle || title}</div>
        )}
      </div>
      <div className="mt-2 uppercase text-text-highlight text-base font-bold">
        {role}
      </div>
      {roleAlt == null ? null : (
        <div className="mt-1 uppercase text-text-highlight text-sm font-bold opacity-80">
          {roleAlt}
        </div>
      )}

      <div className="text-sm mt-2 opacity-80">{dates}</div>
      <div className="mt-2">
        <ul>
          {description.map((item, index) => (
            <li
              key={index}
              className="mb-4 w-10/12 lg:w-full ml-8 lg:ml-12 list-disc"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
