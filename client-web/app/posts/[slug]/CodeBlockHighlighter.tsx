"use client";

import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus as codeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

import styles from "./post.module.css";

const CodeBlock = (props: any) => {
  // console.log("pre tag:", props);
  const { children } = props;
  // Check if children type is a <code> tag
  if (children?.type !== "code") {
    return <pre>{children}</pre>;
  }

  // console.log(children.props);
  /**
   *children: "...."
    className: "lang-ts"
    filename-app-stack: true
    ts: true
   */

  const { className, children: codeSnippet } = children.props;
  // console.log(className);

  let filename;
  const codeKeys = Object.keys(children.props);
  codeKeys.forEach((key) => {
    if (key.startsWith("filename-")) {
      filename = key.replace("filename-", "");
      return;
    }
  });

  // language needs to be modified for SyntaxHighlighter
  let language, extension;

  if (className === "lang-ts") {
    language = "typescript";
    extension = "ts";
  } else if (className === "lang-js") {
    language = "javascript";
    extension = "js";
  } else if (className === "lang-html") {
    language = "html";
    extension = "html";
  } else if (className === "lang-css") {
    language = "css";
    extension = "css";
  } else if (className === "lang-json") {
    language = "json";
    extension = "json";
  } else if (className === "lang-bash") {
    language = "bash";
    extension = "";
  } else if (className === "lang-liquid") {
    language = "liquid";
    extension = "liquid";
  }

  let fileIndicator;

  if (filename) {
    fileIndicator = (
      <span className="inline-block rounded-t-md bg-zinc-700 px-2 py-1 text-xs">
        {filename}.{extension}
      </span>
    );
  } else if (language === "bash") {
    fileIndicator = (
      <span className="inline-block rounded-t-md bg-zinc-700 px-2 py-1 text-xs">
        bash
      </span>
    );
  }

  return (
    <>
      {fileIndicator}
      <SyntaxHighlighter
        language={language}
        style={codeStyle}
        className={`code ${
          (filename || language === "bash") && "mt-0 rounded-tl-none"
        }
        ${language === "bash" && styles.bash}
        `}
        wrapLines={true}
      >
        {codeSnippet}
      </SyntaxHighlighter>
    </>
  );
};

const CodeBlockHighlighter = ({ content }: any) => {
  return (
    <>
      <article className="prose prose-invert !max-w-full dark:prose-invert">
        <Markdown
          options={{
            // override html tag rendering
            overrides: {
              pre: CodeBlock,
            },
          }}
        >
          {content}
        </Markdown>
      </article>
    </>
  );
};
export default CodeBlockHighlighter;
