import { loadCSS } from '../../scripts/aem.js';

async function loadSwiper() {
  loadCSS(`${window.hlx.codeBasePath}/scripts/swiper/swiper-bundle.min.css`);
  const { default: Swiper } = await import('../../scripts/swiper/swiper-bundle.min.js');
  return Swiper;
}

export default async function decorateSeeyourWealthInmotion(doc) {
  const sections = doc.querySelectorAll('.section.seeyour-wealth-inmotion');
  if (!sections.length) return;

  loadCSS(
    `${window.hlx.codeBasePath}/components/Seeyour-wealth-inmotion/Seeyour-wealth-inmotion.css`,
  );

  for (const section of sections) {
    const wrapper = section.querySelector('.default-content-wrapper');
    if (!wrapper) continue;

    /* ── Extract authored content ── */
    const heading = wrapper.querySelector('h1, h2, h3, h4, h5, h6');
    const subtitle = wrapper.querySelector('p:not(.button-container)');
    // linkToBtn converts <ul> → <div class="divwithlinks">, so query both
    const listItems = wrapper.querySelectorAll('.divwithlinks li, ul li');
    const buttonContainer = wrapper.querySelector('.button-container');
    const buttonLink = buttonContainer
      ? buttonContainer.querySelector('a')
      : null;
    
    // Extract image/GIF (picture or img element)
    const imageElement = wrapper.querySelector('picture, img');

    if (!listItems.length) continue;
    const totalSlides = listItems.length;

    /* ── Separate heading and subtitle for flexible ordering ── */
    const headingContainer = document.createElement('div');
    headingContainer.className = 'sywim-heading';
    if (heading) headingContainer.appendChild(heading.cloneNode(true));

    const subtitleContainer = document.createElement('div');
    subtitleContainer.className = 'sywim-subtitle';
    if (subtitle) subtitleContainer.appendChild(subtitle.cloneNode(true));

    /* ── Swiper slides — one input per li ── */
    const swiperContainer = document.createElement('div');
    swiperContainer.className = 'swiper sywim-swiper';

    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';

    listItems.forEach((li) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'sywim-input';
      input.placeholder = li.textContent.trim();
      slide.appendChild(input);

      if (buttonLink) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sywim-btn';
        btn.textContent = buttonLink.textContent.trim();
        slide.appendChild(btn);
      }

      swiperWrapper.appendChild(slide);
    });

    swiperContainer.appendChild(swiperWrapper);

    /* ── Pagination row: dots + fraction ── */
    const paginationRow = document.createElement('div');
    paginationRow.className = 'sywim-pagination-row';

    const paginationDots = document.createElement('div');
    paginationDots.className = 'sywim-pagination';
    paginationRow.appendChild(paginationDots);

    const fraction = document.createElement('div');
    fraction.className = 'sywim-fraction';
    fraction.innerHTML = `<span class="sywim-fraction-current">1</span>/<span class="sywim-fraction-total">${
      totalSlides
    }</span>`;
    paginationRow.appendChild(fraction);

    /* ── Create form controls container ── */
    const formControls = document.createElement('div');
    formControls.className = 'sywim-form-controls';
    formControls.appendChild(swiperContainer);
    formControls.appendChild(paginationRow);

    /* ── Create content container with proper ordering ── */
    const contentContainer = document.createElement('div');
    contentContainer.className = 'sywim-content';
    
    // Add elements in order: heading, image, subtitle, form controls
    contentContainer.appendChild(headingContainer);
    
    if (imageElement) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'sywim-image-container';
      imageContainer.appendChild(imageElement.cloneNode(true));
      contentContainer.appendChild(imageContainer);
    }
    
    contentContainer.appendChild(subtitleContainer);
    contentContainer.appendChild(formControls);

    /* ── Replace wrapper content ── */
    wrapper.innerHTML = '';
    wrapper.className = 'sywim-wrapper';
    wrapper.appendChild(contentContainer);

    /* ── Init Swiper ── */
    const Swiper = await loadSwiper();
    const swiper = new Swiper(swiperContainer, {
      slidesPerView: 1,
      allowTouchMove: false,
      pagination: {
        el: paginationDots,
        clickable: false,
      },
      on: {
        slideChange(s) {
          fraction.querySelector('.sywim-fraction-current').textContent = s.activeIndex + 1;
        },
      },
    });

    /* ── Next buttons advance swiper ── */
    swiperContainer.querySelectorAll('.sywim-btn').forEach((btn) => {
      btn.addEventListener('click', () => swiper.slideNext());
    });
  }
}
