import { Element } from "react-scroll";
import Bio from "./bio.mdx";
import TapToPayAnimation from "./taptopay";

export default function About() {
  return (
    <>
      <div className="grid grid-cols-[1fr,3fr] pt-10 my-0 mx-auto" id="about">
        <TapToPayAnimation />
        <div className="flex flex-col items-center justify-center">
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
