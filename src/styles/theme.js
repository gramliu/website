import { createTheme } from "@material-ui/core"

export const theme = createTheme({
  palette: {
    background: "#263238",
    textColor: "#e7ecef",
    textAlt: "#f05d5e",
    highlight: "#73ee87",
    highlightDarker: "#5bbc6b",
    backgroundLight: "#314149",
    backgroundLighter: "#526e7c"
  },
  hoverLink: {
    display: "inline",
    position: "relative",
    overflow: "hidden",

    "&:after": {
      content: "''",
      position: "absolute",
      zIndex: -1,
      right: 0,
      width: 0,
      bottom: "-2px",
      background: "#5bbc6b",
      height: "1px",
      transitionProperty: "width",
      transitionDuration: "0.3s",
      transitionTimingFunction: "ease-out",
    },
    "&:is(:hover,:focus,:active):after": {
      left: 0,
      right: "auto",
      width: "100%",
    },
  },
})
