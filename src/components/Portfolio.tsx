"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cards, site, type Card } from "@/content/cards";
import {
  clamp,
  hexToRgb,
  mixRgb,
  rgbCss,
  type RGB,
  type ScrollState,
} from "@/lib/scroll";

const Gallery = dynamic(() => import("./Gallery"), { ssr: false });

const LIGHT: RGB = [245, 245, 245];
const DARK: RGB = [13, 13, 13];
const palette = cards.map((c) => ({
  bg: hexToRgb(c.colors.background),
  accent: hexToRgb(c.colors.accent),
  fg: c.colors.text === "light" ? LIGHT : DARK,
}));

const WHEEL_SPEED = 0.0012;
const TOUCH_SPEED = 0.004;
const SNAP_DELAY = 140;

export default function Portfolio() {
  const max = cards.length - 1;
  const state = useRef<ScrollState>({
    target: 0,
    current: 0,
    velocity: 0,
    settled: 0,
    bg: palette[0].bg,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const s = state.current;
      const i = clamp(Math.round(index), 0, max);
      s.target = i;
      s.settled = i;
    },
    [max],
  );

  // Input: wheel, touch and keyboard drive a virtual scroll that snaps to cards.
  useEffect(() => {
    const s = state.current;
    let snapTimer: number | undefined;
    let touchY = 0;

    const snap = () => {
      const diff = s.target - s.settled;
      let next = s.settled;
      if (Math.abs(diff) > 0.1) {
        next = s.settled + Math.sign(diff) * Math.max(1, Math.round(Math.abs(diff)));
      }
      goTo(next);
    };
    const push = (delta: number) => {
      s.target = clamp(s.target + delta, -0.2, max + 0.2);
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snap, SNAP_DELAY);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      push(clamp(d, -120, 120) * WHEEL_SPEED);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      push((touchY - y) * TOUCH_SPEED);
      touchY = y;
    };
    const onTouchEnd = () => {
      window.clearTimeout(snapTimer);
      snap();
    };
    const onKey = (e: KeyboardEvent) => {
      const keys: Record<string, number> = {
        ArrowDown: 1,
        PageDown: 1,
        " ": 1,
        ArrowUp: -1,
        PageUp: -1,
      };
      if (e.key in keys) {
        e.preventDefault();
        goTo(s.settled + keys[e.key]);
      } else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(max);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(snapTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [goTo, max]);

  // Animation loop: smooth the scroll and blend colors between cards.
  useEffect(() => {
    const s = state.current;
    let raf = 0;
    let last = performance.now();
    let shown = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      s.current += (s.target - s.current) * (1 - Math.exp(-dt * 6));
      s.velocity = s.target - s.current;

      const c = clamp(s.current, 0, max);
      const i0 = Math.floor(c);
      const i1 = Math.min(i0 + 1, max);
      const t = c - i0;
      const a = palette[i0];
      const b = palette[i1];
      s.bg = mixRgb(a.bg, b.bg, t);

      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--bg", rgbCss(s.bg));
        root.style.setProperty("--accent", rgbCss(mixRgb(a.accent, b.accent, t)));
        root.style.setProperty("--fg", rgbCss(mixRgb(a.fg, b.fg, t)));
      }
      if (textRef.current) {
        const fade = Math.min(1, Math.abs(s.velocity) * 2.5);
        textRef.current.style.opacity = String(1 - fade * 0.7);
      }

      const index = Math.round(c);
      if (index !== shown) {
        shown = index;
        setActive(index);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [max]);

  const onReady = useCallback(() => setReady(true), []);
  const card = cards[active];
  const first = palette[0];

  return (
    <div
      ref={rootRef}
      className="portfolio fixed inset-0 overflow-hidden select-none"
      style={
        {
          "--bg": rgbCss(first.bg),
          "--accent": rgbCss(first.accent),
          "--fg": rgbCss(first.fg),
        } as CSSProperties
      }
    >
      <div className="absolute inset-y-0 left-0 z-20 w-2.5 bg-(--accent)" />

      <div className="pointer-events-none absolute inset-0">
        <Gallery cards={cards} state={state} onReady={onReady} />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-(--pad) pt-8 md:pt-10">
        <button type="button" onClick={() => goTo(0)} className="label-caps link-hover">
          {site.name}
        </button>
        <a href={site.headerLink.href} className="label-caps link-hover">
          {site.headerLink.label}
        </a>
      </header>

      <main className="pointer-events-none absolute inset-0 z-10 flex items-end px-(--pad) pb-12 max-md:pr-12 md:items-center md:pb-[8vh]">
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-t from-(--bg) from-75% to-transparent md:hidden" />
        <div ref={textRef} className="pointer-events-auto relative w-full max-w-[min(560px,48vw)] max-md:max-w-full">
          <CardText key={card.slug} card={card} />
        </div>
      </main>

      <nav
        aria-label="Navigasi proyek"
        className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-4 md:right-(--pad)"
      >
        {cards.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            aria-label={c.label ?? c.title}
            aria-current={i === active}
            onClick={() => goTo(i)}
            className="group relative flex h-4 w-2 items-center justify-center"
          >
            <span
              className="block h-full w-full rounded-full transition-colors duration-500"
              style={{
                background:
                  i === active
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--fg) 35%, transparent)",
              }}
            />
            <span className="label-caps pointer-events-none absolute right-6 translate-x-2 whitespace-nowrap opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 max-md:hidden">
              {c.label ?? c.title}
            </span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-10 left-(--pad) z-20 h-[114px] w-[196px] overflow-hidden rounded-md border-[3px] border-(--accent) bg-(--accent) max-md:hidden [@media(max-height:760px)]:hidden">
        {cards.map((c, i) =>
          c.preview ? (
            <Preview key={c.slug} src={c.preview} visible={i === active} />
          ) : null,
        )}
      </div>

      <div
        className={`absolute inset-0 z-30 flex items-center justify-center bg-(--bg) transition-opacity duration-1000 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="label-caps animate-pulse">{site.name}</span>
      </div>
    </div>
  );
}

function CardText({ card }: { card: Card }) {
  let d = 0;
  const delay = () => ({ "--d": d++ }) as CSSProperties;

  return (
    <div className="card-text">
      {card.eyebrow && (
        <p className="rise label-caps mb-4 opacity-80" style={delay()}>
          {card.eyebrow}
        </p>
      )}
      <h1 className="title wipe font-display text-(--accent)" style={delay()}>
        {card.title}
      </h1>
      <p className="rise mt-4 text-base leading-relaxed md:mt-5 md:text-xl" style={delay()}>
        {card.description}
      </p>

      {card.details && (
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 md:mt-7 md:gap-x-8 md:gap-y-4">
          {card.details.map((item) => (
            <div key={item.label} className="rise" style={delay()}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-60">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm md:text-base">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {card.cta && (
        <a
          href={card.cta.href}
          target={card.cta.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="rise cta label-caps mt-7 inline-flex items-center gap-3 md:mt-9"
          style={delay()}
        >
          {card.cta.label}
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" className="arrow text-(--accent)">
            <path d="M0 7h20M14 1l6 6-6 6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </a>
      )}
    </div>
  );
}

function Preview({ src, visible }: { src: string; visible: boolean }) {
  const className = `absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
    visible ? "scale-100 opacity-100" : "scale-110 opacity-0"
  }`;
  if (/\.(mp4|webm)$/i.test(src)) {
    return <video src={src} className={className} autoPlay muted loop playsInline />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={className} draggable={false} />;
}
