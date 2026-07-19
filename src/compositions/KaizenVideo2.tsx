import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

const FPS = 30;
const TRIM_START = 0.671; // cortar silencio inicial

// Convertir timestamp original a frame ya ajustado por trim
const f = (timeSec: number) => Math.floor((timeSec - TRIM_START) * FPS);

// ─── SUBTÍTULOS (timestamps originales del video) ──────────────────────────────
const SUBTITLES = [
  {start: 0.671, end: 1.440, text: "Hoy es un día"},
  {start: 1.440, end: 2.440, text: "muy emocionante"},
  {start: 2.440, end: 3.120, text: "para España."},
  {start: 3.120, end: 4.400, text: "Incluso a los que"},
  {start: 4.400, end: 5.160, text: "no nos gusta"},
  {start: 5.160, end: 5.760, text: "el fútbol,"},
  {start: 5.760, end: 6.640, text: "nos gusta ver"},
  {start: 6.640, end: 7.440, text: "a nuestra selección"},
  {start: 7.440, end: 8.160, text: "en la final."},
  {start: 8.160, end: 9.680, text: "Y he pensado"},
  {start: 9.680, end: 10.560, text: "una cosa:"},
  {start: 10.560, end: 11.760, text: "Detrás de ese"},
  {start: 11.760, end: 12.600, text: "resultado de hoy,"},
  {start: 12.600, end: 13.600, text: "hay un gran"},
  {start: 13.600, end: 14.360, text: "sacrificio,"},
  {start: 14.360, end: 14.920, text: "disciplina,"},
  {start: 14.920, end: 16.120, text: "años de entrenamiento."},
  {start: 16.120, end: 17.440, text: "Y lo mismo ocurre"},
  {start: 17.440, end: 18.240, text: "con los cantantes."},
  {start: 18.240, end: 19.240, text: "Cuando vais a"},
  {start: 19.240, end: 20.000, text: "los conciertos de"},
  {start: 20.000, end: 20.920, text: "vuestros artistas favoritos"},
  {start: 20.920, end: 21.840, text: "y disfrutáis muchísimo,"},
  {start: 21.840, end: 22.840, text: "detrás hay"},
  {start: 22.840, end: 24.160, text: "muchísimo trabajo"},
  {start: 24.160, end: 24.840, text: "de años."},
  {start: 24.840, end: 26.160, text: "Porque el talento"},
  {start: 26.160, end: 27.040, text: "abre las puertas,"},
  {start: 27.040, end: 27.760, text: "pero el trabajo"},
  {start: 27.760, end: 28.840, text: "es lo que te"},
  {start: 28.840, end: 29.280, text: "lleva a la final."},
  {start: 29.280, end: 30.342, text: "¡Vamos, España!"},
];

// ─── ZOOMS (timestamps originales) ─────────────────────────────────────────────
const ZOOMS: {start: number; end: number; scale: number}[] = [
  {start: 0.671, end: 4.400, scale: 1.10},
  {start: 4.400, end: 10.560, scale: 1.00},
  {start: 10.560, end: 16.120, scale: 1.12},
  {start: 16.120, end: 24.840, scale: 1.00},
  {start: 24.840, end: 29.280, scale: 1.15},
  {start: 29.280, end: 30.342, scale: 1.00},
];

// ─── GRÁFICOS B-ROLL ──────────────────────────────────────────────────────────
// Aparecen como overlay sobre el video en los momentos de transición
const GRAPHICS: {
  triggerSec: number;   // momento en el video original
  duration: number;     // duración en segundos
  bg: string;
  emoji: string;
  line1: string;
  line2: string;
}[] = [
  {
    triggerSec: 8.160,
    duration: 1.5,
    bg: "linear-gradient(135deg, #c60b1e 0%, #f1bf00 50%, #c60b1e 100%)",
    emoji: "🏆",
    line1: "ESPAÑA EN LA FINAL",
    line2: "Detrás hay años de trabajo",
  },
  {
    triggerSec: 16.120,
    duration: 1.5,
    bg: "linear-gradient(135deg, #1a1a2e 0%, #6c3483 100%)",
    emoji: "🎤",
    line1: "LOS CANTANTES",
    line2: "Técnica · Disciplina · Años",
  },
  {
    triggerSec: 24.840,
    duration: 1.8,
    bg: "linear-gradient(135deg, #0d0d0d 0%, #b7950b 100%)",
    emoji: "💡",
    line1: "EL TALENTO ABRE PUERTAS",
    line2: "El trabajo te lleva a la final",
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
        bottom: 80,
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
      {/* Línea decorativa top */}
      <div
        style={{
          width: 60,
          height: 4,
          background: "rgba(255,255,255,0.6)",
          borderRadius: 2,
        }}
      />

      {/* Emoji */}
      <span style={{fontSize: 80, lineHeight: 1}}>{emoji}</span>

      {/* Línea 1 */}
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

      {/* Línea 2 */}
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

      {/* Línea decorativa bottom */}
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
export const KaizenVideo2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentSec = frame / fps;
  const scale = getZoomScale(currentSec);

  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      {/* VIDEO: empieza en TRIM_START, termina en 30.342s */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center 35%",
        }}
      >
        <Video
          src={staticFile("assets/video2.webm")}
          startFrom={Math.floor(TRIM_START * FPS)}
          endAt={Math.floor(30.342 * FPS)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>

      {/* SUBTÍTULOS */}
      {SUBTITLES.map((sub, i) => (
        <Subtitle
          key={i}
          text={sub.text}
          frame={frame}
          startFrame={f(sub.start)}
          endFrame={f(sub.end)}
        />
      ))}

      {/* GRÁFICOS B-ROLL */}
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
