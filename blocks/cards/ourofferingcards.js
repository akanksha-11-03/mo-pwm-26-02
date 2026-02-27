import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorateOurOfferingCards(block) {
  const cards = [...block.children];
  const container = document.createElement('div');
  container.classList.add('ourofferingcards-wrapper');

  cards.forEach((row) => {
    const card = document.createElement('div');
    card.classList.add('ourofferingcard');
    moveInstrumentation(row, card);

    const children = [...row.children];
    children.forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'ourofferingcard-image';
      } else {
        div.className = 'ourofferingcard-content';

        // Wrap title and description in a container
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('ourofferingcard-text');

        // Find link and separate it from the rest
        const allChildren = [...div.children];
        const linkParagraph = allChildren.find((el) => el.querySelector('a'));

        allChildren.forEach((el) => {
          if (el !== linkParagraph) {
            contentContainer.append(el);
          }
        });

        div.prepend(contentContainer);

        // Style the link
        if (linkParagraph) {
          linkParagraph.classList.add('ourofferingcard-link');
          const anchor = linkParagraph.querySelector('a');
          if (anchor) {
            anchor.classList.add('ourofferingcard-know-more');
          }
          div.append(linkParagraph);
        }
      }
      card.append(div);
    });

    container.append(card);
  });

  // Optimize images
  container.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(container);
}
