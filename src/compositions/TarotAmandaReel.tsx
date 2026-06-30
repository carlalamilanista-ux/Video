import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import {loadDefaultFonts} from "../presets/fonts";

loadDefaultFonts();

// Colores místicos Amanda
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
    const x = ((seed * 23.7) % width);
    const y = ((seed * 41.3) % height);
    const speed = 0.3 + (i % 5) * 0.15;
    const size = 1.5 + (i % 4) * 1.2;
    const opacity = 0.2 + (i % 6) * 0.1;
    const offsetY = (frame * speed) % height;
    const twinkle = Math.sin((frame + i * 20) * 0.08) * 0.4 + 0.6;

    return {x, y: (y - offsetY + height) % height, size, opacity: opacity * twinkle};
  });

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 3 === 0 ? C.gold : C.white,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${i % 3 === 0 ? C.gold : C.muted}`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ─── Fondo gradiente místico animado ───
const MysticBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.02) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% ${30 + pulse * 20}%, #3b0764 0%, #1e0438 35%, #0d0118 70%)`,
      }}
    />
  );
};

// ─── Línea dorada decorativa ───
const GoldLine: React.FC<{delay?: number}> = ({delay = 0}) => {
  const frame = useCurrentFrame();
  const scaleX = interpolate(frame - delay, [0, 25], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <div
      style={{
        width: "180px",
        height: "1.5px",
        background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        transform: `scaleX(${scaleX})`,
        margin: "0 auto",
      }}
    />
  );
};

// ─── ESCENA 1: GANCHO (0-3s / 0-90f) ───
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress1 = spring({fps, frame, from: 0, to: 1, config: {damping: 18, stiffness: 80}});
  const progress2 = spring({fps, frame: frame - 20, from: 0, to: 1, config: {damping: 18, stiffness: 80}});
  const progress3 = spring({fps, frame: frame - 38, from: 0, to: 1, config: {damping: 18, stiffness: 80}});

  return (
    <AbsoluteFill style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      {/* Símbolo místico superior */}
      <div style={{
        fontSize: 72,
        opacity: interpolate(progress1, [0, 1], [0, 1]),
        transform: `scale(${interpolate(progress1, [0, 1], [0.5, 1])})`,
        filter: `drop-shadow(0 0 20px ${C.gold})`,
        marginBottom: 20,
        lineHeight: 1,
      }}>
        ✦
      </div>

      {/* Línea dorada */}
      <GoldLine delay={5} />

      <div style={{height: 28}} />

      {/* Texto principal hook */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 68,
        fontWeight: 700,
        color: C.white,
        textAlign: "center",
        lineHeight: 1.15,
        padding: "0 60px",
        opacity: interpolate(progress2, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(progress2, [0, 1], [30, 0])}px)`,
        textShadow: `0 0 40px ${C.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
      }}>
        ¿Las cartas<br />tienen un mensaje<br />para ti?
      </div>

      <div style={{height: 28}} />
      <GoldLine delay={40} />

      <div style={{height: 20}} />

      {/* Subtexto */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 32,
        color: C.muted,
        textAlign: "center",
        letterSpacing: 4,
        textTransform: "uppercase",
        opacity: interpolate(progress3, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(progress3, [0, 1], [20, 0])}px)`,
      }}>
        el tarot de amanda
      </div>
    </AbsoluteFill>
  );
};

// ─── ESCENA 2: AMANDA (3-12s / 90-360f) ───
const SceneAmanda: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const imgScale = interpolate(frame, [0, 180], [1.0, 1.08], {extrapolateRight: "clamp"});
  const fadeIn = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: "clamp"});

  const textProgress1 = spring({fps, frame: frame - 30, from: 0, to: 1, config: {damping: 16, stiffness: 70}});
  const textProgress2 = spring({fps, frame: frame - 55, from: 0, to: 1, config: {damping: 16, stiffness: 70}});
  const textProgress3 = spring({fps, frame: frame - 75, from: 0, to: 1, config: {damping: 16, stiffness: 70}});

  return (
    <AbsoluteFill>
      {/* Foto Amanda con Ken Burns */}
      <div style={{position: "absolute", inset: 0, overflow: "hidden", opacity: fadeIn}}>
        <Img
          src={staticFile("assets/amanda.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            transform: `scale(${imgScale})`,
            transformOrigin: "center top",
          }}
        />
        {/* Gradient overlay oscuro abajo para texto */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(13,1,24,0.2) 0%, rgba(13,1,24,0.0) 30%, rgba(13,1,24,0.7) 65%, rgba(13,1,24,0.97) 100%)",
        }} />
        {/* Glow púrpura en bordes */}
        <div style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 120px rgba(91,33,182,0.5)`,
        }} />
      </div>

      {/* Texto sobre foto */}
      <AbsoluteFill style={{justifyContent: "flex-end", padding: "0 60px 140px"}}>

        {/* Nombre */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 80,
          fontWeight: 700,
          color: C.white,
          lineHeight: 1,
          opacity: interpolate(textProgress1, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(textProgress1, [0, 1], [-40, 0])}px)`,
          textShadow: `0 0 30px ${C.glow}, 0 2px 8px rgba(0,0,0,0.9)`,
        }}>
          Amanda
        </div>

        <div style={{height: 12}} />

        {/* Línea dorada */}
        <div style={{
          width: interpolate(textProgress2, [0, 1], [0, 220]),
          height: 2,
          background: `linear-gradient(90deg, ${C.gold}, transparent)`,
          marginBottom: 16,
        }} />

        {/* Título */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 34,
          color: C.gold,
          letterSpacing: 3,
          textTransform: "uppercase",
          fontWeight: 300,
          opacity: interpolate(textProgress2, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(textProgress2, [0, 1], [-30, 0])}px)`,
        }}>
          Tarotista & Vidente
        </div>

        <div style={{height: 20}} />

        {/* Frase */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36,
          color: C.muted,
          fontStyle: "italic",
          lineHeight: 1.4,
          opacity: interpolate(textProgress3, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(textProgress3, [0, 1], [20, 0])}px)`,
        }}>
          "Descubre lo que las cartas<br />tienen reservado para ti"
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── ESCENA 3: CARTAS (12-20s / 360-600f) ───
const SceneCards: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  const imgScale = interpolate(frame, [0, 240], [1.05, 1.0], {extrapolateRight: "clamp"});

  const p1 = spring({fps, frame: frame - 20, from: 0, to: 1, config: {damping: 16, stiffness: 80}});
  const p2 = spring({fps, frame: frame - 45, from: 0, to: 1, config: {damping: 16, stiffness: 80}});
  const p3 = spring({fps, frame: frame - 65, from: 0, to: 1, config: {damping: 16, stiffness: 80}});
  const p4 = spring({fps, frame: frame - 85, from: 0, to: 1, config: {damping: 16, stiffness: 80}});

  return (
    <AbsoluteFill>
      {/* Foto cartas */}
      <div style={{position: "absolute", inset: 0, overflow: "hidden", opacity: fadeIn}}>
        <Img
          src={staticFile("assets/amanda-cartas.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transform: `scale(${imgScale})`,
          }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(13,1,24,0.85) 0%, rgba(13,1,24,0.3) 40%, rgba(13,1,24,0.6) 70%, rgba(13,1,24,0.97) 100%)",
        }} />
      </div>

      {/* Contenido */}
      <AbsoluteFill style={{padding: "100px 60px", justifyContent: "space-between"}}>

        {/* Título superior */}
        <div style={{textAlign: "center"}}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52,
            color: C.gold,
            fontWeight: 700,
            opacity: interpolate(p1, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(p1, [0, 1], [-20, 0])}px)`,
            textShadow: `0 0 20px rgba(212,168,67,0.6)`,
          }}>
            Tu destino habla.
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52,
            color: C.white,
            fontWeight: 700,
            opacity: interpolate(p1, [0, 1], [0, 1]),
          }}>
            ¿Estás lista para escuchar?
          </div>
        </div>

        {/* Servicios abajo */}
        <div>
          {[
            {icon: "♥", text: "Amor & Relaciones"},
            {icon: "✦", text: "Trabajo & Prosperidad"},
            {icon: "◈", text: "Familia & Salud"},
          ].map(({icon, text}, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 24,
                opacity: interpolate([p2, p3, p4][i], [0, 1], [0, 1]),
                transform: `translateX(${interpolate([p2, p3, p4][i], [0, 1], [-30, 0])}px)`,
              }}
            >
              <div style={{
                fontSize: 28,
                color: C.gold,
                filter: `drop-shadow(0 0 8px ${C.gold})`,
                minWidth: 36,
                textAlign: "center",
              }}>
                {icon}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 36,
                color: C.white,
                fontWeight: 300,
                letterSpacing: 1,
              }}>
                {text}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── ESCENA 4: CTA (20-30s / 600-900f) ───
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  const p1 = spring({fps, frame: frame - 15, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p2 = spring({fps, frame: frame - 35, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p3 = spring({fps, frame: frame - 55, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p4 = spring({fps, frame: frame - 75, from: 0, to: 1, config: {damping: 14, stiffness: 90}});
  const p5 = spring({fps, frame: frame - 100, from: 0, to: 1, config: {damping: 14, stiffness: 90}});

  const btnPulse = Math.sin(frame * 0.15) * 0.08 + 1;
  const glowPulse = Math.sin(frame * 0.12) * 0.4 + 0.6;

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      {/* Fondo con vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, #3b0764 0%, #1e0438 40%, #0d0118 80%)`,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
        gap: 0,
      }}>

        {/* Símbolo */}
        <div style={{
          fontSize: 60,
          color: C.gold,
          filter: `drop-shadow(0 0 ${20 * glowPulse}px ${C.gold})`,
          marginBottom: 24,
          opacity: interpolate(p1, [0, 1], [0, 1]),
          transform: `scale(${interpolate(p1, [0, 1], [0.5, 1])})`,
        }}>
          ✦
        </div>

        {/* Headline CTA */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 72,
          fontWeight: 700,
          color: C.white,
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: 16,
          opacity: interpolate(p1, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(p1, [0, 1], [30, 0])}px)`,
          textShadow: `0 0 40px ${C.glow}`,
        }}>
          Tu consulta<br />te espera
        </div>

        {/* Línea */}
        <div style={{
          width: interpolate(p2, [0, 1], [0, 260]),
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          marginBottom: 32,
        }} />

        {/* Teléfono badge */}
        <div style={{
          background: `rgba(91,33,182,0.35)`,
          border: `1px solid rgba(212,168,67,0.4)`,
          borderRadius: 16,
          padding: "20px 48px",
          marginBottom: 20,
          opacity: interpolate(p2, [0, 1], [0, 1]),
          transform: `scale(${interpolate(p2, [0, 1], [0.85, 1])})`,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 30,
            color: C.muted,
            textAlign: "center",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}>
            Lectura por teléfono
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            color: C.gold,
            textAlign: "center",
            letterSpacing: 1,
          }}>
            Confidencial · Precisa · Reveladora
          </div>
        </div>

        {/* Botón CTA */}
        <div style={{
          background: `linear-gradient(135deg, ${C.gold}, #b8860b)`,
          borderRadius: 60,
          padding: "28px 72px",
          marginBottom: 32,
          opacity: interpolate(p3, [0, 1], [0, 1]),
          transform: `scale(${interpolate(p3, [0, 1], [0.8, 1]) * btnPulse})`,
          boxShadow: `0 0 ${40 * glowPulse}px rgba(212,168,67,0.5), 0 4px 20px rgba(0,0,0,0.5)`,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 38,
            fontWeight: 700,
            color: "#0d0118",
            textAlign: "center",
            letterSpacing: 1,
          }}>
            CONSULTA AHORA
          </div>
        </div>

        {/* Web */}
        <div style={{
          opacity: interpolate(p4, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(p4, [0, 1], [15, 0])}px)`,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 30,
            color: C.muted,
            letterSpacing: 2,
          }}>
            eltarotdeamanda.com
          </div>
        </div>

        {/* Estrellas finales */}
        <div style={{
          marginTop: 32,
          opacity: interpolate(p5, [0, 1], [0, 1]),
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}>
          {["★", "★", "★", "★", "★"].map((s, i) => (
            <div key={i} style={{
              fontSize: 30,
              color: C.gold,
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

      {/* Escena 1: Hook (0-100f) */}
      <Sequence from={0} durationInFrames={100}>
        <MysticBackground />
        <MysticParticles count={35} />
        <SceneHook />
      </Sequence>

      {/* Escena 2: Amanda (90-370f) */}
      <Sequence from={90} durationInFrames={280}>
        <MysticParticles count={20} />
        <SceneAmanda />
      </Sequence>

      {/* Escena 3: Cartas (360-610f) */}
      <Sequence from={360} durationInFrames={250}>
        <MysticParticles count={25} />
        <SceneCards />
      </Sequence>

      {/* Escena 4: CTA (600-900f) */}
      <Sequence from={600} durationInFrames={300}>
        <MysticBackground />
        <MysticParticles count={40} />
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
