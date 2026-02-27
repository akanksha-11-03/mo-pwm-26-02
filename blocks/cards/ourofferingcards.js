import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorateOurOfferingCards(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/ourofferingcards.css`);

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
          textDiv.append(col.firstChild);
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
