import { makeStyles, useTheme } from "@material-ui/core"
import React from "react"
import { GithubIcon } from "../../icons/github"
import { RedirectIcon } from "../../icons/redirect"
import { YouTubeIcon } from "../../icons/youtube"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "grid",
    "&:nth-child(even)": {
      gridTemplateColumns: "3fr 4fr",
      textAlign: "start",
    },
    "&:nth-child(odd)": {
      gridTemplateColumns: "4fr 3fr",
      textAlign: "end",
    },
    color: theme.palette.textColor,
    width: "60%",
    marginTop: "2rem",
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
    maxWidth: "100%",
    maxHeight: "30rem",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
    imageRendering: "crisp-edges",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    "&:nth-child(even)": {
      marginLeft: "1rem",
      alignItems: "flex-end",
    },
    "&:nth-child(odd)": {
      marginRight: "1rem",
      alignItems: "flex-start",
    },
  },
  title: {
    fontSize: "2rem",
  },
  subtitle: {
    marginTop: "0.5rem",
    fontSize: "1.3rem",
    color: theme.palette.textFaded,
  },
  description: {
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
    justifyContent: "space-between",
  },
  tag: {
    color: theme.palette.highlight,
    fontWeight: "bold",
    paddingLeft: "1rem",
    paddingRight: "1rem",
  },
  links: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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

export const HighlightedProject = ({ project, flip }) => {
  const theme = useTheme()
  const classes = useStyles(theme)

  const {
    title,
    subtitle,
    description,
    date,
    tags,
    github,
    link,
    video,
    image,
  } = project

  const imageContainer = (
    <div className={classes.imageContainer}>
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
      >
        <GithubIcon />
      </a>
    )
  }
  if (link) {
    links.push(
      <a href={link} target="_blank" rel="noreferrer" className={classes.link}>
        <RedirectIcon />
      </a>
    )
  }
  if (video) {
    links.push(
      <a href={video} target="_blank" rel="noreferrer" className={classes.link}>
        <YouTubeIcon />
      </a>
    )
  }
  const contentContainer = (
    <div className={classes.content}>
      <div className={classes.title}>{title}</div>
      <div className={classes.subtitle}>{subtitle}</div>
      <div className={classes.description}>{description}</div>
      <div className={classes.tags}>
        {tags.map((tag) => (
          <div className={classes.tag}>{tag}</div>
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
  if (flip) {
    content = (
      <>
        {contentContainer}
        {imageContainer}
      </>
    )
  }

  return <div className={classes.container}>{content}</div>
}
