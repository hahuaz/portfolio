import Image from "next/image";
import Link from "next/link";

export function Navlinks() {
  return (
    <ul className="flex items-center justify-center gap-1 text-sm md:gap-3 xl:justify-start">
      <div className="flex gap-1 md:gap-2">
        <a href="https://github.com/hahuaz" target="_blank" rel="noreferrer">
          <Image
            src="/icons/github.svg"
            alt="Github Logo"
            className=" dark:invert"
            width={30}
            height={30}
            priority
          />
        </a>

        <a
          href="https://www.linkedin.com/in/hahuaz/"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/icons/linkedin.svg"
            alt="Linkedin Logo"
            className="dark:invert   "
            width={30}
            height={30}
            priority
          />
        </a>
        <a
          href="https://www.youtube.com/channel/UCHA7z49F-miB0lWtVBxLy8g"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/icons/icons8-youtube.svg"
            alt="Youtube Logo"
            className="dark:invert "
            width={30}
            height={30}
            priority
          />
        </a>
      </div>

      <span>-</span>
      <a
        href="/hasan-biyik.pdf"
        target="_blank"
        rel="noreferrer"
        className="font-semibold   "
      >
        Resume
      </a>
      <span className=" text-xl">|</span>
      <span>work.hahuaz@gmail.com</span>
    </ul>
  );
}

export default function Navbar() {
  return (
    <nav>
      <div className="navbar relative pb-12 text-github-white-link lg:pb-24">
        <div className="mx-auto max-w-screen-xl px-3 py-6">
          <div className="flex flex-col items-center gap-6 xl:items-start">
            <div className=" flex max-w-sm items-center gap-2 lg:max-w-none lg:gap-6">
              <Link href="/">
                <div className="gradient-animation relative flex h-28 w-28 overflow-hidden rounded-full p-1 lg:h-48 lg:w-48 ">
                  <img
                    src="/avatar-focused.jpg"
                    alt="hasan biyik avatar"
                    className="rounded-full "
                  />
                </div>
              </Link>
              <div>
                <p className=" font-semibold lg:text-2xl">
                  Hey there, I&apos;m Hasan Biyik.
                </p>
                <p className=" text-sm font-normal text-gray-400 lg:text-base ">
                  Highly career-focused and committed to achieving success in my
                  field.
                </p>
                <p>
                  <span className="text-gray-400 ">$</span>{" "}
                  <span className="cursor-animation"></span>
                </p>
              </div>
            </div>
            <div>
              <Navlinks />
            </div>
          </div>

          <div>
            <svg
              style={{
                filter: "drop-shadow(0 0 20px #3be8b0)",
              }}
              className="waves absolute bottom-0 left-0 block overflow-hidden"
              viewBox="0 0 1440 80"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,40L21.8,32C43.6,24,87,8,131,16C174.5,24,218,56,262,56C305.5,56,349,24,393,24C436.4,24,480,56,524,56C567.3,56,611,24,655,24C698.2,24,742,56,785,64C829.1,72,873,56,916,56C960,56,1004,72,1047,56C1090.9,40,1135,0,1178,0C1221.8,0,1265,40,1309,56C1352.7,72,1390,72,1450,64"
                strokeDasharray="1650"
                strokeDashoffset="1650"
                fill="none"
                strokeWidth="2px"
                stroke="#3be8b0"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="1650"
                  to="0"
                  dur="1.8s"
                  fill="freeze"
                  keySplines=".42,0,.58,1"
                  calcMode="spline"
                  keyTimes="0; 1"
                ></animate>
              </path>
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}
