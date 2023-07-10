export default function About() {
  return (
    <>
      <div
        className="flex flex-col items-center justify-center pt-10 my-0 mx-auto"
        id="about"
      >
        <div className="flex items-center font-bold text-3xl">About Me</div>
        <div className="w-10/12 md:w-8/12 lg:w-5/12 mt-8 text-lg">
          Hi! I&apos;m Gram and I build things, from web apps to full stack to
          IoT. I graduated from{" "}
          <a
            href="https://www.cmu.edu/"
            target="_blank"
            rel="noreferrer"
            className="hoverLink text-highlight no-underline"
          >
            Carnegie Mellon University
          </a>{" "}
          with a major in Electrical and Computer Engineering and a minor in
          Computer Science. I&apos;m a big fan of technology and how it
          revolutionizes the way we tackle everything from payments to
          education, consistently pushing the boundaries of what we think is
          possible.
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
