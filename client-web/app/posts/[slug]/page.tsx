import { getAllPostMetadata, getPost } from "@/lib/post";

import CodeBlockHighlighter from "./CodeBlockHighlighter";
import PageContentNavbar from "./PageContentNavbar";

export const generateStaticParams = async () => {
  const posts = getAllPostMetadata();
  return posts.map((post) => ({
    slug: post.slug,
  }));
};

const PostPage = ({ params: { slug } }: any) => {
  const {
    data: { title, createdAt },
    content,
    headers,
  } = getPost(slug);

  return (
    <>
      <div className="mx-auto flex max-w-screen-xl items-start justify-center gap-10 px-2 py-9  lg:justify-start">
        <main className="w-full max-w-[80ch] overflow-x-auto ">
          <div className="">
            <span className="text-sm text-github-white-comment">
              {createdAt}
            </span>
            <h1 className=" pb-2 text-3xl font-semibold text-github-white-link">
              {title}
            </h1>
          </div>
          <CodeBlockHighlighter content={content} />
        </main>
        <PageContentNavbar headers={headers} />
      </div>
    </>
  );
};

export default PostPage;
