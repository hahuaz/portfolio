"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { PostMetadata } from "@/lib/post";

export default function BlogPosts({
  allPostMetadata,
}: {
  allPostMetadata: PostMetadata[];
}) {
  const searchParams = useSearchParams();

  const blogs = Number(searchParams.get("blogs"));

  const limit = 3;
  const currentPage = blogs || 0;
  const skip = currentPage * limit;
  const slicedPostMetadata = allPostMetadata.slice(skip, skip + limit);

  const numPages = Math.ceil(allPostMetadata.length / limit);

  return (
    <>
      <div className=" divide-y-[1px] divide-gray-600">
        {slicedPostMetadata.map((post) => (
          <div
            key={post.slug}
            className="flex h-[200px] items-center justify-between gap-2 py-2 xl:gap-6"
          >
            <div>
              <div>
                <span className="mr-2 text-sm text-github-white-comment">
                  {post.createdAt}
                </span>
                {post.tags.map((tag: string, i: number) => {
                  return (
                    <span
                      key={i}
                      className="mx-1 rounded border border-github-white-comment bg-github-gray px-1 text-xs"
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <Link
                href={`/posts/${post.slug}`}
                className="inline-block text-github-white-link  md:text-2xl"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-xs font-light md:text-base">
                {truncateSummary(post.summary)}
              </p>
            </div>
            <Link href={`/posts/${post.slug}`} className="">
              <div className="h-24 w-24  lg:h-32 lg:w-32">
                <img
                  src={post.image}
                  className="h-full w-full rounded-full object-cover"
                  alt={post.slug}
                ></img>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex h-8 items-center justify-center -space-x-px text-lg md:mt-12">
        {Array.from({ length: numPages }, (_, index) => (
          <li key={index}>
            <Link
              href={`/?blogs=${index}`}
              className={`ml-0 flex h-12 items-center justify-center  border border-gray-700 px-4 leading-tight text-gray-400 hover:bg-gray-700 hover:text-white ${
                currentPage === index
                  ? "z-10 border-gray-700 bg-sky-600 px-3 font-semibold leading-tight text-white "
                  : ""
              }
              ${index === 0 ? "rounded-l-lg" : ""}
              ${index === numPages - 1 ? "rounded-r-lg" : ""} 
              `}
              scroll={false}
            >
              {index + 1}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

const truncateSummary = (text: string) => {
  const limit = 280;
  if (text.length <= limit) {
    return text;
  } else {
    return text.slice(0, limit) + "...";
  }
};
