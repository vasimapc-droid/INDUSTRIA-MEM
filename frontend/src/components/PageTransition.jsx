import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    setTransitionStage('exit');
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('enter');
    }, 150); // must match animation duration
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      className={
        'w-full h-full transition-all duration-200 ease-out ' +
        (transitionStage === 'enter'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2')
      }>
      {displayChildren}
    </div>
  );
}