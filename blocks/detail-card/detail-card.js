import { setClassPrefixes, addIndexed } from '../../scripts/constant.js';
import Swiper from '../swiper/swiper-bundle.js';

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

  // Common Button Row Down
  const btnRowDwn = block.closest('.btn-row-dwn');
  if (btnRowDwn) {
    const divWrapper = document.createElement('div');
    divWrapper.classList.add('detail-card-btn-wrapper');
    Array.from(btnRowDwn.children).forEach((child) => {
      divWrapper.appendChild(child);
    });
    btnRowDwn.appendChild(divWrapper);

  }

  // Detail Card Swiper For Mobile
  if (block.classList.contains('card-swiper-short') && window.matchMedia('(max-width: 768px)').matches) {
    block.style.backgroundColor = 'red';
    block.classList.add('swiper');
    const swiperWrapper = document.createElement('div');
    swiperWrapper.classList.add('swiper-wrapper');
    Array.from(block.children).forEach((child) => {
      child.classList.add('swiper-slide');
      swiperWrapper.appendChild(child);
    });
    block.appendChild(swiperWrapper);

    const swiperInstance = Swiper(block, {
      loop: true,
      // observer: true,
      // observeParents: true,
      // autoplay: {
      //   delay: 1200,
      //   disableOnInteraction: false,
      // },
      // pagination: {
      //   el: wrapper.querySelector('.swiper-pagination'),
      //   clickable: true,
      // },
    });
  }

  // Landing page Explore Alpha Strategist
  const exploreAlphaStrategy = block.closest('.explr-alpha-strategy');
  if (exploreAlphaStrategy) {
    setClassPrefixes(['alpha-list-', 'alpha-item-', 'alpha-sublist-', 'alpha-innerlist-']);
    addIndexed(exploreAlphaStrategy.querySelector('.default-content-wrapper'));
  }
}
