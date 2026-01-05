"use client";

import React, { useEffect, useState } from "react";

import { slugify } from "@/lib/utils";

interface PageContentNavbarProps {
  headers: { header: string; level: number }[];
}

export default function PageContentNavbar({ headers }: PageContentNavbarProps) {
  const [intersectedHeaders, setIntersectedHeaders] = useState<string[]>([]);

  // observe headers. if they intersect with the viewport, add their id to the intersectedHeaders array
  useEffect(() => {
    const headersArray = document.querySelectorAll(
      ".prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6"
    );

    const observerCallback = (entries: any) => {
      entries.forEach((entry: any) => {
        if (
          entry.isIntersecting &&
          !intersectedHeaders.includes(entry.target.id)
        ) {
          setIntersectedHeaders((draft) => {
            draft.push(entry.target.id);
            return [...draft];
          });
        } else {
          setIntersectedHeaders((draft) => {
            return draft.filter(
              (intersectedId) => intersectedId !== entry.target.id
            );
          });
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 1,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    headersArray.forEach((header) => {
      observer.observe(header);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // watch intersectedHeaders and mark first intersecting one as active.
  useEffect(() => {
    if (intersectedHeaders.length) {
      // Remove "active" class from other links
      const allLinks = document.querySelectorAll("aside [href]");
      allLinks.forEach((link) => {
        link.classList.remove("active");
      });

      const correspondingLink = document.querySelector(
        `aside [href="#${intersectedHeaders[0]}"]`
      );

      if (correspondingLink) {
        correspondingLink.classList.add("active");
      }
    }
    return () => {};
  }, [intersectedHeaders]);

  return (
    <>
      <aside className="sticky top-5 mt-5 hidden max-w-[440px] self-start text-sm font-light text-gray-400 lg:block">
        <p className="mb-2 text-xs font-semibold  text-gray-200">
          ON THIS PAGE
        </p>
        <ul className="border-l border-gray-400">
          {headers.map(({ header, level }, index) => (
            <li key={index}>
              <a
                className={
                  "mb-1 block border-l-2 border-transparent hover:border-sky-400 hover:font-medium hover:text-sky-400 "
                }
                onClick={() => {
                  setIntersectedHeaders([slugify(header)]);
                }}
                style={{ paddingLeft: `${(level - 1) * 13}px` }}
                href={`#${slugify(header)}`}
              >
                {header}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
