import { loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Load Swiper library dynamically.
 */
async function loadSwiper() {
  loadCSS(`${window.hlx.codeBasePath}/scripts/swiper/swiper-bundle.min.css`);
  const { default: Swiper } = await import('../../scripts/swiper/swiper-bundle.min.js');
  return Swiper;
}

export default async function decorateSeeyourwealthinmotion(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/seeyourwealthinmotion.css`);

  const Swiper = await loadSwiper();

  const totalSlides = block.children.length;

  const swiperEl = document.createElement('div');
  swiperEl.classList.add('swiper', 'sywim-swiper');

  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('swiper-wrapper');

  [...block.children].forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide', 'sywim-slide');
    moveInstrumentation(row, slide);

    // Each row has one column with rich text + button
    while (row.firstElementChild) {
      const col = row.firstElementChild;
      col.className = 'sywim-card-body';

      // Find all links/buttons and style them
      col.querySelectorAll('a').forEach((a) => {
        a.classList.add('sywim-btn');
      });

      slide.append(col);
    }

    wrapperEl.append(slide);
  });

  swiperEl.append(wrapperEl);

  // Bottom bar: pagination dots (left) + fraction counter (right)
  const bottomBar = document.createElement('div');
  bottomBar.classList.add('sywim-bottom-bar');

  const paginationDots = document.createElement('div');
  paginationDots.classList.add('swiper-pagination', 'sywim-pagination');

  const fractionCounter = document.createElement('div');
  fractionCounter.classList.add('sywim-fraction');
  fractionCounter.innerHTML = `<span class="sywim-fraction-current">1</span>/<span class="sywim-fraction-total">${totalSlides}</span>`;

  bottomBar.append(paginationDots, fractionCounter);
  swiperEl.append(bottomBar);

  block.replaceChildren(swiperEl);

  // Initialize Swiper
  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    pagination: {
      el: paginationDots,
      clickable: true,
    },
    on: {
      slideChange(s) {
        const currentEl = fractionCounter.querySelector('.sywim-fraction-current');
        if (currentEl) currentEl.textContent = s.activeIndex + 1;
      },
    },
  });

  return swiper;
}
