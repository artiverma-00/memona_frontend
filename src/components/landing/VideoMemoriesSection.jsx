import { useEffect, useRef } from "react";
import { FiPlayCircle } from "react-icons/fi";

export default function VideoMemoriesSection() {
  const sectionRef = useRef(null);
  const heroVideoSrc = `${import.meta.env.BASE_URL}video/hero.mp4`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-stone-950 text-stone-100"
      data-reveal
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-amber-200 sm:text-4xl">
            Turn Memories Into Living Stories.
          </h2>
          <p className="mt-5 text-lg text-stone-300">
            Instantly transform your photos and notes into cinematic memory
            videos powered by AI.
          </p>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-stone-700/70 bg-black">
          <video
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            src={heroVideoSrc}
            autoPlay
            muted
            loop
            playsInline
          />
          <button
            className="absolute inset-0 m-auto h-14 w-14 rounded-full border border-white/60 bg-black/50 text-white transition group-hover:scale-110"
            aria-label="Play preview"
          >
            <FiPlayCircle className="mx-auto h-7 w-7" />
          </button>
        </div>
      </div>
    </section>
  );
}
