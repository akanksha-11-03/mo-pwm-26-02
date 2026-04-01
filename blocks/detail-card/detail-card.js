import { setClassPrefixes, addIndexed } from '../../scripts/constant.js';

export default function decorate(block) {
  setClassPrefixes(['detail-content', 'detail-card-item-', 'content-', 'inner-content-', 'inner-item-']);
  addIndexed(block);

  Array.from(block.children).forEach((child) => {
    child.classList.add('detail-content');
  });

  const eachCard = block.querySelectorAll('.detail-content');
  eachCard.forEach((card) => {
    const cardFirstItem = card.querySelector('.detail-card-item-1');
    const cardContent = cardFirstItem.querySelector('.content-1');
    const cardPicture = cardFirstItem.querySelector('picture');
    if (!cardPicture) {
      cardFirstItem.remove();
    };
    const cardLink = cardFirstItem.querySelector('a');
    if (!cardLink) return;
    const redirectURL = cardLink.getAttribute('href');
    if (!redirectURL) return;
    const anchor = document.createElement('a');
    anchor.setAttribute('href', redirectURL);
    anchor.classList.add('card-link');
    anchor.appendChild(cardContent);
    cardFirstItem.appendChild(anchor);
    cardFirstItem.querySelector('.content-2')?.remove();
  });
}
