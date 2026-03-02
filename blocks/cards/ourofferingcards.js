import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorateOurOfferingCards(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/ourofferingcards.css`);

  // Style the section heading area (default-content-wrapper above the block)
  const section = block.closest('.section');
  if (section) {
    section.classList.add('ourofferingcards-section');
    const dcw = section.querySelector('.default-content-wrapper');
    if (dcw) {
      dcw.classList.add('ourofferingcards-heading');
      // Add explicit classes instead of relying on :first-child / :nth-child
      const headingChildren = [...dcw.children];
      if (headingChildren[0]) headingChildren[0].classList.add('ourofferingcards-label');
      if (headingChildren[1]) headingChildren[1].classList.add('ourofferingcards-main-heading');
    }
  }

  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.classList.add('ourofferingcards-wrapper');

  rows.forEach((row) => {
    const card = document.createElement('div');
    card.classList.add('ourofferingcard');
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

      // Check if this column has a link (the "Know more" column)
      const anchor = col.querySelector('a');
      if (anchor) {
        col.classList.add('ourofferingcard-link');
        anchor.classList.add('ourofferingcard-know-more');
        contentDiv.append(col);
      } else {
        // Title or description — move children into text container
        while (col.firstChild) {
          const child = col.firstChild;
          // Add explicit classes for title and description
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
    wrapper.append(card);
  });

  // Optimize images
  wrapper.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(wrapper);
}
