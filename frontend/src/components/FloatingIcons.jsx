import { Factory, Cog, Bot, Wrench, HardHat, Activity, Cpu, Zap } from 'lucide-react';

// Positioned along the edges to avoid blocking text in the center
const icons = [
  // Top-left cluster
  { Icon: Factory,  top: '8%',  left: '4%',  size: 22, delay: '0s',   duration: '7s',  color: 'text-blue-400/70' },
  { Icon: Cog,      top: '15%', right: '8%', size: 20, delay: '1s',   duration: '6s',  color: 'text-purple-400/70' },

  // Left edge
  { Icon: Bot,      top: '40%', left: '3%',  size: 22, delay: '2s',   duration: '8s',  color: 'text-cyan-400/70' },
  { Icon: Wrench,   top: '60%', left: '6%',  size: 18, delay: '0.5s', duration: '6.5s', color: 'text-emerald-400/70' },

  // Right edge
  { Icon: HardHat,  top: '35%', right: '3%', size: 22, delay: '1.5s', duration: '7s',  color: 'text-amber-400/70' },
  { Icon: Activity, top: '65%', right: '6%', size: 20, delay: '3s',   duration: '5.5s', color: 'text-rose-400/70' },

  // Bottom edges
  { Icon: Cpu,      top: '82%', left: '15%', size: 18, delay: '2.5s', duration: '6.8s', color: 'text-indigo-400/70' },
  { Icon: Zap,      top: '78%', right: '20%', size: 20, delay: '1s',   duration: '7.5s', color: 'text-yellow-400/70' },
];

export default function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map(({ Icon, top, left, right, size, delay, duration, color }, i) => (
        <div
          key={i}
          className="float-icon absolute animate-float-slow"
          style={{
            top, left, right,
            width: size * 2.2,
            height: size * 2.2,
            animationDelay: delay,
            animationDuration: duration
          }}>
          <Icon size={size} className={color} strokeWidth={1.5} />
        </div>
      ))}
    </div>
  );
}