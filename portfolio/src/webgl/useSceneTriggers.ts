import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "../motion/gsap";
import { isSceneId, type SceneId } from "./chapters";
import { sceneBus } from "./sceneBus";

/**
 * Elements marked `data-scene="<chapter>"` switch the 3D scene to that
 * chapter while they cross the middle of the screen. An optional
 * `data-scene-logo` shows that logo instead of the chapter's shape. Does nothing when
 * there is no 3D for this visitor.
 */
export function useSceneTriggers(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const scope = root.current;
    if (!scope || sceneBus.getStatus() === "off") return;

    const entries: { id: SceneId; logo?: string; trigger: ScrollTrigger }[] =
      [];
    // After any change, the last active trigger in page order wins, so a
    // fast jump past several sections still lands on the right chapter.
    const pick = () => {
      const active = entries.filter((e) => e.trigger.isActive).pop();
      if (active) sceneBus.setChapter(active.id, active.logo);
    };
    Array.from(scope.querySelectorAll<HTMLElement>("[data-scene]")).forEach(
      (el) => {
        const id = el.dataset.scene;
        if (!isSceneId(id)) return;
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: pick,
        });
        entries.push({ id, logo: el.dataset.sceneLogo, trigger });
      },
    );
    const triggers = entries.map((e) => e.trigger);
    return () => triggers.forEach((t) => t.kill());
  }, [root]);
}
