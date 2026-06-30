import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {loadDefaultFonts} from "../presets/fonts";

loadDefaultFonts();

const C = {
  bg: "#0d0118",
  purple: "#2d0a4e",
  purpleMid: "#5b21b6",
  gold: "#d4a843",
  goldLight: "#f0c060",
  white: "#f5f0ff",
  muted: "#c4b5fd",
  glow: "rgba(180,100,255,0.4)",
};

// ─── Partículas flotantes místicas ───
const MysticParticles: React.FC<{count?: number}> = ({count = 30}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const particles = Array.from({length: count}, (_, i) => {
    const seed = i * 137.508;
    const x = (seed * 23.7) % width;
    const y = (seed * 41.3) % height;
    const speed = 0.3 + (i % 5) * 0.15;
    const size = 1.5 + (i % 4) * 1.2;
    const opacity = 0.2 + (i % 6) * 0.1;
    const offsetY = (frame * speed) % height;
    const twinkle = Math.sin((frame + i * 20) * 0.08) * 0.4 + 0.6;
    return {x, y: (y - offsetY + height) % height, size, opacity: opacity * twinkle, isGold: i % 3 === 0};
  });

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          borderRadius: "50%",
          background: p.isGold ? C.gold : C.white,
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 3}px ${p.isGold ? C.gold : C.muted}`,
        }} />
      ))}
    </AbsoluteFill>
  );
};

// ─── Fondo místico animado ───
const MysticBackground: React.FC<{variant?: "center" | "top"}> = ({variant = "center"}) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
  const y = variant === "top" ? 20 + pulse * 10 : 40 + pulse * 15;
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% ${y}%, #3b0764 0%, #1e0438 35%, #0d0118 70%)`,
    }} />
  );
};

// ─── Orbe brillante central ───
const MysticOrb: React.FC<{size?: number; x?: string; y?: string; opacity?: number}> = ({
  size = 400, x = "50%", y = "50%", opacity = 0.15
}) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.05) * 0.3 + 0.7;
  return (
    <div style={{
      position: "absolute",
      left: x, top: y,
      width: size, height: size,
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      background: `radial-gradient(circle, rgba(147,51,234,${opacity * pulse}) 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />
  );
};

// ─── Línea dorada ───
const GoldLine: React.FC<{delay?: number; width?: number}> = ({delay = 0, width: w = 180}) => {
  const frame = useCurrentFrame();
  const scaleX = interpolate(frame - delay, [0, 25], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{
      width: w, height: "1.5px",
      background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
      transform: `scaleX(${scaleX})`,
      margin: "0 auto",
    }} />
  );
};

// ─── ESCENA 1: GANCHO ───
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const p1 = spring({fps, frame, from: 0, to: 1, config: {damping: 18, stiffness: 80}});
  const p2 = spring({fps, frame: frame - 18, from: 0, to: 1, config: {damping: 18, stiffness: 80}});
  const p3 = spring({fps, frame: frame - 38, from: 0, to: 1, config: {damping: 18, stiffness: 80}});

  return (
    <AbsoluteFill style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      <MysticOrb size={600} x="50%" y="45%" opacity={0.2} />

      {/* Símbolo */}
      <div style={{
        fontSize: 80,
        opacity: interpolate(p1, [0, 1], [0, 1]),
        transform: `scale(${interpolate(p1, [0, 1], [0.4, 1])})`,
        filter: `drop-shadow(0 0 24px ${C.gold})`,
        marginBottom: 24,
        lineHeight: 1,
      }}>✦</div>

      <GoldLine delay={5} width={200} />
      <div style={{height: 30}} />

      {/* Hook principal */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 70,
        fontWeight: 700,
        color: C.white,
        textAlign: "center",
        lineHeight: 1.15,
        padding: "0 64px",
        opacity: interpolate(p2, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(p2, [0, 1], [35, 0])}px)`,
        textShadow: `0 0 50px ${C.glow}, 0 2px 6px rgba(0,0,0,0.9)`,
      }}>
        ¿Las cartas<br />tienen un mensaje<br />para ti?
      </div>

      <div style={{height: 30}} />
      <GoldLine delay={40} width={200} />
      <div style={{height: 24}} />

      {/* Subtexto */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 30,
        color: C.muted,
        textAlign: "center",
        letterSpacing: 5,
        textTransform: "uppercase",
        opacity: interpolate(p3, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(p3, [0, 1], [20, 0])}px)`,
      }}>
        videntes que aciertan
      </div>
    </AbsoluteFill>
  );
};

// ─── ESCENA 2: AMANDA (con foto si existe, orbe si no) ───
const SceneAmanda: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: "clamp"});
  const p1 = spring({fps, frame: frame - 30, from: 0, to: 1, config: {damping: 16, stiffness: 70}});
  const p2 = spring({fps, frame: frame - 55, from: 0, to: 1, config: {damping: 16, stiffness: 70}});
  const p3 = spring({fps, frame: frame - 78, from: 0, to: 1, config: {damping: 16, stiffness: 70}});

  // Marco decorativo animado
  const borderPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <MysticBackground variant="top" />
      <MysticOrb size={800} x="50%" y="35%" opacity={0.18} />

      {/* Marco foto decorativo - placeholder visual */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 480,
        height: 580,
        border: `2px solid rgba(212,168,67,${borderPulse * 0.7})`,
        borderRadius: 12,
        boxShadow: `0 0 60px rgba(91,33,182,0.4), inset 0 0 40px rgba(13,1,24,0.5)`,
        background: "rgba(45,10,78,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Placeholder ornamental */}
        <div style={{textAlign: "center", opacity: 0.4}}>
          <div style={{fontSize: 80, color: C.gold}}>✦</div>
          <div style={{fontSize: 22, color: C.muted, letterSpacing: 3, marginTop: 12}}>AMANDA</div>
        </div>
        {/* Esquinas decorativas */}
        {[
          {top: 8, left: 8}, {top: 8, right: 8},
          {bottom: 8, left: 8}, {bottom: 8, right: 8}
        ].map((pos, i) => (
          <div key={i} style={{
            position: "absolute", ...pos,
            width: 24, height: 24,
            borderTop: i < 2 ? `2px solid ${C.gold}` : "none",
            borderBottom: i >= 2 ? `2px solid ${C.gold}` : "none",
            borderLeft: i % 2 === 0 ? `2px solid ${C.gold}` : "none",
            borderRight: i % 2 === 1 ? `2px solid ${C.gold}` : "none",
          }} />
        ))}
      </div>

      {/* Texto inferior */}
      <AbsoluteFill style={{justifyContent: "flex-end", padding: "0 64px 110px"}}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 88,
          fontWeight: 700,
          color: C.white,
          lineHeight: 1,
          opacity: interpolate(p1, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(p1, [0, 1], [-40, 0])}px)`,
          textShadow: `0 0 30px ${C.glow}`,
        }}>Amanda</div>

        <div style={{
          width: interpolate(p2, [0, 1], [0, 260]),
          height: 2,
          background: `linear-gradient(90deg, ${C.gold}, transparent)`,
          margin: "14px 0",
        }} />

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 32,
          color: C.gold,
          letterSpacing: 4,
          textTransform: "uppercase",
          fontWeight: 300,
          opacity: interpolate(p2, [0, 1], [0, 1]),
        }}>
          Tarotista · Vidente
        </div>

        <div style={{height: 18}} />

        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 34,
          color: C.muted,
          fontStyle: "italic",
          lineHeight: 1.4,
          opacity: interpolate(p3, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(p3, [0, 1], [20, 0])}px)`,
        }}>
          "Las cartas nunca mienten.<br />Tu destino está escrito."
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── ESCENA 3: SERVICIOS ───
const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  const pTitle = spring({fps, frame: frame - 15, from: 0, to: 1, config: {damping: 16, stiffness: 80}});

  const services = [
    {icon: "♥", label: "Amor & Relaciones", delay: 35},
    {icon: "✦", label: "Trabajo & Prosperidad", delay: 58},
    {icon: "◈", label: "Familia & Salud", delay: 80},
    {icon: "☽", label: "Guía Espiritual", delay: 102},
  ];

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <MysticBackground />
      <MysticOrb size={700} x="50%" y="50%" opacity={0.15} />

      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 64px",
      }}>
        {/* Título */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 56,
          fontWeight: 700,
          color: C.gold,
          textAlign: "center",
          marginBottom: 8,
          opacity: interpolate(pTitle, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(pTitle, [0, 1], [-20, 0])}px)`,
          textShadow: `0 0 20px rgba(212,168,67,0.5)`,
        }}>
          Tu destino habla.
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 48,
          color: C.white,
          textAlign: "center",
          marginBottom: 40,
          opacity: interpolate(pTitle, [0, 1], [0, 1]),
        }}>
          ¿Estás lista para escuchar?
        </div>

        <GoldLine delay={20} width={240} />
        <div style={{height: 40}} />

        {/* Lista servicios */}
        {services.map(({icon, label, delay}) => {
          const p = spring({fps, frame: frame - delay, from: 0, to: 1, config: {damping: 16, stiffness: 80}});
          return (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 24,
              marginBottom: 28, width: "100%",
              opacity: interpolate(p, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
            }}>
              <div style={{
                fontSize: 32, color: C.gold, minWidth: 44,
                textAlign: "center",
                filter: `drop-shadow(0 0 8px ${C.gold})`,
              }}>{icon}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 38, color: C.white,
                fontWeight: 300, letterSpacing: 1,
              }}>{label}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── ESCENA 4: CTA ───
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  const p1 = spring({fps, frame: frame - 10, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p2 = spring({fps, frame: frame - 30, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p3 = spring({fps, frame: frame - 55, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p4 = spring({fps, frame: frame - 78, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p5 = spring({fps, frame: frame - 105, from: 0, to: 1, config: {damping: 14, stiffness: 90}});

  const btnPulse = Math.sin(frame * 0.15) * 0.04 + 1;
  const glowPulse = Math.sin(frame * 0.12) * 0.4 + 0.6;

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <MysticBackground />
      <MysticOrb size={900} x="50%" y="40%" opacity={0.2} />

      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 64px",
      }}>
        {/* Símbolo */}
        <div style={{
          fontSize: 64, color: C.gold,
          filter: `drop-shadow(0 0 ${20 * glowPulse}px ${C.gold})`,
          marginBottom: 20,
          opacity: interpolate(p1, [0, 1], [0, 1]),
          transform: `scale(${interpolate(p1, [0, 1], [0.4, 1])})`,
        }}>✦</div>

        {/* Headline */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 74,
          fontWeight: 700,
          color: C.white,
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: 20,
          opacity: interpolate(p1, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(p1, [0, 1], [30, 0])}px)`,
          textShadow: `0 0 40px ${C.glow}`,
        }}>
          Tu consulta<br />te espera
        </div>

        {/* Línea */}
        <div style={{
          width: interpolate(p2, [0, 1], [0, 280]),
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          marginBottom: 36,
        }} />

        {/* Teléfonos */}
        <div style={{
          background: "rgba(45,10,78,0.5)",
          border: `1px solid rgba(212,168,67,0.35)`,
          borderRadius: 16,
          padding: "22px 52px",
          marginBottom: 24,
          opacity: interpolate(p2, [0, 1], [0, 1]),
          transform: `scale(${interpolate(p2, [0, 1], [0.85, 1])})`,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26, color: C.muted,
            letterSpacing: 3, textTransform: "uppercase", marginBottom: 10,
          }}>Llama ahora</div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 38, color: C.gold,
            fontWeight: 600, letterSpacing: 2, marginBottom: 6,
          }}>961 283 972</div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 38, color: C.gold,
            fontWeight: 600, letterSpacing: 2,
          }}>932 756 943</div>
        </div>

        {/* Botón CTA */}
        <div style={{
          background: `linear-gradient(135deg, ${C.gold}, #b8860b)`,
          borderRadius: 60,
          padding: "26px 70px",
          marginBottom: 28,
          opacity: interpolate(p3, [0, 1], [0, 1]),
          transform: `scale(${interpolate(p3, [0, 1], [0.8, 1]) * btnPulse})`,
          boxShadow: `0 0 ${40 * glowPulse}px rgba(212,168,67,0.5), 0 4px 20px rgba(0,0,0,0.5)`,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 36, fontWeight: 700,
            color: "#0d0118", letterSpacing: 1,
          }}>CONSULTA AHORA</div>
        </div>

        {/* Web */}
        <div style={{
          opacity: interpolate(p4, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(p4, [0, 1], [15, 0])}px)`,
          textAlign: "center", marginBottom: 24,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 28, color: C.muted, letterSpacing: 2,
          }}>videntesqueaciertan.com</div>
        </div>

        {/* Estrellas */}
        <div style={{
          opacity: interpolate(p5, [0, 1], [0, 1]),
          display: "flex", gap: 14, alignItems: "center",
        }}>
          {["★","★","★","★","★"].map((s, i) => (
            <div key={i} style={{
              fontSize: 32, color: C.gold,
              filter: `drop-shadow(0 0 6px ${C.gold})`,
            }}>{s}</div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSICIÓN PRINCIPAL ───
export const TarotAmandaReel: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* Escena 1: Hook — 0-3.5s */}
      <Sequence from={0} durationInFrames={105}>
        <MysticParticles count={35} />
        <SceneHook />
      </Sequence>

      {/* Escena 2: Amanda — 3-12s */}
      <Sequence from={90} durationInFrames={270}>
        <MysticParticles count={20} />
        <SceneAmanda />
      </Sequence>

      {/* Escena 3: Servicios — 12-20s */}
      <Sequence from={360} durationInFrames={240}>
        <MysticParticles count={25} />
        <SceneServices />
      </Sequence>

      {/* Escena 4: CTA — 20-30s */}
      <Sequence from={600} durationInFrames={300}>
        <MysticParticles count={40} />
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
