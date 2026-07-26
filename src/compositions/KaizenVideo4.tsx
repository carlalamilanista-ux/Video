import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  interpolate,
  staticFile,
} from "remotion";

// Bloques de texto (frames en video de 15s = 450 frames totales)
const BLOCKS = [
  {
    startFrame: 0,
    endFrame: 105,       // 0s – 3.5s
    lines: [
      "Cada vez que veo montar",
      "un escenario de una orquesta,",
      "pienso lo mismo:",
    ],
  },
  {
    startFrame: 105,
    endFrame: 210,       // 3.5s – 7.0s
    lines: [
      "Esta noche habrá",
      "música y diversión.",
    ],
  },
  {
    startFrame: 210,
    endFrame: 450,       // 7.0s – fin
    lines: [
      "Pero detrás hay meses",
      "de trabajo, kilómetros,",
      "cansancio...",
      "y muchas horas entrenando",
      "la voz para poder darlo todo.",
    ],
  },
];

const TRANSITION_FRAMES = 8; // duración del slide/fade entre bloques

// ─── CAROUSEL BLOCK ───────────────────────────────────────────────────────────
const CarouselBlock: React.FC<{
  lines: string[];
  startFrame: number;
  endFrame: number;
  frame: number;
}> = ({lines, startFrame, endFrame, frame}) => {
  const local = frame - startFrame;
  const duration = endFrame - startFrame;

  if (local < -TRANSITION_FRAMES || local > duration + TRANSITION_FRAMES) return null;

  // Slide desde derecha al entrar, slide a izquierda al salir
  const enterX = interpolate(local, [0, TRANSITION_FRAMES], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitX = interpolate(
    local,
    [duration - TRANSITION_FRAMES, duration],
    [0, -120],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const translateX = local < TRANSITION_FRAMES ? enterX : exitX;

  const opacity = interpolate(
    local,
    [0, TRANSITION_FRAMES, duration - TRANSITION_FRAMES, duration],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "18%",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 32px",
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      {/* Caja semi-transparente */}
      <div
        style={{
          background: "rgba(0,0,0,0.48)",
          borderRadius: 16,
          padding: "20px 32px",
          maxWidth: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        {lines.map((line, i) => (
          <span
            key={i}
            style={{
              color: "#ffffff",
              fontSize: 38,
              fontFamily: "Arial Black, Helvetica Bold, Arial, sans-serif",
              fontWeight: 900,
              lineHeight: 1.3,
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              display: "block",
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export const KaizenVideo4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      <AbsoluteFill>
        <Video
          src={staticFile("assets/video4.webm")}
          startFrom={0}
          muted
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>

      {BLOCKS.map((block, i) => (
        <CarouselBlock
          key={i}
          lines={block.lines}
          startFrame={block.startFrame}
          endFrame={block.endFrame}
          frame={frame}
        />
      ))}
    </AbsoluteFill>
  );
};
