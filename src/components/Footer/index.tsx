import { Typography } from "@material-ui/core"
import React from "react"
import * as styles from "./index.module.scss"

const Footer = () => {
  return (
    <>
      <div className={styles.container} id="footer">
        <Typography variant="caption" className={styles.footerText}>&copy; Gram Liu 2022</Typography>
      </div>
    </>
  )
}

export default Footer
