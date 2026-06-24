import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

const FPS = 30;
// Ciclos de zoom: Plano A (100%) ↔ Plano B (115%)
// A: 0–35s | B: 35–55s | A: 55s–fin
const ZOOM_KEYFRAMES = [
  {frame: 0, scale: 1.0},
  {frame: 35 * FPS, scale: 1.0},
  {frame: 35 * FPS + 15, scale: 1.15},
  {frame: 55 * FPS - 15, scale: 1.15},
  {frame: 55 * FPS, scale: 1.0},
];

// Términos clave de técnica vocal con sus tiempos en el video EDITADO (segundos desde inicio editado)
const KEY_TERMS: {text: string; startSec: number}[] = [
  {text: "Técnica Vocal", startSec: 3},
  {text: "Resonadores", startSec: 12},
  {text: "Voz Mixta", startSec: 20},
  {text: "Apoyo Diafragmático", startSec: 30},
  {text: "Twang", startSec: 42},
  {text: "Registro de Cabeza", startSec: 52},
];

function getZoomScale(frame: number): {scale: number; translateY: number} {
  // Interpolar escala entre keyframes
  const kf = ZOOM_KEYFRAMES;
  let scale = 1.0;
  for (let i = 0; i < kf.length - 1; i++) {
    if (frame >= kf[i].frame && frame <= kf[i + 1].frame) {
      const progress =
        (frame - kf[i].frame) / (kf[i + 1].frame - kf[i].frame);
      scale = kf[i].scale + (kf[i + 1].scale - kf[i].scale) * progress;
      break;
    }
  }
  if (frame > kf[kf.length - 1].frame) {
    scale = kf[kf.length - 1].scale;
  }
  // Al hacer zoom, subir ligeramente para centrar en rostro (parte superior)
  const translateY = scale > 1.0 ? -(scale - 1.0) * 0.3 * 100 : 0;
  return {scale, translateY};
}

const LowerThird: React.FC<{text: string; startFrame: number}> = ({
  text,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame - startFrame;
  const HOLD_FRAMES = 3 * fps; // 3 segundos

  if (localFrame < 0 || localFrame > HOLD_FRAMES + 10) return null;

  const opacity = interpolate(
    localFrame,
    [0, 8, HOLD_FRAMES - 8, HOLD_FRAMES],
    [0, 1, 1, 0],
    {extrapolateRight: "clamp"}
  );
  const translateY = interpolate(localFrame, [0, 8], [12, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        borderLeft: "4px solid #6366f1",
        padding: "10px 28px",
        borderRadius: 6,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          color: "#ffffff",
          fontSize: 32,
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const KaizenCourseEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const {scale, translateY} = getZoomScale(frame);

  // Tiempo actual en el video ORIGINAL (el segmento empieza en 2.45s)
  const videoOffsetSeconds = 2.45;

  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      {/* VIDEO con zoom dinámico */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateY(${translateY}%)`,
          transformOrigin: "center 35%",
          transition: "none",
        }}
      >
        <Video
          src={staticFile("assets/video.webm")}
          startFrom={Math.floor(videoOffsetSeconds * fps)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>

      {/* LOWER THIRDS — términos clave */}
      {KEY_TERMS.map((term, i) => (
        <LowerThird
          key={i}
          text={term.text}
          startFrame={Math.floor(term.startSec * fps)}
        />
      ))}

      {/* Indicador de Plano A/B (debug visual — remover en producción) */}
      {/*
      <div style={{position:'absolute',top:20,right:20,color:'white',fontSize:24,opacity:0.5}}>
        {scale > 1.05 ? 'Plano B' : 'Plano A'}
      </div>
      */}
    </AbsoluteFill>
  );
};
