import anime from "animejs"
import React, { useState, useEffect, useCallback } from "react"
import styled from "styled-components"
import { LogoIcon } from "src/icons/logo"
import * as styles from "./index.module.scss"

const FadingDiv = styled.div`
  opacity: ${(props) => (props.isMounted ? 1 : 0)};
`

const Loader = ({ finishLoading }) => {
  const [isMounted, setIsMounted] = useState(false)
  const loaderClass = `.${styles.loaderContainer}`
  console.log(isMounted, loaderClass)

  const animate = () => {
    const loader = anime.timeline({
      complete: () => finishLoading()
    })
    loader
      .add({
        targets: `${loaderClass} .logo-G`,
        delay: 300,
        duration: 1500,
        easing: "easeInOutQuart",
        strokeDashoffset: [anime.setDashoffset, 0]
      })
      .add({
        targets: `${loaderClass} .logo-circle`,
        duration: 700,
        easing: "easeInOutQuart",
        opacity: 1
      })
      .add({
        targets: loaderClass,
        delay: 500,
        duration: 300,
        easing: "easeInOutQuart",
        opacity: 0,
        scale: 0.1
      })
      .add({
        targets: loaderClass,
        duration: 200,
        easing: "easeInOutQuart",
        opacity: 0,
        zIndex: -1
      })
  }

  const animateCallback = useCallback(animate, [finishLoading, loaderClass])

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10)
    animateCallback()
    return () => clearTimeout(timeout)
  }, [animateCallback])

  return (
    <>
      <div className={styles.loaderContainer}>
        <FadingDiv className={styles.logoWrapper} isMounted={isMounted}>
          <LogoIcon />
        </FadingDiv>
      </div>
    </>
  )
}

export default Loader
