import React from "react";

import { Navlinks } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-github-black py-12 md:py-24">
      <div className=" mx-auto flex max-w-screen-xl flex-wrap items-center justify-around gap-2 border-y border-gray-600 px-[5vw] py-6 xl:px-0">
        <div className=" max-w-lg  text-center font-light  ">
          <p>
            On this portfolio, I document my solutions in software development.
            I hope it becomes a reliable resource for others who may encounter
            similar challenges. Only intend is to contribute to the community.
            If you see any mistakes or have any suggestions, please feel free to
            contact me.
          </p>
          <img
            className="mx-auto max-w-xs"
            src="/images/hasan-biyik-handwriting.png"
            alt="hasan-biyik-handwriting.png"
          />
        </div>
        <Navlinks />
      </div>
    </footer>
  );
}
