import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getZoomScale(currentSec: number): number {
  for (const [start, end, scale] of ZOOMS) {
    if (currentSec >= start && currentSec < end) {
      return scale;
    }
  }
  return 1.0;
}


// ─── SUBTITLE COMPONENT ───────────────────────────────────────────────────────
const Subtitle: React.FC<{text: string; frame: number; startFrame: number; endFrame: number}> = ({
  text,
  frame,
  startFrame,
  endFrame,
}) => {
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
        padding: "0 20px",
      }}
    >
      <span
        style={{
          color: "#ffffff",
          fontSize: 42,
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          lineHeight: 1.2,
          textAlign: "center",
          textShadow:
            "2px 2px 0px #000, -2px 2px 0px #000, 2px -2px 0px #000, -2px -2px 0px #000, 0px 3px 6px rgba(0,0,0,0.9)",
          maxWidth: "90%",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const KaizenVideo2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentSec = frame / fps;

  const scale = getZoomScale(currentSec);

  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      {/* VIDEO con zoom suave */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center 35%",
        }}
      >
        <Video
          src={staticFile("assets/video2.webm")}
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
    </AbsoluteFill>
  );
};
