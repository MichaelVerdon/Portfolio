import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from '../motion/gsap';
import { isSceneId } from './chapters';
import { sceneBus } from './sceneBus';

/**
 * Elements marked `data-scene="<chapter>"` switch the 3D scene to that
 * chapter while they cross the middle of the screen. Does nothing when
 * there is no 3D for this visitor.
 */
export function useSceneTriggers(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const scope = root.current;
    if (!scope || sceneBus.getStatus() === 'off') return;

    const triggers = Array.from(scope.querySelectorAll<HTMLElement>('[data-scene]')).flatMap((el) => {
      const id = el.dataset.scene;
      if (!isSceneId(id)) return [];
      return [
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) sceneBus.setChapter(id);
          },
        }),
      ];
    });
    return () => triggers.forEach((t) => t.kill());
  }, [root]);
}
