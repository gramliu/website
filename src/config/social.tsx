import { ReactElement } from "react";
import GitHubIcon from "../icons/github";
import LinkedInIcon from "../icons/linkedin";
import MailIcon from "../icons/mail";

export interface Social {
  name: string;
  image: ReactElement;
  url: string;
}

const socialIconClass = "w-6 h-6 md:w-10 md:h-10 fill-text-primary";

const social: Social[] = [
  {
    name: "github",
    image: <GitHubIcon className={socialIconClass} />,
    url: "https://github.com/gramliu",
  },
  {
    name: "linkedin",
    image: <LinkedInIcon className={socialIconClass} />,
    url: "https://www.linkedin.com/in/gramliu/",
  },
  {
    name: "mail",
    image: <MailIcon className={socialIconClass} />,
    url: "mailto:gram@gramliu.com",
  },
];

export default social;
