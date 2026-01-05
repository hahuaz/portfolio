import React from "react";

export default function FeaturedVideo() {
  return (
    <div className="my-4 ">
      <div className="relative  h-80   flex-1 md:h-[400px]">
        <iframe
          width="100%"
          height={"100%"}
          src="https://www.youtube.com/embed/1GMROn7Wxsc?rel=0&showinfo=0&modestbranding=1"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
        {/* <div className="absolute inset-0 bg-[url('/images/featured-video-poster.png')] z-10 bg-cover"></div> */}
      </div>
    </div>
  );
}
