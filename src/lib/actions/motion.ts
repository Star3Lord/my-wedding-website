import { animate, stagger, type AnimationPlaybackControlsWithThen } from 'motion';
import type { Attachment } from 'svelte/attachments';

export type Direction = 'next' | 'prev';

export interface StaggerRevealParams {
  /** Which children to animate. */
  selector?: string;
  /** Optional initial delay (seconds). */
  delay?: number;
}

/**
 * Attachment: Staggers children from top → bottom with a soft blur → crisp reveal.
 * Usage: {@attach staggerReveal({ selector, delay })}
 */
export function staggerReveal(params: StaggerRevealParams = {}): Attachment<HTMLElement> {
  return (node) => {
    const selector = params.selector ?? '[data-motion]';
    const targets = Array.from(node.querySelectorAll<HTMLElement>(selector));

    let controls: AnimationPlaybackControlsWithThen | undefined;

    if (targets.length > 0) {
      controls = animate(
        targets,
        { opacity: [0, 1], y: [14, 0], filter: ['blur(10px)', 'blur(0px)'] },
        {
          delay: stagger(0.07, { startDelay: params.delay ?? 0 }),
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }
      );
    }

    // Cleanup function
    return () => {
      controls?.cancel();
    };
  };
}

export interface DetailsCardEnterParams {
  direction?: Direction;
  /** Selector for staggered children inside the card. */
  selector?: string;
}

/**
 * Attachment: Coordinated card entrance (container + staggered text) for the details page.
 * Usage: {@attach detailsCardEnter({ direction })}
 */
export function detailsCardEnter(params: DetailsCardEnterParams = {}): Attachment<HTMLElement> {
  return (node) => {
    const dir = params.direction ?? 'next';
    const fromX = dir === 'next' ? 26 : -26;
    const selector = params.selector ?? '[data-motion]';
    const targets = Array.from(node.querySelectorAll<HTMLElement>(selector));

    // Container + text reveal are coordinated via an animation sequence.
    const controls = animate([
      [
        node,
        { opacity: [0, 1], y: [10, 0], x: [fromX, 0], scale: [0.985, 1] },
        { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      ],
      [
        targets,
        { opacity: [0, 1], y: [14, 0], filter: ['blur(10px)', 'blur(0px)'] },
        {
          at: 0.08,
          delay: stagger(0.07),
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        },
      ],
    ]);

    // Cleanup function
    return () => {
      controls?.cancel();
    };
  };
}
