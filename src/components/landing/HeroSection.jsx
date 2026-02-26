import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowDown } from "react-icons/fi";

export default function HeroSection() {
  const heroVideoSrc = `${import.meta.env.BASE_URL}video/hero.mp4`;

  // Floating images configuration
  const floatingImages = [
    // Left side images
    { src: "/images/image1.png", position: "left-8 top-20", delay: 0 },
    { src: "/images/image2.png", position: "left-16 top-48", delay: 0.2 },
    { src: "/images/image3.png", position: "left-12 bottom-32", delay: 0.4 },
    // Right side images
    { src: "/images/image4.png", position: "right-8 top-32", delay: 0.1 },
    { src: "/images/image5.png", position: "right-16 top-60", delay: 0.3 },
    { src: "/images/image6.png", position: "right-12 bottom-40", delay: 0.5 },
    // Center background image
    {
      src: "/images/image7.png",
      position: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10",
      delay: 0.6,
    },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Hero Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          src={heroVideoSrc}
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Warm cream overlay */}
        <div className="absolute inset-0 bg-[var(--color-page-bg)] opacity-20" />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Floating Memory Images - Hidden on mobile */}
      <div className="absolute inset-0 z-10 hidden lg:block">
        {floatingImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.8, delay: image.delay }}
            className={`absolute ${image.position} ${
              index === 6 ? "h-96 w-96" : "h-48 w-48"
            }`}
          >
            <motion.img
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: image.delay,
              }}
              src={image.src}
              alt={`Memory ${index + 1}`}
              className={`h-full w-full rounded-2xl object-cover shadow-2xl transition-all duration-300 hover:scale-110 hover:opacity-100 ${
                index === 6 ? "blur-sm opacity-30" : "blur-[2px]"
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Your Life, Beautifully Remembered.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-5 max-w-2xl text-base text-stone-200 sm:text-lg"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
          >
            Capture moments, relive emotions, and build a living timeline of
            your life's most meaningful memories.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/register"
              className="rounded-full bg-amber-300 px-8 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-200 hover:shadow-lg hover:shadow-amber-200/20"
            >
              Start Your Timeline
            </Link>
           
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm font-medium text-white/70">
              Scroll to explore
            </span>
            <FiArrowDown className="h-6 w-6 text-[var(--color-accent-gold)]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
