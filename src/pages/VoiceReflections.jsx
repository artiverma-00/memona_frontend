import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMic,
  FiSquare,
  FiPlay,
  FiPause,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiSave,
  FiX,
  FiClock,
  FiMusic,
  FiDelete,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { voiceReflectionsAPI } from "../services/api";
import Loader from "../components/shared/Loader";

// Custom hook for audio visualization
const useAudioVisualizer = (audioBlob, isRecording) => {
  const [waveformData, setWaveformData] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // Gold gradient for bars
        const gradient = ctx.createLinearGradient(
          0,
          height,
          0,
          height - barHeight,
        );
        gradient.addColorStop(0, "#f59e0b");
        gradient.addColorStop(0.5, "#fbbf24");
        gradient.addColorStop(1, "#fcd34d");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();
  }, []);

  const startVisualization = useCallback(async () => {
    if (!audioBlob) return;

    try {
      audioContextRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer =
        await audioContextRef.current.decodeAudioData(arrayBuffer);

      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = audioBuffer;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      sourceRef.current.start(0);

      drawWaveform();
    } catch (error) {
      console.error("Error setting up audio visualization:", error);
    }
  }, [audioBlob, drawWaveform]);

  const startRecordingVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
          animationRef.current = requestAnimationFrame(draw);

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(0, 0, width, height);

          const barWidth = (width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            const gradient = ctx.createLinearGradient(
              0,
              height,
              0,
              height - barHeight,
            );
            gradient.addColorStop(0, "#f59e0b");
            gradient.addColorStop(0.5, "#fbbf24");
            gradient.addColorStop(1, "#fcd34d");

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
          }
        };

        draw();
      }
    } catch (error) {
      console.error("Error starting recording visualization:", error);
    }
  }, []);

  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecordingVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isRecording, startRecordingVisualization, stopVisualization]);

  useEffect(() => {
    if (audioBlob && !isRecording) {
      startVisualization();
    }
    return () => {
      stopVisualization();
    };
  }, [audioBlob, isRecording, startVisualization, stopVisualization]);

  return { canvasRef, startVisualization, stopVisualization };
};

const VoiceReflections = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [playingRemainingSeconds, setPlayingRemainingSeconds] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const { canvasRef, stopVisualization } = useAudioVisualizer(
    audioBlob,
    isRecording,
  );

  // Fetch existing reflections
  const fetchReflections = useCallback(async () => {
    try {
      const response = await voiceReflectionsAPI.getAll();
      const voiceItems = (response?.data?.data || []).map((item) => ({
        id: item.id,
        audioUrl: item.secure_url,
        created_at: item.created_at,
        duration: item.duration,
        title: item.title || "Voice Reflection",
      }));

      const sorted = voiceItems.sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      });

      setReflections(sorted);
    } catch (error) {
      console.error("Error fetching reflections:", error);
      toast.error("Failed to load voice reflections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    stopVisualization();
  };

  const handleSave = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-reflection.webm");

      const response = await voiceReflectionsAPI.upload(formData);
      const saved = response?.data?.data;
      const normalizedSaved = {
        id: saved?.id,
        audioUrl: saved?.secure_url,
        created_at: saved?.created_at,
        duration: saved?.duration,
        title: saved?.title || "Voice Reflection",
      };

      setReflections([normalizedSaved, ...reflections]);
      toast.success("Voice reflection saved!");
      resetRecording();
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast.error("Failed to save voice reflection");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await voiceReflectionsAPI.delete(id);
      setReflections(reflections.filter((r) => r.id !== id));
      toast.success("Voice reflection deleted");
    } catch (error) {
      console.error("Error deleting reflection:", error);
      toast.error("Failed to delete voice reflection");
    }
  };

  const playReflection = (reflection) => {
    if (!audioRef.current || !reflection?.audioUrl) {
      return;
    }

    audioRef.current.src = reflection.audioUrl;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlayingId(reflection.id);

    if (reflection.duration) {
      setPlayingRemainingSeconds(Math.max(0, Math.round(reflection.duration)));
    } else {
      setPlayingRemainingSeconds(null);
    }
  };

  const togglePlay = (reflection) => {
    if (playingId === reflection.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      setPlayingRemainingSeconds(null);
    } else {
      playReflection(reflection);
    }
  };

  const moveToAdjacentReflection = (currentId, direction) => {
    if (!Array.isArray(reflections) || reflections.length === 0) {
      return;
    }

    const currentIndex = reflections.findIndex((item) => item.id === currentId);
    if (currentIndex < 0) {
      return;
    }

    const nextIndex =
      (currentIndex + direction + reflections.length) % reflections.length;
    playReflection(reflections[nextIndex]);
  };

  const updateRemainingPlaybackTime = () => {
    const player = audioRef.current;
    if (!player) return;

    const currentSeconds = player.currentTime;
    const activeReflection = reflections.find((item) => item.id === playingId);
    const fallbackDuration = Number(activeReflection?.duration || 0);

    if (!Number.isFinite(currentSeconds)) {
      return;
    }

    const durationSeconds = Number.isFinite(player.duration)
      ? player.duration
      : fallbackDuration;

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return;
    }

    const remaining = Math.max(0, Math.ceil(durationSeconds - currentSeconds));
    setPlayingRemainingSeconds(remaining);
  };

  const handleCardPlaybackEnded = () => {
    setPlayingId(null);
    setPlayingRemainingSeconds(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading voice reflections..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Voice Reflections
        </h1>
        <p className="text-stone-500">
          Record your thoughts, memories, and feelings in your voice
        </p>
      </div>

      {/* Recording Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-stone-100 shadow-xl p-6 md:p-8"
      >
        {/* Waveform Canvas */}
        <div className="mb-6">
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className={`w-full h-24 rounded-xl ${isRecording ? "bg-stone-900" : "bg-stone-50"}`}
          />
        </div>

        {/* Recording Timer */}
        <div className="text-center mb-6">
          {isRecording && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 rounded-full bg-red-500"
              />
              <span className="text-red-500 font-semibold">Recording</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-3xl font-mono font-bold text-stone-700">
            <FiClock className="w-6 h-6" />
            {formatDuration(duration)}
          </div>
        </div>

        {/* Record Button */}
        <div className="flex justify-center">
          {!audioUrl && !isRecording && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_10px_40px_rgba(245,158,11,0.4)] flex items-center justify-center group"
            >
              <FiMic className="w-8 h-8 text-stone-900 group-hover:scale-110 transition-transform" />
            </motion.button>
          )}

          {isRecording && (
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-stone-100 border-4 border-red-500 flex items-center justify-center"
              >
                <div className="w-6 h-6 bg-red-500 rounded-lg" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Help Text */}
        {!isRecording && !audioUrl && (
          <p className="text-center text-stone-400 mt-6">
            Tap the microphone to start recording
          </p>
        )}

        {/* Preview Section */}
        <AnimatePresence>
          {audioUrl && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 pt-8 border-t border-stone-100"
            >
              <h3 className="text-lg font-semibold text-stone-800 mb-4 text-center">
                Preview Your Recording
              </h3>

              <audio ref={previewAudioRef} src={audioUrl} className="hidden" />

              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => {
                    if (previewAudioRef.current) {
                      if (previewAudioRef.current.paused) {
                        previewAudioRef.current.play();
                      } else {
                        previewAudioRef.current.pause();
                      }
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors"
                >
                  <FiPlay className="w-6 h-6 ml-1" />
                </button>
                <div className="flex-1 max-w-md">
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration }}
                    />
                  </div>
                </div>
                <span className="text-stone-500 font-mono">
                  {formatDuration(duration)}
                </span>
              </div>

              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-full font-medium hover:bg-stone-200 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Discard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 rounded-full font-semibold hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      Save Reflection
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Saved Reflections */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <FiMusic className="text-amber-500" />
          Your Voice Reflections
        </h2>

        {reflections.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
            <FiMic className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No voice reflections yet</p>
            <p className="text-stone-400 text-sm">
              Tap the microphone above to record your first reflection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reflections.map((reflection) => (
              <motion.div
                key={reflection.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => togglePlay(reflection)}
                    className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors"
                  >
                    {playingId === reflection.id ? (
                      <FiPause className="w-5 h-5" />
                    ) : (
                      <FiPlay className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-400">
                      {formatDate(reflection.created_at)}
                    </p>
                    <p className="text-sm font-medium text-stone-700 truncate">
                      {reflection.title || "Voice Reflection"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <FiClock className="w-3.5 h-3.5" />
                    {playingId === reflection.id
                      ? `${formatDuration(playingRemainingSeconds ?? Math.round(reflection.duration || 0))} left`
                      : reflection.duration
                        ? formatDuration(Math.round(reflection.duration))
                        : "--:--"}
                  </div>
                  <div className="flex items-center gap-1">
                    {playingId === reflection.id && reflections.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            moveToAdjacentReflection(reflection.id, -1)
                          }
                          className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                          aria-label="Previous voice"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            moveToAdjacentReflection(reflection.id, 1)
                          }
                          className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                          aria-label="Next voice"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(reflection.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <FiDelete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden audio element for playing reflections */}
      <audio
        ref={audioRef}
        onLoadedMetadata={updateRemainingPlaybackTime}
        onTimeUpdate={updateRemainingPlaybackTime}
        onEnded={handleCardPlaybackEnded}
        className="hidden"
      />
    </div>
  );
};

export default VoiceReflections;
