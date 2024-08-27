import { Element } from "react-scroll";
import Bio from "./bio.mdx";
import TapToPayAnimation from "./taptopay";

export default function About() {
  return (
    <>
      <div
        className="flex flex-col pt-10 my-0 mx-auto md:grid md:grid-cols-[1fr,3fr]"
        id="about"
      >
        <div className="flex flex-col items-center justify-center order-2 md:order-1 md:ml-20">
          <a
            href="https://stripe.com/terminal/tap-to-pay"
            target="_blank"
            rel="noreferrer"
            className="mt-20 md:mt-0"
          >
            <TapToPayAnimation />
          </a>
        </div>
        <div className="flex flex-col items-center justify-center order-1 md:order-2">
          <Element name="about" />
          <div className="flex items-center font-bold text-3xl">About Me</div>
          <div className="w-10/12 md:w-8/12 mt-8 text-lg text-left">
            <Bio />
          </div>
        </div>
      </div>
    </>
  );
}
