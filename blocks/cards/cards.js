import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import decoratecardwithimgs from './cardswithimg.js';
import decorateOurOfferingCards from './ourofferingcards.js';
import Swiper from '../swiper/swiper-bundle.js';
import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  if (block.classList.contains('cardswithimg')) {
    decoratecardwithimgs(block);
    return;
  }

  if (block.classList.contains('ourofferingcards')) {
    decorateOurOfferingCards(block);
    return;
  }
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) { div.className = 'cards-card-image'; } else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);

  if (block.closest('.our-key-differences')) {
    const ulWrap = block.querySelector('ul');
    ulWrap.classList.add('key-differences-cards');
    Array.from(ulWrap.children).forEach((child) => {
      child.classList.add('key-list');
    });

    const keyCardsImg = block.querySelectorAll('.key-list .cards-card-image');
    keyCardsImg.forEach((item) => {
      item.querySelector('picture').classList.add('key-picture');
      item.querySelector('img').classList.add('key-image');
    });
    const keyCardsBody = block.querySelectorAll('.key-list .cards-card-body');
    keyCardsBody.forEach((item) => {
      Array.from(item.children).forEach((child, ind) => {
        child.classList.add(`key-text-${ind + 1}`);
      });
    });

    // Swiper start
    block.classList.add('swiper');
    block.querySelector('ul').classList.add('swiper-wrapper');
    block.querySelectorAll('li').forEach((li) => li.classList.add('swiper-slide'));
    const pagination = div({ class: 'swiper-pagination' });
    const wrapper = block.closest('.cards-wrapper');
    wrapper.append(pagination);

    const swiperInstance = Swiper(block, {
      loop: true,
      // autoplay: {
      //   delay: 5000,
      //   disableOnInteraction: false,
      // },
      pagination: {
        el: wrapper.querySelector('.swiper-pagination'),
        clickable: true,
      },
    });
  }
}
