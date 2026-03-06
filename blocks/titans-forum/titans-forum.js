import Swiper from '../swiper/swiper-bundle.js';
import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  //   block.querySelector('div').classList.add('block-item');
  Array.from(block.children).forEach((item) => {
    item.classList.add('block-item');
    Array.from(item.children).forEach((child, i) => {
      child.classList.add(`block-child-${i + 1}`);
      Array.from(child.children).forEach((grandChild, j) => {
        grandChild.classList.add(`grand-child-${j + 1}`);
      });
    });
  });

  const blockItem = block.querySelectorAll('.block-item');
  blockItem.forEach((item) => {
    item.classList.add('swiper-slide');
    const children = Array.from(item.children);
    if (children.length > 1) {
      const contentWrap = document.createElement('div');
      contentWrap.classList.add('content-wrap');
      contentWrap.append(...children.slice(1));
      item.append(contentWrap);
    }
  });

  block.classList.add('swiper');
  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');
  blockItem.forEach((item) => swiperWrapper.append(item));
  block.append(swiperWrapper);
  const pagination = div({ class: 'swiper-pagination' });
  const nextBtn = div({ class: 'swiper-button-next' });
  const prevBtn = div({ class: 'swiper-button-prev' });
  const wrapBtn = div({ class: 'swiper-button-wrap' });
  wrapBtn.append(prevBtn, nextBtn)
  const wrapper = block.closest('.titans-forum-wrapper');
  wrapper.append(pagination, wrapBtn);


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
    navigation: {
        prevEl: wrapper.querySelector('.swiper-button-prev'),
        nextEl: wrapper.querySelector('.swiper-button-next'),
    },
  });
}
