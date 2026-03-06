import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const GAP = 60; // gap between cards in initial stacked state (px)
const TOP_OFFSET = 40; // card-1 top offset inside sticky frame (px)
const SCROLL_MULTIPLIER = 2.5; // scroll comfort factor

/** Cubic ease in-out */
function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

export default function decorateOurOfferingCards(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/ourofferingcards.css`);

  // ── Section heading ──
  const section = block.closest('.section');
  if (section) {
    section.classList.add('ourofferingcards-section');
    const dcw = section.querySelector('.default-content-wrapper');
    if (dcw) {
      dcw.classList.add('ourofferingcards-heading');
      const headingChildren = [...dcw.children];
      if (headingChildren[0]) headingChildren[0].classList.add('ourofferingcards-label');
      if (headingChildren[1]) headingChildren[1].classList.add('ourofferingcards-main-heading');
    }
  }

  // ── Build card elements ──
  const rows = [...block.children];
  const cards = [];

  const stickyFrame = document.createElement('div');
  stickyFrame.classList.add('ourofferingcards-sticky-frame');

  rows.forEach((row, idx) => {
    const card = document.createElement('div');
    card.classList.add('ourofferingcard', `ourofferingcard-${idx + 1}`);
    card.style.zIndex = idx + 1;
    moveInstrumentation(row, card);

    const cols = [...row.children];

    // Column 1 — Image
    const imageDiv = cols.find((col) => col.querySelector('picture'));
    if (imageDiv) {
      imageDiv.className = 'ourofferingcard-image';
      card.append(imageDiv);
    }

    // Columns 2-4 — Content (title, description, link)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ourofferingcard-content';

    const textDiv = document.createElement('div');
    textDiv.className = 'ourofferingcard-text';

    let textChildIndex = 0;
    cols.forEach((col) => {
      if (col === imageDiv) return;

      const anchor = col.querySelector('a');
      if (anchor) {
        col.classList.add('ourofferingcard-link');
        anchor.classList.add('ourofferingcard-know-more');
        contentDiv.append(col);
      } else {
        while (col.firstChild) {
          const child = col.firstChild;
          if (child.nodeType === 1) {
            if (textChildIndex === 0) child.classList.add('ourofferingcard-title');
            else if (textChildIndex === 1) child.classList.add('ourofferingcard-desc');
            textChildIndex += 1;
          }
          textDiv.append(child);
        }
      }
    });

    contentDiv.prepend(textDiv);
    card.append(contentDiv);
    stickyFrame.append(card);
    cards.push(card);
  });

  // Optimize images
  stickyFrame.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // ── Stack section wrapper (provides scroll height) ──
  const stackSection = document.createElement('div');
  stackSection.classList.add('ourofferingcards-stack-section');
  stackSection.append(stickyFrame);

  block.replaceChildren(stackSection);

  // ── Scroll-driven stacking animation ──
  let cardH = 0;
  let startTops = [];
  let travelDist = 0;
  let scrollPerT = 0;

  function initPositions() {
    cardH = cards[0].offsetHeight;
    travelDist = cardH + GAP;
    scrollPerT = travelDist * SCROLL_MULTIPLIER;
    const totalNeeded = scrollPerT * (cards.length - 1);

    stackSection.style.height = `${totalNeeded + window.innerHeight * 0.5}px`;

    // Compute starting top for each card
    startTops = cards.map((_, i) => TOP_OFFSET + (cardH + GAP) * i);

    // Set initial positions
    cards.forEach((c, i) => {
      c.style.top = `${startTops[i]}px`;
    });
  }

  function updatePositions() {
    const scrolled = Math.max(0, -stackSection.getBoundingClientRect().top);

    // For each card after the first, compute its current top
    // Phase i-1: card[i] travels from startTops[i] to TOP_OFFSET
    // During earlier phases, it also follows previous cards moving up
    const currentTops = [TOP_OFFSET]; // card 0 never moves

    for (let i = 1; i < cards.length; i += 1) {
      // How much total offset from all previous phases pulling this card up
      let followOffset = 0;
      for (let p = 0; p < i - 1; p += 1) {
        const rawP = Math.min(1, Math.max(0, (scrolled - scrollPerT * p) / scrollPerT));
        followOffset += ease(rawP) * travelDist;
      }

      // This card's own phase
      const myPhaseStart = scrollPerT * (i - 1);
      const rawOwn = Math.min(1, Math.max(0, (scrolled - myPhaseStart) / scrollPerT));
      const ownTravel = ease(rawOwn) * (startTops[i] - followOffset - TOP_OFFSET);

      const top = startTops[i] - followOffset - ownTravel;
      cards[i].style.top = `${top}px`;
      currentTops.push(top);
    }
  }

  // Initialize after layout settles
  requestAnimationFrame(() => {
    initPositions();
    updatePositions();

    window.addEventListener('scroll', updatePositions, { passive: true });
    window.addEventListener('resize', () => {
      initPositions();
      updatePositions();
    });
  });
}
