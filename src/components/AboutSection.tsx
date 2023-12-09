import { Element } from "react-scroll";
import Bio from "./bio.mdx";

export default function About() {
  return (
    <>
      <div
        className="flex flex-col items-center justify-center pt-10 my-0 mx-auto"
        id="about"
      >
        <Element name="about" />
        <div className="flex items-center font-bold text-3xl">About Me</div>
        <div className="w-10/12 md:w-8/12 lg:w-5/12 mt-8 text-lg text-left">
          <Bio />
        </div>
      </div>
    </>
  );
}
