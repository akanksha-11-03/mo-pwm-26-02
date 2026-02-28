import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Load Swiper library dynamically (ES module from scripts/swiper/).
 * Returns the Swiper constructor.
 */
async function loadSwiper() {
  loadCSS(`${window.hlx.codeBasePath}/scripts/swiper/swiper-bundle.min.css`);
  const { default: Swiper } = await import('../../scripts/swiper/swiper-bundle.min.js');
  return Swiper;
}

export default async function decoratecardwithimgs(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cardswithimg.css`);

  const Swiper = await loadSwiper();

  // Build Swiper DOM structure
  const swiperEl = document.createElement('div');
  swiperEl.classList.add('swiper', 'cardswithimg-swiper');

  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('swiper-wrapper');

  // Each row from AEM becomes a slide
  [...block.children].forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    moveInstrumentation(row, slide);

    // Separate image from body content
    while (row.firstElementChild) {
      const col = row.firstElementChild;
      if (col.children.length === 1 && col.querySelector('picture')) {
        col.className = 'cardswithimg-card-image';
      } else {
        col.className = 'cardswithimg-card-body';
      }
      slide.append(col);
    }
    wrapperEl.append(slide);
  });

  swiperEl.append(wrapperEl);

  // Navigation arrows
  const prevBtn = document.createElement('div');
  prevBtn.classList.add('swiper-button-prev');
  const nextBtn = document.createElement('div');
  nextBtn.classList.add('swiper-button-next');
  swiperEl.append(prevBtn, nextBtn);

  // Pagination dots
  const pagination = document.createElement('div');
  pagination.classList.add('swiper-pagination');
  swiperEl.append(pagination);

  // Replace block content
  block.replaceChildren(swiperEl);

  // Optimize images
  swiperEl.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  // Initialize Swiper
  // eslint-disable-next-line no-new
  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    pagination: {
      el: pagination,
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 32 },
    },
  });
}