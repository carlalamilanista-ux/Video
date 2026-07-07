import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import {loadDefaultFonts} from "../presets/fonts";

loadDefaultFonts();

const C = {
  bg: "#050010",
  deep: "#0a0020",
  purple: "#2d0a4e",
  violet: "#4a1580",
  gold: "#c8a84b",
  goldLight: "#e8c870",
  white: "#f0ecff",
  muted: "#b8a8e8",
  smoke: "rgba(200,168,75,0.15)",
};

// ─── Partículas místicas ───
const Particles: React.FC<{count?: number; color?: "gold" | "purple"}> = ({count = 40, color = "gold"}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {Array.from({length: count}, (_, i) => {
        const x = (i * 137.5) % width;
        const baseY = (i * 97.3) % height;
        const speed = 0.2 + (i % 7) * 0.08;
        const y = (baseY - frame * speed + height * 2) % height;
        const size = 1 + (i % 5) * 0.8;
        const tw = Math.sin((frame + i * 13) * 0.07) * 0.5 + 0.5;
        const op = (0.1 + (i % 4) * 0.08) * tw;
        const isGold = color === "gold" ? i % 3 !== 0 : i % 5 === 0;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: size, height: size, borderRadius: "50%",
            background: isGold ? C.gold : C.muted,
            opacity: op,
            boxShadow: `0 0 ${size * 4}px ${isGold ? C.gold : C.muted}`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Fondo animado con ondas de energía ───
const MysticBg: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.025) * 0.5 + 0.5;
  const pulse2 = Math.sin(frame * 0.015 + 1) * 0.5 + 0.5;
  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% ${35 + pulse * 15}%, #3b0764 0%, #1a0338 30%, #050010 65%)`,
      }} />
      {/* Ondas de energía */}
      {[0, 1, 2].map(i => {
        const scale = 0.3 + pulse2 * 0.3 + i * 0.3;
        const opacity = (0.12 - i * 0.03) * pulse;
        return (
          <div key={i} style={{
            position: "absolute",
            top: "30%", left: "50%",
            width: 600, height: 600,
            transform: `translate(-50%, -50%) scale(${scale})`,
            borderRadius: "50%",
            border: `1px solid rgba(200,168,75,${opacity * 3})`,
            boxShadow: `0 0 60px rgba(147,51,234,${opacity})`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Símbolo central animado ───
const MysticSymbol: React.FC<{delay?: number}> = ({delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = spring({fps, frame: frame - delay, from: 0, to: 1, config: {damping: 20, stiffness: 60}});
  const pulse = Math.sin(frame * 0.06) * 0.15 + 1;
  return (
    <div style={{
      opacity: interpolate(appear, [0, 1], [0, 1]),
      transform: `scale(${appear * pulse})`,
      fontSize: 52,
      color: C.gold,
      filter: `drop-shadow(0 0 20px ${C.gold})`,
      textAlign: "center",
    }}>
      ✦
    </div>
  );
};

// ─── Texto de oración con timing basado en silencios detectados ───
// Silencios detectados por ffmpeg:
// 0.55-1.07 | 1.08-1.93 | 1.95-2.86 | 5.93-6.72 | 9.94-10.44
// 12.89-13.29 | 14.45-15.14 | 18.34-19.20 | 21.99-22.80
// 26.43-27.15 | 28.76-29.35 | 30.65-31.67 | 34.58-35.05
// Frases de la oración distribuidas por segmentos de habla:
const ORACION_FRASES = [
  {from: 2.86,  to: 5.93,  text: "Oración para\ndevolver el mal"},
  {from: 6.72,  to: 9.94,  text: "Todo el mal que\nme han enviado"},
  {from: 10.44, to: 12.89, text: "Yo lo devuelvo\ncon amor y luz"},
  {from: 13.29, to: 14.45, text: "A quien lo envió"},
  {from: 15.14, to: 18.34, text: "Que la energía\nnegativa regrese\na su origen"},
  {from: 19.20, to: 21.99, text: "Yo me protejo\ncon la luz divina"},
  {from: 22.80, to: 26.43, text: "Ningún mal\npuede tocarme\nni dañarme"},
  {from: 27.15, to: 28.76, text: "Que así sea"},
  {from: 29.35, to: 30.65, text: "Amén"},
];

const PrayerCaption: React.FC<{frase: typeof ORACION_FRASES[0]; globalFrame: number}> = ({frase, globalFrame}) => {
  const {fps} = useVideoConfig();
  const localFrame = globalFrame - frase.from * fps;
  const totalFrames = (frase.to - frase.from) * fps;
  const fadeInF = 8;
  const fadeOutF = 8;

  const opacity = interpolate(localFrame,
    [0, fadeInF, totalFrames - fadeOutF, totalFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const scale = interpolate(localFrame,
    [0, fadeInF],
    [0.92, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  if (localFrame < 0 || localFrame > totalFrames) return null;

  const isTitle = frase.from < 6;

  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      textAlign: "center",
      padding: "0 60px",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: isTitle ? 72 : 60,
        fontWeight: isTitle ? 700 : 400,
        color: isTitle ? C.gold : C.white,
        lineHeight: 1.3,
        textShadow: `0 0 40px rgba(200,168,75,0.5), 0 2px 8px rgba(0,0,0,0.9)`,
        fontStyle: isTitle ? "normal" : "italic",
        whiteSpace: "pre-line",
      }}>
        {frase.text}
      </div>
    </div>
  );
};

// ─── Waveform animado (simulado con el ritmo del audio) ───
const AudioWave: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = 24;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 6, height: 60,
    }}>
      {Array.from({length: bars}, (_, i) => {
        const wave = Math.sin((frame * 0.18) + i * 0.5) * 0.5 + 0.5;
        const wave2 = Math.sin((frame * 0.12) + i * 0.8 + 2) * 0.3 + 0.7;
        const h = 8 + wave * wave2 * 36;
        return (
          <div key={i} style={{
            width: 3,
            height: h,
            borderRadius: 2,
            background: `linear-gradient(to top, ${C.gold}, ${C.goldLight})`,
            opacity: 0.6 + wave * 0.4,
            boxShadow: `0 0 6px ${C.gold}`,
          }} />
        );
      })}
    </div>
  );
};

// ─── INTRO (0-2.86s / 0-86f) ───
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p1 = spring({fps, frame, from: 0, to: 1, config: {damping: 18, stiffness: 70}});
  const p2 = spring({fps, frame: frame - 15, from: 0, to: 1, config: {damping: 18, stiffness: 70}});

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 20}}>
      <div style={{opacity: interpolate(p1, [0,1],[0,1]), transform: `scale(${interpolate(p1,[0,1],[0.5,1])})`}}>
        <MysticSymbol />
      </div>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 26, color: C.muted,
        letterSpacing: 6, textTransform: "uppercase",
        opacity: interpolate(p2, [0,1],[0,1]),
        transform: `translateY(${interpolate(p2,[0,1],[20,0])}px)`,
      }}>El Tarot de Amanda</div>
    </AbsoluteFill>
  );
};

// ─── ORACIÓN PRINCIPAL (2.86s-35s) ───
const SceneOracion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const globalFrame = frame + 2.86 * fps; // offset del inicio real

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      {/* Amanda foto placeholder con aura */}
      <div style={{
        position: "absolute",
        top: "6%", left: "50%",
        transform: "translateX(-50%)",
        width: 200, height: 200,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(91,33,182,0.6), rgba(5,0,16,0.8))`,
        border: `2px solid rgba(200,168,75,0.5)`,
        boxShadow: `0 0 60px rgba(147,51,234,0.5), 0 0 120px rgba(147,51,234,0.2)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 72,
        overflow: "hidden",
      }}>
        <span style={{opacity: 0.5}}>✦</span>
      </div>

      {/* Nombre + título */}
      <div style={{
        position: "absolute",
        top: "34%", width: "100%",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36, color: C.gold,
          letterSpacing: 2,
        }}>Amanda</div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 22, color: C.muted,
          letterSpacing: 4, textTransform: "uppercase", marginTop: 4,
        }}>Tarotista · Vidente</div>
      </div>

      {/* Frases de la oración centradas */}
      <AbsoluteFill style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        paddingTop: 120,
      }}>
        {ORACION_FRASES.map((frase, i) => (
          <div key={i} style={{position: "absolute", width: "100%", textAlign: "center"}}>
            <PrayerCaption frase={frase} globalFrame={globalFrame} />
          </div>
        ))}
      </AbsoluteFill>

      {/* Waveform inferior */}
      <div style={{
        position: "absolute",
        bottom: "14%", width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <AudioWave />
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 22, color: C.muted,
          letterSpacing: 3, textTransform: "uppercase", opacity: 0.6,
        }}>
          eltarotdeamanda.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── OUTRO CTA (31.67-35s / ~950-1050f) ───
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p1 = spring({fps, frame, from: 0, to: 1, config: {damping: 16, stiffness: 80}});
  const p2 = spring({fps, frame: frame - 20, from: 0, to: 1, config: {damping: 16, stiffness: 80}});
  const pulse = Math.sin(frame * 0.15) * 0.05 + 1;

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 24,
    }}>
      <div style={{
        fontSize: 56, color: C.gold,
        filter: `drop-shadow(0 0 20px ${C.gold})`,
        opacity: interpolate(p1, [0,1],[0,1]),
        transform: `scale(${interpolate(p1,[0,1],[0.5,1])})`,
      }}>✦</div>

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 56, fontWeight: 700,
        color: C.white, textAlign: "center",
        lineHeight: 1.2,
        opacity: interpolate(p1, [0,1],[0,1]),
        transform: `translateY(${interpolate(p1,[0,1],[25,0])}px)`,
        textShadow: `0 0 30px rgba(200,168,75,0.4)`,
      }}>
        ¿Necesitas protección?
      </div>

      <div style={{
        background: `linear-gradient(135deg, ${C.gold}, #8b6914)`,
        borderRadius: 60,
        padding: "22px 60px",
        opacity: interpolate(p2, [0,1],[0,1]),
        transform: `scale(${interpolate(p2,[0,1],[0.85,1]) * pulse})`,
        boxShadow: `0 0 30px rgba(200,168,75,0.4)`,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 30, fontWeight: 700,
          color: "#050010", letterSpacing: 1,
        }}>CONSULTA CON AMANDA</div>
      </div>

      <div style={{
        opacity: interpolate(p2, [0,1],[0,1]),
        textAlign: "center",
      }}>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 28, color: C.gold, letterSpacing: 2}}>
          961 283 972
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 22, color: C.muted, marginTop: 6, letterSpacing: 2}}>
          eltarotdeamanda.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── COMPOSICIÓN PRINCIPAL ───
// Audio: 35.05s → 1052 frames a 30fps
const FPS = 30;

export const OracionAmanda: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* Audio de Amanda */}
      <Audio src={staticFile("assets/audio-amanda.ogg")} />

      {/* Fondo siempre activo */}
      <MysticBg />
      <Particles count={45} color="gold" />

      {/* Intro 0-2.86s */}
      <Sequence from={0} durationInFrames={Math.round(2.86 * FPS)}>
        <SceneIntro />
      </Sequence>

      {/* Oración 2.86s-31.67s */}
      <Sequence from={Math.round(2.86 * FPS)} durationInFrames={Math.round(28.81 * FPS)}>
        <SceneOracion />
      </Sequence>

      {/* Outro CTA 31.67s-36s */}
      <Sequence from={Math.round(31.67 * FPS)} durationInFrames={Math.round(4.33 * FPS)}>
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
