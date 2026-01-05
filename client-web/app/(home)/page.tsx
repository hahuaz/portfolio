export const metadata = {
  title: "Hasan Biyik - Portfolio",
  description:
    "Explore my work in software development, web technologies, and programming languages.",
};

import { getAllPostMetadata } from "@/lib/post";
import BlogPosts from "./BlogPosts";
import FeaturedVideo from "./FeaturedVideo";

const HomePage = () => {
  const allPostMetadata = getAllPostMetadata();

  return (
    <>
      <div className="mx-auto mt-5 max-w-screen-xl  px-2 xl:px-0">
        <section className="mb-36 mt-12 md:mx-auto md:max-w-2xl xl:mx-0 xl:max-w-3xl">
          <h2 className="gradient-underline mb-4  inline-block text-4xl font-semibold text-slate-300">
            Blog Posts
          </h2>
          <BlogPosts allPostMetadata={allPostMetadata} />
        </section>
        <section className="mb-24 max-w-3xl">
          <h2 className="gradient-underline mb-4  inline-block text-4xl font-semibold text-slate-300">
            Featured Video
          </h2>
          <FeaturedVideo />
        </section>
      </div>
    </>
  );
};

export default HomePage;
