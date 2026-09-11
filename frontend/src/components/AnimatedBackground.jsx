export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid */}
      <div className="absolute inset-0 animated-grid opacity-40" />

      {/* Floating orbs */}
      <div className="orb orb-blue animate-drift"
        style={{ width: 320, height: 320, top: '10%', left: '5%' }} />
      <div className="orb orb-purple animate-drift-slow"
        style={{ width: 380, height: 380, top: '50%', right: '10%' }} />
      <div className="orb orb-cyan animate-drift"
        style={{ width: 280, height: 280, bottom: '15%', left: '25%', animationDelay: '5s' }} />
      <div className="orb orb-emerald animate-drift-slow"
        style={{ width: 240, height: 240, top: '20%', right: '35%', animationDelay: '8s' }} />

      {/* Floating particles */}
      {[
        { size: 4, top: '15%', left: '20%', delay: '0s', duration: '4s' },
        { size: 6, top: '35%', left: '70%', delay: '1s', duration: '5s' },
        { size: 3, top: '60%', left: '15%', delay: '2s', duration: '6s' },
        { size: 5, top: '75%', left: '80%', delay: '0.5s', duration: '4.5s' },
        { size: 4, top: '25%', left: '50%', delay: '3s', duration: '5.5s' },
        { size: 5, top: '80%', left: '45%', delay: '1.5s', duration: '4.2s' },
      ].map((p, i) => (
        <div
          key={i}
          className="particle animate-float-medium"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)'
          }}
        />
      ))}
    </div>
  );
}