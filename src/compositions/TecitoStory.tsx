import React, {useEffect} from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadDefaultFonts} from "../presets/fonts";

const ACCENT = "#c81e3a";

const INGREDIENTS = [
  {emoji: "🍓", name: "Frambuesa", detail: "Antioxidante y calmante natural."},
  {emoji: "🌺", name: "Hibisco", detail: "Rico en vitamina C, aliado de la garganta."},
  {emoji: "🍯", name: "Miel pura", detail: "Calma y protege de forma natural."},
  {emoji: "🫚", name: "Jengibre fresco", detail: "Antiinflamatorio, ayuda a la circulación."},
  {emoji: "🍋", name: "Limón", detail: "Aporta vitamina C y equilibrio."},
];

const Row: React.FC<{
  emoji: string;
  name: string;
  detail: string;
  delay: number;
}> = ({emoji, name, detail, delay}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const opacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(local, [0, 12], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        opacity,
        transform: `translateX(${x}px)`,
        padding: "10px 0",
      }}
    >
      <div style={{fontSize: 34, lineHeight: 1, marginTop: 2}}>{emoji}</div>
      <div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 30,
            color: ACCENT,
            marginBottom: 2,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 24,
            color: "rgba(30,20,20,0.82)",
            lineHeight: 1.25,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
};

export const TecitoStory: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  useEffect(() => {
    loadDefaultFonts();
  }, []);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 15], [14, 0], {
    extrapolateRight: "clamp",
  });

  const cardOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [8, 22], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const footerDelay = 20 + INGREDIENTS.length * 6 + 10;
  const footerOpacity = interpolate(
    frame,
    [footerDelay, footerDelay + 12],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <Img
        src={staticFile("assets/tecito-cropped.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 35%",
        }}
      />

      {/* soft top gradient for title legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 32%)",
        }}
      />

      {/* soft bottom gradient behind the recipe card */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.0) 42%)",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 60,
          right: 60,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: 52,
            color: "#ffffff",
            letterSpacing: -0.5,
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          mi tecito para la voz 🍵
        </div>
        <div
          style={{
            marginTop: 10,
            width: 84,
            height: 5,
            borderRadius: 3,
            backgroundColor: ACCENT,
          }}
        />
      </div>

      {/* Recipe card */}
      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          bottom: 130,
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
          backgroundColor: "rgba(255,250,248,0.94)",
          borderRadius: 28,
          padding: "34px 36px 26px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {INGREDIENTS.map((ing, i) => (
          <Row key={ing.name} {...ing} delay={20 + i * 6} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 46,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: footerOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: 24,
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          hecho en casa, con cariño
        </span>
      </div>
    </AbsoluteFill>
  );
};
