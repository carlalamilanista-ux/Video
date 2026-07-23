import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

const FPS = 30;
const TRIM_START = 0.712;

const f = (timeSec: number) => Math.floor((timeSec - TRIM_START) * FPS);

// ─── SUBTÍTULOS ───────────────────────────────────────────────────────────────
const SUBTITLES = [
  {start: 0.712, end: 1.500, text: "El problema"},
  {start: 1.500, end: 3.000, text: "no son los ejercicios."},
  {start: 3.100, end: 4.200, text: "El problema es que"},
  {start: 4.200, end: 5.300, text: "no sabes por qué"},
  {start: 5.300, end: 6.200, text: "se están haciendo"},
  {start: 6.200, end: 7.000, text: "esos ejercicios."},
  {start: 7.100, end: 8.400, text: "Una rutina vocal"},
  {start: 8.400, end: 9.600, text: "sin un diagnóstico"},
  {start: 9.600, end: 11.000, text: "totalmente personalizado"},
  {start: 11.100, end: 12.000, text: "para ti"},
  {start: 12.000, end: 13.000, text: "y tu voz..."},
  {start: 13.100, end: 14.400, text: "Es una auténtica"},
  {start: 14.400, end: 17.000, text: "pérdida de tiempo."},
  {start: 17.100, end: 18.300, text: "Y te aseguro"},
  {start: 18.300, end: 19.500, text: "que sé lo frustrante"},
  {start: 19.500, end: 20.200, text: "que puede llegar"},
  {start: 20.200, end: 21.000, text: "a ser eso."},
  {start: 21.100, end: 21.900, text: "Porque yo también"},
  {start: 21.900, end: 22.572, text: "he estado ahí."},
];

// ─── ZOOMS ────────────────────────────────────────────────────────────────────
const ZOOMS: {start: number; end: number; scale: number}[] = [
  {start: 0.712, end: 7.000, scale: 1.10},
  {start: 7.000, end: 13.200, scale: 1.00},
  {start: 13.200, end: 17.000, scale: 1.12},
  {start: 17.000, end: 22.572, scale: 1.00},
];

// ─── GRÁFICOS B-ROLL ──────────────────────────────────────────────────────────
const GRAPHICS: {
  triggerSec: number;
  duration: number;
  bg: string;
  emoji: string;
  line1: string;
  line2: string;
}[] = [
  {
    triggerSec: 7.200,
    duration: 1.5,
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    emoji: "🎵",
    line1: "RUTINA VOCAL",
    line2: "La base de todo progreso",
  },
  {
    triggerSec: 13.200,
    duration: 1.5,
    bg: "linear-gradient(135deg, #0d4f3c 0%, #1a7a5c 100%)",
    emoji: "🎯",
    line1: "PERSONALIZADA PARA TI",
    line2: "Cada voz es única",
  },
  {
    triggerSec: 17.200,
    duration: 1.8,
    bg: "linear-gradient(135deg, #2c0a0a 0%, #7b1f1f 100%)",
    emoji: "💪",
    line1: "YO TAMBIÉN HE ESTADO AHÍ",
    line2: "La frustración es parte del camino",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getZoomScale(currentSec: number): number {
  const adjusted = currentSec + TRIM_START;
  for (const z of ZOOMS) {
    if (adjusted >= z.start && adjusted < z.end) return z.scale;
  }
  return 1.0;
}

// ─── SUBTITLE ─────────────────────────────────────────────────────────────────
const Subtitle: React.FC<{
  text: string;
  frame: number;
  startFrame: number;
  endFrame: number;
}> = ({text, frame, startFrame, endFrame}) => {
  if (frame < startFrame || frame > endFrame) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <span
        style={{
          color: "#ffffff",
          fontSize: 44,
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          lineHeight: 1.2,
          textAlign: "center",
          textShadow:
            "3px 3px 0px #000, -3px 3px 0px #000, 3px -3px 0px #000, -3px -3px 0px #000",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── GRAPHIC OVERLAY ──────────────────────────────────────────────────────────
const GraphicOverlay: React.FC<{
  frame: number;
  triggerFrame: number;
  durationFrames: number;
  bg: string;
  emoji: string;
  line1: string;
  line2: string;
}> = ({frame, triggerFrame, durationFrames, bg, emoji, line1, line2}) => {
  const local = frame - triggerFrame;
  if (local < 0 || local > durationFrames) return null;

  const FADE = 6;
  const opacity = interpolate(
    local,
    [0, FADE, durationFrames - FADE, durationFrames],
    [0, 1, 1, 0],
    {extrapolateRight: "clamp", extrapolateLeft: "clamp"}
  );

  const scale = interpolate(local, [0, FADE], [0.95, 1.0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: bg,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 60,
          height: 4,
          background: "rgba(255,255,255,0.6)",
          borderRadius: 2,
        }}
      />
      <span style={{fontSize: 80, lineHeight: 1}}>{emoji}</span>
      <span
        style={{
          color: "#ffffff",
          fontSize: 38,
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          textAlign: "center",
          letterSpacing: 2,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          padding: "0 32px",
        }}
      >
        {line1}
      </span>
      <span
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 26,
          fontFamily: "Arial, sans-serif",
          fontWeight: 400,
          textAlign: "center",
          fontStyle: "italic",
          padding: "0 40px",
        }}
      >
        {line2}
      </span>
      <div
        style={{
          width: 60,
          height: 4,
          background: "rgba(255,255,255,0.6)",
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export const KaizenVideo3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentSec = frame / fps;
  const scale = getZoomScale(currentSec);

  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center 35%",
        }}
      >
        <Video
          src={staticFile("assets/video3.webm")}
          startFrom={Math.floor(TRIM_START * FPS)}
          endAt={Math.floor(22.572 * FPS)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>

      {SUBTITLES.map((sub, i) => (
        <Subtitle
          key={i}
          text={sub.text}
          frame={frame}
          startFrame={f(sub.start)}
          endFrame={f(sub.end)}
        />
      ))}

      {GRAPHICS.map((g, i) => (
        <GraphicOverlay
          key={i}
          frame={frame}
          triggerFrame={f(g.triggerSec)}
          durationFrames={Math.floor(g.duration * FPS)}
          bg={g.bg}
          emoji={g.emoji}
          line1={g.line1}
          line2={g.line2}
        />
      ))}
    </AbsoluteFill>
  );
};
