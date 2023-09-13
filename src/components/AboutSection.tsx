export default function About() {
  return (
    <>
      <div
        className="flex flex-col items-center justify-center pt-10 my-0 mx-auto"
        id="about"
      >
        <div className="flex items-center font-bold text-3xl">About Me</div>
        <div className="w-10/12 md:w-8/12 lg:w-5/12 mt-8 text-lg">
          Hi! I&apos;m Gram and I love building things, from web to mobile to
          IoT. I grew up in Cebu, Philippines where I attended the{" "}
          <a
            href="https://en.wikipedia.org/wiki/Philippine_Science_High_School_System"
            target="_blank"
            rel="noreferrer"
            className="hoverLink text-highlight no-underline"
          >
            Philippine Science High School
          </a>
          . I recently graduated from{" "}
          <a
            href="https://www.cmu.edu/"
            target="_blank"
            rel="noreferrer"
            className="hoverLink text-highlight no-underline"
          >
            Carnegie Mellon University
          </a>{" "}
          with a major in Electrical and Computer Engineering and a minor in
          Computer Science. Currently, I&apos;m at Stripe in San Francisco 🌉
          building{" "}
          <a
            href="https://stripe.com/terminal/tap-to-pay"
            target="_blank"
            rel="noreferrer"
            className="hoverLink text-highlight no-underline"
          >
            Tap to Pay
          </a>
          .
          <br />
          <br />
          I&apos;m a big fan of technology and how it revolutionizes the way we
          tackle everything from payments to education, consistently pushing the
          boundaries of what we think is possible.
          <br />
          <br />
          Outside of tech, I also love to cook! I try to do the food justice by
          honing the art of food photography over on{" "}
          <a
            href="https://www.instagram.com/gram_cooks/"
            target="_blank"
            rel="noreferrer"
            className="hoverLink text-highlight"
          >
            Instagram.
          </a>
        </div>
      </div>
    </>
  );
}
