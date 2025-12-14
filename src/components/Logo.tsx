interface LogoProps {
  className?: string;
  showResearch?: boolean;
}

export function Logo({ className = '', showResearch = false }: LogoProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className="text-2xl font-black tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 50%, #134e4a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        MADA
      </span>
      {showResearch && (
        <span
          className="text-xs font-bold tracking-[0.2em] -mt-1"
          style={{
            background: 'linear-gradient(90deg, #134e4a 0%, #881337 50%, #9f1239 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          RESEARCH
        </span>
      )}
    </div>
  );
}
