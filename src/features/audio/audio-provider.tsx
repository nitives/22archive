"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { Track } from "./types";

type State = {
  queue: Track[];
  order: number[];
  index: number;
  current?: Track;

  isPlaying: boolean;
  isShuffled: boolean;

  currentTime: number;
  duration: number;
};

type Api = {
  state: State;

  setQueue: (
    tracks: Track[],
    opts?: { autoplay?: boolean; shuffle?: boolean },
  ) => void;

  playTrack: (
    track: Track,
    opts?: { queue?: Track[]; shuffle?: boolean },
  ) => void;

  toggle: () => void;
  next: () => void;
  prev: () => void;

  playAll: (tracks: Track[]) => void;
  shuffleAll: (tracks: Track[]) => void;

  seek: (time: number) => void;
};

const AudioCtx = createContext<Api | null>(null);

function makeOrder(len: number) {
  return Array.from({ length: len }, (_, i) => i);
}

function shuffleOrder(order: number[]) {
  const a = [...order];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Action =
  | { type: "SET_QUEUE"; queue: Track[]; shuffle: boolean; autoplay: boolean }
  | { type: "PLAY_TRACK"; track: Track; queue?: Track[]; shuffle?: boolean }
  | { type: "SET_PLAYING"; isPlaying: boolean }
  | { type: "TOGGLE" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "TIME"; currentTime: number }
  | { type: "DURATION"; duration: number }
  | { type: "RESET_TIME" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_QUEUE": {
      const queue = action.queue;
      const base = makeOrder(queue.length);
      const order = action.shuffle ? shuffleOrder(base) : base;
      const index = 0;
      const current = queue.length ? queue[order[index]] : undefined;

      return {
        ...state,
        queue,
        order,
        index,
        current,
        isShuffled: action.shuffle,
        isPlaying: action.autoplay ? state.isPlaying : false,
      };
    }

    case "PLAY_TRACK": {
      const queue = action.queue ?? state.queue;
      const isShuffled = action.shuffle ?? state.isShuffled;

      const base = makeOrder(queue.length);
      const order = isShuffled ? shuffleOrder(base) : base;

      const idxInQueue = queue.findIndex((t) => t.id === action.track.id);
      const current = idxInQueue >= 0 ? queue[idxInQueue] : action.track;

      let finalQueue = queue;
      let finalOrder = order;
      let finalIndex = 0;

      if (idxInQueue === -1) {
        finalQueue = [action.track, ...queue];
        const base2 = makeOrder(finalQueue.length);
        finalOrder = isShuffled ? shuffleOrder(base2) : base2;

        finalIndex = finalOrder.indexOf(0);
        if (finalIndex < 0) finalIndex = 0;
      } else {
        const pos = finalOrder.indexOf(idxInQueue);
        finalIndex = pos >= 0 ? pos : 0;
      }

      return {
        ...state,
        queue: finalQueue,
        order: finalOrder,
        index: finalIndex,
        current,
        isShuffled,
        isPlaying: true,
      };
    }

    case "SET_PLAYING":
      return { ...state, isPlaying: action.isPlaying };

    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };

    case "NEXT": {
      if (!state.queue.length) return state;
      const lastIndex = state.order.length - 1;
      // if we're already at the end, stop playback
      if (state.index >= lastIndex) {
        return { ...state, isPlaying: false, currentTime: 0 };
      }
      const nextIndex = state.index + 1;
      const current = state.queue[state.order[nextIndex]];
      return { ...state, index: nextIndex, current, isPlaying: true };
    }

    case "PREV": {
      if (!state.queue.length) return state;
      const prevIndex = Math.max(state.index - 1, 0);
      const current = state.queue[state.order[prevIndex]];
      return { ...state, index: prevIndex, current, isPlaying: true };
    }

    case "TIME":
      return { ...state, currentTime: action.currentTime };

    case "DURATION":
      return { ...state, duration: action.duration };

    case "RESET_TIME":
      return { ...state, currentTime: 0, duration: 0 };

    default:
      return state;
  }
}

const initialState: State = {
  queue: [],
  order: [],
  index: 0,
  current: undefined,
  isPlaying: false,
  isShuffled: false,
  currentTime: 0,
  duration: 0,
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = state.current;
  const isPlaying = state.isPlaying;

  // Keep the audio element in sync when current changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // No current track
    if (!current?.streamUrl) {
      dispatch({ type: "RESET_TIME" });
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    const desired = new URL(
      current.streamUrl,
      window.location.href,
    ).toString();

    // switching tracks -> reset UI time immediately
    dispatch({ type: "RESET_TIME" });

    // set src to the absolute desired URL
    if (audio.src !== desired) {
      audio.src = desired;
      // helps some browsers apply src immediately
      audio.load();
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        // autoplay can be blocked / play can fail
        dispatch({ type: "SET_PLAYING", isPlaying: false });
      });
    } else {
      audio.pause();
    }
  }, [current?.streamUrl, isPlaying]);

  // Play/pause when isPlaying flips
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current) return;

    if (isPlaying) {
      void audio
        .play()
        .catch(() => dispatch({ type: "SET_PLAYING", isPlaying: false }));
    } else {
      audio.pause();
    }
  }, [isPlaying, current]);

  // Wire audio element events -> state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => dispatch({ type: "NEXT" });

    const onTime = () =>
      dispatch({ type: "TIME", currentTime: audio.currentTime || 0 });

    const onLoaded = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      dispatch({ type: "DURATION", duration: d });
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
    };
  }, []);

  // Media session API
  useEffect(() => {
    // Media Session API isn't supported everywhere
    if (typeof navigator === "undefined") return;
    if (!("mediaSession" in navigator)) return;

    const track = current;

    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }

    // Build artwork array (best effort)
    const artwork = track.coverUrl
      ? [
          {
            src: new URL(track.coverUrl, window.location.href).toString(),
            sizes: "512x512",
            type: "image/png",
          },
        ]
      : undefined;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album ?? "",
      artwork,
    });

    // Hook platform controls -> your player actions
    // (These are standard actions the OS/browser may show.) :contentReference[oaicite:1]{index=1}
    navigator.mediaSession.setActionHandler("play", () => {
      dispatch({ type: "SET_PLAYING", isPlaying: true });
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      dispatch({ type: "SET_PLAYING", isPlaying: false });
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      dispatch({ type: "PREV" });
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      dispatch({ type: "NEXT" });
    });

    // Optional: seek support (lockscreen scrubber / media UI)
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (typeof details.seekTime !== "number") return;
      audio.currentTime = details.seekTime;
      dispatch({ type: "TIME", currentTime: details.seekTime });
    });

    return () => {
      // Clean handlers when track changes
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      } catch {
        // some browsers throw if you null unsupported handlers
      }
    };
  }, [current]);

  const api: Api = useMemo(
    () => ({
      state,

      seek: (time: number) => {
        const a = audioRef.current;
        if (!a) return;
        if (!Number.isFinite(time)) return;

        const max = Number.isFinite(a.duration) ? a.duration : undefined;
        const clamped =
          typeof max === "number"
            ? Math.min(Math.max(time, 0), max)
            : Math.max(time, 0);

        a.currentTime = clamped;
        dispatch({ type: "TIME", currentTime: clamped });
      },

      setQueue: (tracks, opts) => {
        dispatch({
          type: "SET_QUEUE",
          queue: tracks,
          shuffle: !!opts?.shuffle,
          autoplay: !!opts?.autoplay,
        });

        if (opts?.autoplay && tracks[0]) {
          dispatch({
            type: "PLAY_TRACK",
            track: tracks[0],
            queue: tracks,
            shuffle: !!opts?.shuffle,
          });
        }
      },

      playTrack: (track, opts) => {
        dispatch({
          type: "PLAY_TRACK",
          track,
          queue: opts?.queue,
          shuffle: opts?.shuffle,
        });
      },

      toggle: () => dispatch({ type: "TOGGLE" }),

      next: () => dispatch({ type: "NEXT" }),
      prev: () => dispatch({ type: "PREV" }),

      playAll: (tracks) => {
        dispatch({
          type: "SET_QUEUE",
          queue: tracks,
          shuffle: false,
          autoplay: true,
        });
        if (tracks[0]) {
          dispatch({
            type: "PLAY_TRACK",
            track: tracks[0],
            queue: tracks,
            shuffle: false,
          });
        }
      },

      shuffleAll: (tracks) => {
        dispatch({
          type: "SET_QUEUE",
          queue: tracks,
          shuffle: true,
          autoplay: true,
        });

        if (tracks[0]) {
          dispatch({
            type: "PLAY_TRACK",
            track: tracks[0],
            queue: tracks,
            shuffle: true,
          });
        }
      },
    }),
    [state],
  );

  return (
    <AudioCtx.Provider value={api}>
      {/* one audio element for the whole app */}
      <audio ref={audioRef} preload="none" />
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}
