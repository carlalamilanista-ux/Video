import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

const FPS = 30;

const s = (time: string): number => {
  const [min, sec] = time.split(":");
  return parseFloat(min) * 60 + parseFloat(sec);
};

const f = (sec: number) => Math.floor(sec * FPS);

// ─── SUBTÍTULOS ────────────────────────────────────────────────────────────────
const SUBTITLES = [
  {start: s("00:00.000"), end: s("00:01.440"), text: "Hoy es un día"},
  {start: s("00:01.440"), end: s("00:02.440"), text: "muy emocionante"},
  {start: s("00:02.440"), end: s("00:03.120"), text: "para España."},
  {start: s("00:03.120"), end: s("00:04.400"), text: "Incluso a los que"},
  {start: s("00:04.400"), end: s("00:05.160"), text: "no nos gusta"},
  {start: s("00:05.160"), end: s("00:05.760"), text: "el fútbol,"},
  {start: s("00:05.760"), end: s("00:06.640"), text: "nos gusta ver"},
  {start: s("00:06.640"), end: s("00:07.440"), text: "a nuestra selección"},
  {start: s("00:07.440"), end: s("00:08.160"), text: "en la final."},
  {start: s("00:08.160"), end: s("00:09.680"), text: "Y he pensado"},
  {start: s("00:09.680"), end: s("00:10.560"), text: "una cosa:"},
  {start: s("00:10.560"), end: s("00:11.760"), text: "Detrás de ese"},
  {start: s("00:11.760"), end: s("00:12.600"), text: "resultado de hoy,"},
  {start: s("00:12.600"), end: s("00:13.600"), text: "hay un gran"},
  {start: s("00:13.600"), end: s("00:14.360"), text: "sacrificio,"},
  {start: s("00:14.360"), end: s("00:14.920"), text: "disciplina,"},
  {start: s("00:14.920"), end: s("00:16.120"), text: "años de entrenamiento."},
  {start: s("00:16.120"), end: s("00:17.440"), text: "Y lo mismo ocurre"},
  {start: s("00:17.440"), end: s("00:18.240"), text: "con los cantantes."},
  {start: s("00:18.240"), end: s("00:19.240"), text: "Cuando vais a"},
  {start: s("00:19.240"), end: s("00:20.000"), text: "los conciertos de"},
  {start: s("00:20.000"), end: s("00:20.920"), text: "vuestros artistas favoritos"},
  {start: s("00:20.920"), end: s("00:21.840"), text: "y disfrutáis muchísimo,"},
  {start: s("00:21.840"), end: s("00:22.840"), text: "detrás hay"},
  {start: s("00:22.840"), end: s("00:24.160"), text: "muchísimo trabajo"},
  {start: s("00:24.160"), end: s("00:24.840"), text: "de años."},
  {start: s("00:24.840"), end: s("00:26.160"), text: "Porque el talento"},
  {start: s("00:26.160"), end: s("00:27.040"), text: "abre las puertas,"},
  {start: s("00:27.040"), end: s("00:27.760"), text: "pero el trabajo"},
  {start: s("00:27.760"), end: s("00:28.840"), text: "es lo que te"},
  {start: s("00:28.840"), end: s("00:29.280"), text: "lleva a la final."},
  {start: s("00:29.280"), end: s("00:30.400"), text: "¡Vamos, España!"},
];

// ─── ZOOMS ────────────────────────────────────────────────────────────────────
// [startSec, endSec, scale]
const ZOOMS: [number, number, number][] = [
  [s("00:00.000"), s("00:04.400"), 1.10], // Punch-in +10%
  [s("00:04.400"), s("00:10.560"), 1.00], // Normal
  [s("00:10.560"), s("00:16.120"), 1.12], // Punch-in +12%
  [s("00:16.120"), s("00:24.840"), 1.00], // Normal
  [s("00:24.840"), s("00:29.280"), 1.15], // Punch-in máximo +15%
  [s("00:29.280"), s("00:31.250"), 1.00], // Normal
];

// ─── TRANSICIONES (flash overlay) ─────────────────────────────────────────────
const TRANSITIONS: {sec: number; type: "whip" | "glitch" | "luma" | "slide"}[] =
  [
    {sec: s("00:08.160"), type: "whip"},
    {sec: s("00:16.120"), type: "slide"},
    {sec: s("00:24.840"), type: "glitch"},
    {sec: s("00:29.280"), type: "luma"},
  ];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getZoomScale(currentSec: number): number {
  for (const [start, end, scale] of ZOOMS) {
    if (currentSec >= start && currentSec < end) {
      return scale;
    }
  }
  return 1.0;
}

function getTransitionOpacity(
  currentSec: number,
  frame: number
): {opacity: number; color: string; blur: number} {
  let opacity = 0;
  let color = "white";
  let blur = 0;

  for (const t of TRANSITIONS) {
    const tFrame = f(t.sec);
    const localFrame = frame - tFrame;
    if (localFrame >= 0 && localFrame < 12) {
      const prog = interpolate(localFrame, [0, 6, 12], [0, 1, 0], {
        extrapolateRight: "clamp",
      });
      if (t.type === "glitch") {
        opacity = prog * 0.6;
        color = "#ff0055";
        blur = prog * 4;
      } else if (t.type === "luma") {
        opacity = prog * 0.8;
        color = "white";
      } else if (t.type === "whip") {
        opacity = prog * 0.4;
        color = "white";
        blur = prog * 8;
      } else if (t.type === "slide") {
        opacity = prog * 0.3;
        color = "white";
      }
      break;
    }
  }
  return {opacity, color, blur};
}

// ─── SUBTITLE COMPONENT ───────────────────────────────────────────────────────
const Subtitle: React.FC<{text: string; frame: number; startFrame: number; endFrame: number}> = ({
  text,
  frame,
  startFrame,
  endFrame,
}) => {
  const FADE = 3;
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + FADE, endFrame - FADE, endFrame],
    [0, 1, 1, 0],
    {extrapolateRight: "clamp", extrapolateLeft: "clamp"}
  );

  if (frame < startFrame || frame > endFrame) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.65)",
          borderRadius: 8,
          padding: "8px 20px",
          maxWidth: "85%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 36,
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 700,
            lineHeight: 1.2,
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const KaizenVideo2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentSec = frame / fps;

  const scale = getZoomScale(currentSec);
  const {opacity, color, blur} = getTransitionOpacity(currentSec, frame);

  // Suavizar el zoom
  const smoothScale = interpolate(
    frame,
    [Math.max(0, frame - 8), frame],
    [scale, scale],
    {extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      {/* VIDEO con zoom */}
      <AbsoluteFill
        style={{
          transform: `scale(${smoothScale})`,
          transformOrigin: "center 35%",
          willChange: "transform",
        }}
      >
        <Video
          src={staticFile("assets/video2.webm")}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>

      {/* FLASH DE TRANSICIÓN */}
      {opacity > 0 && (
        <AbsoluteFill
          style={{
            background: color,
            opacity,
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
            pointerEvents: "none",
          }}
        />
      )}

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
    </AbsoluteFill>
  );
};
