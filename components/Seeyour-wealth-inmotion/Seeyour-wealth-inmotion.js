import { loadCSS } from '../../scripts/aem.js';

async function loadSwiper() {
  loadCSS(`${window.hlx.codeBasePath}/scripts/swiper/swiper-bundle.min.css`);
  const { default: Swiper } = await import('../../scripts/swiper/swiper-bundle.min.js');
  return Swiper;
}

function buildSlide(li, subtitle, buttonLink) {
  const slide = document.createElement('div');
  slide.className = 'swiper-slide';

  /* Subtitle + input group */
  const inputGroup = document.createElement('div');
  inputGroup.className = 'sywim-input-group';

  if (subtitle) {
    const sub = subtitle.cloneNode(true);
    sub.className = 'sywim-subtitle';
    inputGroup.appendChild(sub);
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'sywim-input';
  input.placeholder = li.textContent.trim();
  inputGroup.appendChild(input);
  slide.appendChild(inputGroup);

  /* Button + pagination group */
  const ctaGroup = document.createElement('div');
  ctaGroup.className = 'sywim-cta-group';

  if (buttonLink) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sywim-btn';
    btn.textContent = buttonLink.textContent.trim();
    ctaGroup.appendChild(btn);
  }

  const paginationRow = document.createElement('div');
  paginationRow.className = 'sywim-pagination-row';

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'sywim-dots';
  paginationRow.appendChild(dotsContainer);

  const fraction = document.createElement('span');
  fraction.className = 'sywim-fraction';
  paginationRow.appendChild(fraction);

  ctaGroup.appendChild(paginationRow);
  slide.appendChild(ctaGroup);

  return slide;
}

function renderPagination(container, totalSlides, activeIndex) {
  container.querySelectorAll('.swiper-slide').forEach((slide) => {
    const dots = slide.querySelector('.sywim-dots');
    const frac = slide.querySelector('.sywim-fraction');
    if (dots) {
      dots.innerHTML = '';
      Array.from({ length: totalSlides }).forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'sywim-dot';
        if (i === activeIndex) dot.classList.add('sywim-dot-active');
        dots.appendChild(dot);
      });
    }
    if (frac) {
      frac.innerHTML = `<span class="sywim-frac-current">${activeIndex + 1}</span>/<span class="sywim-frac-total">${totalSlides}</span>`;
    }
  });
}

async function decorateSection(section) {
  const wrapper = section.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  /* ── Extract authored content ── */
  const heading = wrapper.querySelector('h1, h2, h3, h4, h5, h6');
  const subtitle = wrapper.querySelector('p:not(.button-container)');
  // linkToBtn converts <ul> → <div class="divwithlinks">, so query both
  const listItems = wrapper.querySelectorAll('.divwithlinks li, ul li');
  const buttonContainer = wrapper.querySelector('.button-container');
  const buttonLink = buttonContainer
    ? buttonContainer.querySelector('a')
    : null;

  if (!listItems.length) return;
  const totalSlides = listItems.length;

  /* ── Build card container ── */
  const card = document.createElement('div');
  card.className = 'sywim-card';

  /* Heading (static, outside swiper) */
  if (heading) {
    const h = heading.cloneNode(true);
    h.className = 'sywim-heading';
    card.appendChild(h);
  }

  /* ── Swiper container ── */
  const swiperContainer = document.createElement('div');
  swiperContainer.className = 'swiper sywim-swiper';

  const swiperWrapper = document.createElement('div');
  swiperWrapper.className = 'swiper-wrapper';

  listItems.forEach((li) => {
    swiperWrapper.appendChild(buildSlide(li, subtitle, buttonLink));
  });

  swiperContainer.appendChild(swiperWrapper);
  card.appendChild(swiperContainer);

  /* ── Replace wrapper content ── */
  wrapper.innerHTML = '';
  wrapper.className = 'sywim-wrapper';
  wrapper.appendChild(card);

  /* ── Init Swiper ── */
  const Swiper = await loadSwiper();
  const swiper = new Swiper(swiperContainer, {
    slidesPerView: 1,
    allowTouchMove: false,
  });

  renderPagination(swiperContainer, totalSlides, swiper.activeIndex);
  swiper.on('slideChange', () => {
    renderPagination(swiperContainer, totalSlides, swiper.activeIndex);
  });

  /* ── Next buttons advance swiper ── */
  swiperContainer.querySelectorAll('.sywim-btn').forEach((btn) => {
    btn.addEventListener('click', () => swiper.slideNext());
  });
}

export default async function decorateSeeyourWealthInmotion(doc) {
  const sections = doc.querySelectorAll('.section.seeyour-wealth-inmotion');
  if (!sections.length) return;

  loadCSS(
    `${window.hlx.codeBasePath}/components/Seeyour-wealth-inmotion/Seeyour-wealth-inmotion.css`,
  );

  const promises = [...sections].map((s) => decorateSection(s));
  await Promise.all(promises);
}
