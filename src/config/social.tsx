import { ReactElement } from "react";
import GitHubIcon from "../icons/github";
import LinkedInIcon from "../icons/linkedin";
import MailIcon from "../icons/mail";

export interface Social {
  name: string;
  image: ReactElement;
  url: string;
}

const social: Social[] = [
  {
    name: "github",
    image: <GitHubIcon />,
    url: "https://github.com/gramliu",
  },
  {
    name: "linkedin",
    image: <LinkedInIcon />,
    url: "https://www.linkedin.com/in/gramliu/",
  },
  {
    name: "mail",
    image: <MailIcon />,
    url: "mailto:gram@gramliu.com",
  },
];

export default social;
