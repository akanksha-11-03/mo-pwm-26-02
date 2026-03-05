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

  // ── Static header: extract heading + subtitle from first row ──
  const staticHeader = document.createElement('div');
  staticHeader.classList.add('sywim-static-header');

  // Find the first row that contains a heading
  const headerRow = rows.find((row) => row.querySelector('h1, h2, h3'));
  if (headerRow) {
    const heading = headerRow.querySelector('h1, h2, h3');
    // Subtitle is the <p> immediately after the heading
    const subtitle = heading?.nextElementSibling?.tagName === 'P'
      ? heading.nextElementSibling
      : headerRow.querySelector('p');
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

    // Add explicit classes to columns instead of using index
    [...row.children].forEach((col) => {
      if (col.querySelector('.button-container') || col.querySelector('a.button')) {
        col.classList.add('sywim-btn-col');
      } else {
        col.classList.add('sywim-text-col');
      }
    });

    const textCol = row.querySelector('.sywim-text-col');
    const btnCol = row.querySelector('.sywim-btn-col');

    if (textCol) {
      // Add explicit classes to children instead of using index/slice
      const heading = textCol.querySelector('h1, h2, h3');
      if (heading) heading.classList.add('sywim-heading');

      [...textCol.querySelectorAll('p')].forEach((p) => {
        // First <p> is subtitle (already in static header), rest are input placeholders
        if (!p.classList.contains('sywim-subtitle')) {
          // Check if this is the subtitle (matches the static header subtitle text)
          const isSubtitle = heading && heading.nextElementSibling === p;
          if (isSubtitle) {
            p.classList.add('sywim-subtitle');
          } else {
            p.classList.add('sywim-input-source');
          }
        }
      });

      // Convert all sywim-input-source paragraphs into real input fields
      textCol.querySelectorAll('.sywim-input-source').forEach((p) => {
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
