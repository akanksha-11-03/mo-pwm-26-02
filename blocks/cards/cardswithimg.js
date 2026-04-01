import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

async function loadSwiper() {
  loadCSS(`${window.hlx.codeBasePath}/scripts/swiper/swiper-bundle.min.css`);
  const { default: Swiper } = await import('../../scripts/swiper/swiper-bundle.min.js');
  return Swiper;
}

/**
 * Toggle accordion — expand text overlay to cover image, or collapse back.
 */
function toggleAccordion(slide) {
  const isOpen = slide.classList.toggle('accordion-open');
  const icon = slide.querySelector('.accordion-toggle-icon');
  if (icon) icon.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
}

export default async function decoratecardwithimgs(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cardswithimg.css`);

  // Style the section heading area (default-content-wrapper above the block)
  const section = block.closest('.section');
  if (section) {
    section.classList.add('cardswithimg-section');
    const dcw = section.querySelector('.default-content-wrapper');
    if (dcw) {
      dcw.classList.add('cardswithimg-heading');
      // On mobile, merge multiple h3s into one
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        const h3s = [...dcw.querySelectorAll('h3')];
        if (h3s.length > 1) {
          const combined = h3s.map((h) => h.textContent.trim()).join(' ');
          h3s[0].textContent = combined;
          h3s.slice(1).forEach((h) => h.remove());
        }
      }
      // Add explicit classes
      const headingChildren = [...dcw.children];
      if (headingChildren[0]) headingChildren[0].classList.add('cardswithimg-label');
      if (headingChildren[1]) headingChildren[1].classList.add('cardswithimg-main-heading');
    }
  }

  const Swiper = await loadSwiper();

  const swiperEl = document.createElement('div');
  swiperEl.classList.add('swiper', 'cardswithimg-swiper');

  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('swiper-wrapper');

  [...block.children].forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    moveInstrumentation(row, slide);

    let imageCol = null;
    let bodyCol = null;

    while (row.firstElementChild) {
      const col = row.firstElementChild;
      if (col.children.length === 1 && col.querySelector('picture')) {
        col.className = 'cardswithimg-card-image';
        imageCol = col;
      } else {
        col.className = 'cardswithimg-card-body';
        bodyCol = col;
      }
      slide.append(col);
    }

    // Body (text) goes first, image below — flexbox column layout
    if (imageCol && bodyCol) {
      slide.prepend(bodyCol);
      slide.append(imageCol);
    }

    // Build accordion: title + description visible, + button toggles expanded content
    if (bodyCol) {
      const children = [...bodyCol.children];

      // Accordion header: title row with + button
      const headerRow = document.createElement('div');
      headerRow.className = 'accordion-header';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'accordion-title';

      // First child = title (h2/h3/p)
      if (children.length > 0) {
        titleWrap.append(children[0]);
      }

      // +/- toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'accordion-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle card details');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAccordion(slide);
      });
      const icon = document.createElement('img');
      icon.className = 'accordion-toggle-icon';
      icon.src = `${window.hlx.codeBasePath}/icons/Union-puls.svg`;
      icon.alt = 'Toggle';
      toggleBtn.append(icon);

      // Visible description (shown in collapsed state, below title)
      const visibleDesc = document.createElement('div');
      visibleDesc.className = 'accordion-desc';
      // Second child = short description
      if (children.length > 1) {
        visibleDesc.append(children[1]);
      }

      // Wrap title + desc together in accordion-content
      const contentWrap = document.createElement('div');
      contentWrap.className = 'accordion-content';
      contentWrap.append(titleWrap, visibleDesc);

      headerRow.append(contentWrap, toggleBtn);

      // Hidden detail (shown only when expanded)
      const detail = document.createElement('div');
      detail.className = 'accordion-detail';
      children.slice(2).forEach((child) => detail.append(child));

      bodyCol.replaceChildren(headerRow, detail);
    }

    wrapperEl.append(slide);
  });

  swiperEl.append(wrapperEl);

  // Pagination dots (no arrows per Figma — just dots)
  const pagination = document.createElement('div');
  pagination.classList.add('swiper-pagination');
  swiperEl.append(pagination);

  block.replaceChildren(swiperEl);

  // Optimize images
  swiperEl.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  // Initialize Swiper — 3 cards on desktop, auto on mobile
  // eslint-disable-next-line no-new
  new Swiper(swiperEl, {
    slidesPerView: 'auto',
    spaceBetween: 16,
    loop: true,
    pagination: {
      el: pagination,
      type: 'progressbar',
    },
    breakpoints: {
      1024: { slidesPerView: 3 },
    },
  });
}
