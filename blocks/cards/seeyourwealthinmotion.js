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

  const rows = [...block.children];
  const totalSlides = rows.length;

  // ── Static header: extract heading + subtitle from first row's first col ──
  const staticHeader = document.createElement('div');
  staticHeader.classList.add('sywim-static-header');

  const firstCol = rows[0]?.querySelector('div');
  if (firstCol) {
    const heading = firstCol.querySelector('h1, h2, h3');
    const subtitle = firstCol.querySelector('p');
    if (heading) staticHeader.append(heading.cloneNode(true));
    if (subtitle) staticHeader.append(subtitle.cloneNode(true));
  }

  // ── Build Swiper: only input + button per slide ──
  const swiperEl = document.createElement('div');
  swiperEl.classList.add('swiper', 'sywim-swiper');

  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('swiper-wrapper');

  rows.forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide', 'sywim-slide');
    moveInstrumentation(row, slide);

    const formArea = document.createElement('div');
    formArea.classList.add('sywim-form-area');

    const cols = [...row.children];
    const textCol = cols[0]; // has h2, subtitle p, "enter Pan" p
    const btnCol = cols[1]; // has button

    if (textCol) {
      // All <p> elements — first is subtitle (already in static header), rest become inputs
      const paragraphs = [...textCol.querySelectorAll('p')];
      const inputParagraphs = paragraphs.slice(1); // skip subtitle

      inputParagraphs.forEach((p) => {
        const placeholderText = p.textContent.trim();
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'sywim-input';
        input.placeholder = placeholderText;
        input.setAttribute('aria-label', placeholderText);
        formArea.append(input);
      });
    }

    if (btnCol) {
      btnCol.querySelectorAll('a').forEach((a) => {
        a.classList.add('sywim-btn');
      });
      const btnContainer = btnCol.querySelector('.button-container') || btnCol;
      formArea.append(btnContainer);
    }

    slide.append(formArea);
    wrapperEl.append(slide);
  });

  swiperEl.append(wrapperEl);

  // ── Bottom bar: pagination dots + fraction counter ──
  const bottomBar = document.createElement('div');
  bottomBar.classList.add('sywim-bottom-bar');

  const paginationDots = document.createElement('div');
  paginationDots.classList.add('swiper-pagination', 'sywim-pagination');

  const fractionCounter = document.createElement('div');
  fractionCounter.classList.add('sywim-fraction');
  fractionCounter.innerHTML = `<span class="sywim-fraction-current">1</span>/<span class="sywim-fraction-total">${totalSlides}</span>`;

  bottomBar.append(paginationDots, fractionCounter);
  swiperEl.append(bottomBar);

  // ── Assemble: static header on top, swiper below ──
  block.replaceChildren(staticHeader, swiperEl);

  // ── Init Swiper — no touch swipe, only via Next button ──
  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    allowTouchMove: false,
    pagination: {
      el: paginationDots,
      clickable: false,
    },
    on: {
      slideChange(s) {
        const currentEl = fractionCounter.querySelector('.sywim-fraction-current');
        if (currentEl) currentEl.textContent = s.activeIndex + 1;
      },
    },
  });

  // ── "Next" buttons advance the swiper ──
  swiperEl.querySelectorAll('.sywim-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      swiper.slideNext();
    });
  });

  return swiper;
}
