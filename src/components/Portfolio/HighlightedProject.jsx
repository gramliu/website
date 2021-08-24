import { makeStyles, useTheme } from "@material-ui/core"
import React from "react"
import { GithubIcon } from "../../icons/github"
import { RedirectIcon } from "../../icons/redirect"
import { YouTubeIcon } from "../../icons/youtube"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "grid",
    gridAutoFlow: "dense",
    color: theme.palette.textColor,
    width: "60%",
    marginTop: "2rem",
    [theme.breakpoints.up("md")]: {
      "&:nth-child(odd)": {
        gridTemplateColumns: "4fr 3fr",
        textAlign: "end",
        "& .project-image": {
          gridColumn: "1 / 1",
        },
        "& .project-content": {
          gridColumn: "2 / 2",
          marginLeft: "1rem",
          alignItems: "flex-end",
        },
      },
      "&:nth-child(even)": {
        gridTemplateColumns: "3fr 4fr",
        textAlign: "start",
        "& .project-image": {
          gridColumn: "2 / 2",
        },
        "& .project-content": {
          gridColumn: "1 / 1",
          marginRight: "1rem",
          alignItems: "flex-start",
        },
      },
    },
    [theme.breakpoints.down("md")]: {
      width: "80%",
      "&:nth-child(odd),&:nth-child(even)": {
        gridTemplateColumns: "1fr",
        gridTemplateRows: "4fr 3fr",
        textAlign: "start",
        "& .project-image": {
          gridRow: "1 / 1",
          gridColumn: "1 / 1",
        },
        "& .project-content": {
          gridRow: "2 / 2",
          gridColumn: "1 / 1",
          marginLeft: "0",
          marginRight: "0",
        },
      },
    },
    [theme.breakpoints.down("xs")]: {
      width: "80%",
      "&:nth-child(odd),&:nth-child(even)": {
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
        textAlign: "start",
        justifyItems: "center",
        "& .project-image": {
          display: "none",
        },
        "& .project-content": {
          gridRow: "1 / 1",
          gridColumn: "1 / 1",
          marginLeft: "0",
          marginRight: "0",
        },
      },
    },
  },
  imageContainer: {
    "&:nth-child(even)": {
      textAlign: "end",
    },
    "&:nth-child(odd)": {
      textAlign: "start",
    },
  },
  image: {
    width: "100%",
    height: "auto",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      textAlign: "center",
    },
    [theme.breakpoints.down("xs")]: {
      width: "90%",
    },
  },
  title: {
    fontSize: "2rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.7rem",
    },
  },
  subtitle: {
    marginTop: "0.5rem",
    fontSize: "1.3rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1rem",
    },
    color: theme.palette.textFaded,
  },
  description: {
    [theme.breakpoints.down("md")]: {
      textAlign: "start",
    },
    marginTop: "1rem",
    padding: "1rem",
    fontSize: "1rem",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
    backgroundColor: theme.palette.backgroundLight,
    "& a": {
      margin: "0 0.3rem 0 0.3rem",
      textDecoration: "none",
      color: theme.palette.highlight,
      ...theme.hoverLink,
    },
  },
  tags: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    gap: "0.8rem",
  },
  tag: {
    color: theme.palette.highlight,
    fontWeight: "bold",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.8rem",
    },
  },
  links: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: "1rem",
  },
  link: {
    margin: "1rem",
    "& svg": {
      fill: theme.palette.textColor,
      height: "2rem",
      width: "auto",
      transition: "fill 0.25s",
    },
    "& svg:hover": {
      fill: theme.palette.highlight,
    },
  },
}))

export const HighlightedProject = ({ project }) => {
  const theme = useTheme()
  const classes = useStyles(theme)

  const { title, subtitle, description, tags, github, link, video, image } =
    project

  const imageContainer = (
    <div className={`${classes.imageContainer} project-image`}>
      <img src={image} alt={title} className={classes.image} />
    </div>
  )
  const links = []
  if (github) {
    links.push(
      <a
        href={github}
        target="_blank"
        rel="noreferrer"
        className={classes.link}
        key="github"
      >
        <GithubIcon />
      </a>
    )
  }
  if (link) {
    links.push(
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={classes.link}
        key="link"
      >
        <RedirectIcon />
      </a>
    )
  }
  if (video) {
    links.push(
      <a
        href={video}
        target="_blank"
        rel="noreferrer"
        className={classes.link}
        key="youtube"
      >
        <YouTubeIcon />
      </a>
    )
  }
  const contentContainer = (
    <div className={`${classes.content} project-content`}>
      <div className={classes.title}>{title}</div>
      <div className={classes.subtitle}>{subtitle}</div>
      <div className={classes.description}>{description}</div>
      <div className={classes.tags}>
        {tags.map((tag, index) => (
          <div className={classes.tag} key={index}>
            {tag}
          </div>
        ))}
      </div>
      <div className={classes.links}>{links}</div>
    </div>
  )

  let content = (
    <>
      {imageContainer}
      {contentContainer}
    </>
  )

  return <div className={classes.container}>{content}</div>
}
