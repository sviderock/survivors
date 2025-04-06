import { createSignal, onCleanup, onMount } from 'solid-js';

export default function FPSCounter() {
  const [fps, setFps] = createSignal(0);
  let interval: NodeJS.Timeout;

  onMount(() => {
    interval = setInterval(() => {
      let prevTime = Date.now();
      let frames = 0;

      function loop() {
        const time = Date.now();
        frames++;
        if (time > prevTime + 1000) {
          const storedFps = Math.round((frames * 1000) / (time - prevTime));
          prevTime = time;
          frames = 0;
          setFps(storedFps);
        }

        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return <span class="fixed top-0 left-2 text-base">{fps()} FPS</span>;
}
