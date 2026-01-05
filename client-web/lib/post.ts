import fs from "fs";
import matter from "gray-matter";

import { slugify } from "./utils";

export interface PostMetadata {
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
  image: string;
  slug: string;
}

/**
 * Get all post data from slug
 */
export const getPost = (slug: string) => {
  const folder = "posts/";
  const file = `${folder}${slug}.md`;
  const content = fs.readFileSync(file, "utf8");
  return {
    ...matter(content),
    headers: getFlatHeaders(content),
  };
};

export const getAllPostMetadata = (): PostMetadata[] => {
  const folder = "posts/";
  const files = fs.readdirSync(folder);
  const markdownPosts = files.filter((file) => file.endsWith(".md"));

  // Get gray-matter data from each file.
  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(`posts/${fileName}`, "utf8");
    const matterResult = matter(fileContents);
    return {
      title: matterResult.data.title,
      summary: matterResult.data.summary,
      createdAt: matterResult.data.createdAt,
      tags: matterResult.data.tags,
      image: matterResult.data.image,
      slug: slugify(matterResult.data.title),
    };
  });

  const sortedPosts: PostMetadata[] = posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sortedPosts;
};

export const getNestedHeaders = (content: string) => {
  const _exampleContent = `
  # my l1 header
  content...
  ## my l2 header
  ### my l3 header
  #### my l4 header
  content...
  ## my l2 header
  # my l1 header
  ## my l2 header
`;

  interface IHeader {
    header: string;
    children?: IHeader[];
  }

  // Regular expression to extract headers
  const headerRegex = /(#+)\s+(.*)/g;

  // Extract headers from the Markdown content using the regular expression
  const headers: IHeader[] = [];
  let match;
  const stack: IHeader[] = [];
  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length;
    const headerContent = match[2];

    const headerObject = { header: headerContent };

    if (level === 1) {
      headers.push(headerObject);
      stack.length = 0; // start emtpy stack
      stack.push(headerObject);
    } else {
      const parent = stack[level - 2];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(headerObject);
      stack.push(headerObject);
    }
  }

  // console.log(JSON.stringify(headers, null, 2));
};

export const getFlatHeaders = (content: string) => {
  const headerRegex = /(#+)\s+(.*)/g;
  const headers: { header: string; level: number }[] = [];
  let match;

  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length;
    const header = match[2];
    headers.push({ header, level });
  }

  return headers;
};
