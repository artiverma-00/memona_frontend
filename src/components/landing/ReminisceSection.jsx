import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FiPlayCircle } from "react-icons/fi";

export default function ReminisceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(false);
  const heroVideoSrc = `${import.meta.env.BASE_URL}video/hero.mp4`;

  return (
    <section
      ref={ref}
      className="bg-gradient-to-br from-amber-50 to-orange-50 py-24 px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold leading-tight text-[var(--color-text-primary)] md:text-4xl">
              Reminisce in a
              <br />
              <span className="text-[var(--color-accent-gold)]">
                Whole New Way
              </span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-text-secondary)]">
              Transform your photos and moments into cinematic memory videos
              powered by AI. Let technology bring your emotions to life.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[var(--color-accent-gold)] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <FiPlayCircle className="h-5 w-5" />
              See It in Action
            </motion.button>
          </motion.div>

          {/* Right Video Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 md:order-2"
          >
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl">
              <video
                className="h-full w-full object-cover aspect-video"
                src={heroVideoSrc}
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-stone-900 shadow-2xl transition-transform duration-300 hover:scale-110"
                  aria-label="Play video"
                >
                  <FiPlayCircle className="h-8 w-8" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
