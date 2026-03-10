// /* */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import dataMapMoObj from '../../scripts/constant.js';
import { loadAutoBlock } from '../../scripts/scripts.js';
import { img, span } from '../../scripts/dom-helpers.js';
import { HandshakeService } from '../../scripts/handshakeService.js';

/**
 * Initializes the scroll-to-top button.
 */
function initScrollToTop() {
  let scrollBtn = document.querySelector('.scroll-to-top');

  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="12" height="18" viewBox="0 0 14 21" fill="none"
           class="scroll-to-top-icon">
        <path d="M1 7.8125L7 1.8125M7 1.8125L13 7.8125M7 1.8125V19.8125" />
      </svg>
    `;
    document.querySelector('footer').appendChild(scrollBtn);
  }

  // Show/hide button
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  // Smooth scroll
  scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    scrollBtn.blur();
  });
}

/**
 * Loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  document.querySelectorAll('img[data-icon-name]').forEach((imgElement) => {
    const iconName = imgElement.getAttribute('data-icon-name');
    if (!iconName) return;

    const currentAlt = imgElement.getAttribute('alt');
    if (currentAlt && currentAlt.trim() !== '') return;

    const readableAlt = iconName
      .replace(/[-_]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
    imgElement.setAttribute('alt', readableAlt || iconName);
  });
  const mainBlock = block.closest('body');
  const download = mainBlock.querySelector('main .download');
  if (mainBlock.querySelector('header [data-id="wcs-header"]')) {
    block.closest('footer').style.display = 'none';
  }
  if (download != null) {
    dataMapMoObj.CLASS_PREFIXES = [
      'download-p',
      'download-ul',
      'download-li',
      'download-inner-ul',
      'download-first-list',
      'download-second-list',
    ];
    dataMapMoObj.addIndexed(download);
    const downloaddata = dataMapMoObj.htmlListToJSON(download.querySelector('.download-ul3'));
    download.querySelector('.download-ul3').style.display = 'none';
    const pdfData = {
      Factsheet: downloaddata.latestFactsheetPdf,
      Presentation: downloaddata.presentationPdf,
      'Scheme information document': downloaddata.sidDocumentPdf,
      Brochures: downloaddata.brochurepdf,
      Forms: downloaddata.formPdf,
    };

    // 1. First, hide categories that have no PDF
    let downsec = 0;
    document.querySelectorAll('.download-ul2 > li').forEach((li) => {
      const label = li.querySelector('.download-first-list1').textContent.trim();
      const url = pdfData[label];

      if (!url || url.trim() === '') {
        li.style.display = 'none';
        downsec += 1;
      }
    });

    // 2. Handle the click event for downloading
    document.querySelector('.download-ul2').addEventListener('click', (e) => {
      // Check if the user clicked the icon or the image
      const iconClick = e.target.closest('.download-second-list1');

      if (iconClick) {
        const parentLi = iconClick.closest('.comlist.download-inner-ul1');
        const label = parentLi.querySelector('.download-first-list1').textContent.trim();
        const downloadUrl = pdfData[label];

        if (downloadUrl) {
          // Programmatic download
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = ''; // Encourages download instead of navigation
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });

    if (downsec === 5) {
      download.style.display = 'none';
      mainBlock.querySelector('#downloadsec').style.display = 'none';
    }
  }
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // function wrapImgsInLinkswrap(container) {
  //   const pictures = Array.from(container);
  //   // ..querySelectorAll('picture');
  //   pictures.forEach((pic) => {
  //     const link = pic.nextElementSibling;
  //     if (link && link.tagName === 'A' && link.href) {
  //       link.innerHTML = pic.outerHTML;
  //       pic.replaceWith(link);
  //     }
  //   });
  // }

  // index with your class prefixes
  dataMapMoObj.CLASS_PREFIXES = [
    'footer-container',
    'footer-section',
    'footer-sub',
    'footer-sub-cont',
    'section-content',
    'list-items',
    'list-inneritem-',
  ];
  // wrapImgsInLinkswrap(block.querySelector('p'));
  dataMapMoObj.addIndexed(block);

  const disableQrLinking = (qrContainer) => {
    if (!qrContainer) return;

    // Prevent QR from acting like a link even if wrapped or overlaid.
    qrContainer.style.pointerEvents = 'auto';
    qrContainer.style.cursor = 'default';
    qrContainer.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);

    let qrLinkWrapper = qrContainer.closest('a');
    while (qrLinkWrapper) {
      qrLinkWrapper.replaceWith(qrContainer);
      qrLinkWrapper = qrContainer.closest('a');
    }

    qrContainer.querySelectorAll('a').forEach((link) => {
      const spanWrapper = document.createElement('span');
      spanWrapper.className = link.className;
      while (link.firstChild) {
        spanWrapper.appendChild(link.firstChild);
      }
      link.replaceWith(spanWrapper);
    });
  };

  // ASSUMING 'block' is the footer logo link fix
  block.querySelectorAll('.footer-sub2 img, .footer-sub3 img').forEach((img) => {
    const iconName = img.getAttribute('data-icon-name');
    if (iconName && !img.getAttribute('alt')) {
      img.setAttribute('alt', iconName);
    }
  });
  function fixFooterLogoLink(yublock) {
    const logoBtn = yublock.querySelector('.footer-sub-cont1');
    const linkAnchor = yublock.querySelector('.footer-sub-cont5 a');
    if (!logoBtn || !linkAnchor) return;
    const href = linkAnchor.getAttribute('href');
    if (!href) return;
    const newLink = document.createElement('a');
    newLink.className = logoBtn.className;
    newLink.href = href;
    newLink.setAttribute('aria-label', linkAnchor.getAttribute('title') || 'Footer logo link');
    while (logoBtn.firstChild) {
      newLink.appendChild(logoBtn.firstChild);
    }
    logoBtn.replaceWith(newLink);
  }
  fixFooterLogoLink(block);

  const evenFunc = block.querySelector('.mob-accordion .footer-sub2');

  if (evenFunc) {
    const getFooterRedirectionSection = evenFunc.querySelector('.footer-sub-cont1');
    if (getFooterRedirectionSection) {
      const detailsList = getFooterRedirectionSection.querySelectorAll('details');
      // Convert <details> to <div>
      detailsList.forEach((detailsEl) => {
        const newDiv = document.createElement('div');
        newDiv.className = detailsEl.className;
        newDiv.innerHTML = detailsEl.innerHTML;

        detailsEl.replaceWith(newDiv);
      });

      // Convert <summary> to <h2>
      const summaryList = getFooterRedirectionSection.querySelectorAll('summary');
      summaryList.forEach((summaryEl) => {
        const newH2 = document.createElement('h2');
        newH2.className = summaryEl.className;
        // Get only text (remove p tags)
        newH2.textContent = summaryEl.textContent.trim();

        summaryEl.replaceWith(newH2);
      });
    }
  }
  if (window.innerWidth < 900) {
    const accordionItems = block.querySelectorAll('.mob-accordion .accordion-item');
    // 1. Initial State: Close all, then open the first one
    accordionItems.forEach((item, index) => {
      const body = item.querySelector('.accordion-item-body');
      if (!body) return;

      if (index === 0) {
        item.setAttribute('open', '');
        body.style.display = 'block';
      } else {
        item.removeAttribute('open');
        body.style.display = 'none';
      }

      // 2. Add Event Listener
      const label = item.querySelector('.accordion-item-label');
      if (label) {
        label.addEventListener('click', () => {
          const isOpen = item.hasAttribute('open');

          // Close all items
          accordionItems.forEach((el) => {
            el.removeAttribute('open');
            const elBody = el.querySelector('.accordion-item-body');
            if (elBody) elBody.style.display = 'none';
          });

          // If the clicked item wasn't open, open it
          if (!isOpen) {
            item.setAttribute('open', '');
            body.style.display = 'block';
          }
        });
      }
    });
    if (block.querySelector('.mob-accordion .footer-sub1') !== null) {
      block.querySelector('.mob-accordion .footer-sub1').style.display = 'none';
    }
  }
  // const evenFunc = block.querySelector('.mob-accordion .footer-sub2');
  const eventv2 = evenFunc?.querySelector('.section-content1 .list-items2');
  const eventv3 = eventv2?.querySelector('.list-inneritem-1').children;
  let amc = '';
  if (block.querySelector('[data-id="amc-footer"]')) {
    amc = 'Y';
  }
  if (eventv2 !== undefined && !eventv2?.closest('body')?.querySelector('.pms-header') && amc === '') {
    const pathname = '/mutual-funds';
    // '/mutual-fund/in/en/mutual-funds';
    Array.from(eventv3).forEach((eventElem) => {
      // if (eventElem.querySelector('a')) {
      //   eventElem.querySelector('a').removeAttribute('href');
      // }
      eventElem.querySelector('a').setAttribute('href', `${window.location.origin}${pathname}`);
      eventElem.addEventListener('click', (event) => {
        event.preventDefault();
        const textCurr = event.target.textContent
          .toLowerCase().replaceAll(' funds', '');
        let joinstr = textCurr.split(' ').join('-').toLowerCase();
        // console.log(joinstr);
        if (joinstr === 'index') {
          joinstr = 'index-funds';
        }
        dataMapMoObj.selectviewFunds = joinstr;

        localStorage.setItem('viewmark', dataMapMoObj.selectviewFunds);
        // const pathname = '/mutual-fund/in/en/our-funds';
        const pathname = '/mutual-funds';
        window.location.href = `${window.location.origin}${pathname}`;
      });
    });
  }
  // const logoContainers = document.querySelector('.footer-sub-cont1 .section-content1');

  // logoContainers.forEach((container) => {
  //   // Change the cursor to a pointer to show it's clickable.
  //   container.style.cursor = 'pointer';

  //   // Add the click event listener to redirect to the home page.
  //   container.addEventListener('click', () => {
  //     window.location.href = 'https://mosldevexp--eds-cloud--rupeshdept.aem.live/mutual-fund/in/en/home-page';
  //   });
  // });

  block.querySelectorAll('.accordion-item-body .list-inneritem-1').forEach((ele) => {
    Array.from(ele.children).forEach((el) => {
      el.classList.add('list-innerlist');
    });
  });

  const listItems2 = block.querySelector('.list-items2');
  if (listItems2) {
    Array.from(listItems2.children).forEach((lieltwo) => {
      lieltwo.classList.add('item-list');
      Array.from(lieltwo.children).forEach((elrt) => {
        elrt.classList.add('item-anchor');
      });
    });
  }

  // open all footer accordions by default
  const acccontain = block.querySelector('.footer-sub2 .accordion')?.children;
  if (acccontain) {
    Array.from(acccontain).forEach((itemel) => {
      if (!itemel.hasAttribute('open') && window.innerWidth >= 900) {
        itemel.setAttribute('open', '');
      }
    });
  }

  const playStoreBtn = document
    .querySelectorAll('.icon-Playstore-footer');
  if (playStoreBtn?.length) {
    playStoreBtn.forEach((ele) => {
      ele.parentElement.setAttribute(
        'aria-label',
        'Download app from Google Play Store',
      );
      console.log('Play Store aria-label applied');
    });
  } else {
    console.log('Play Store button not found');
  }

  const appleStoreBtn = document.querySelectorAll('.icon-Apple-footer');

  if (appleStoreBtn?.length) {
    appleStoreBtn.forEach((ele) => {
      ele.parentElement.setAttribute(
        'aria-label',
        'Download app from Apple App Store',
      );
      console.log('Apple Store aria-label applied');
    });
  } else {
    console.log('Apple Store button not found');
  }
  // wrap .footer-sub-cont2 and .footer-sub-cont3 in a container
  const social = footer.querySelector('.footer-sub-cont2');
  const store = footer.querySelector('.footer-sub-cont3');

  if (social && store) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('footer-sub-wrapper');
    social.before(wrapper);
    wrapper.append(social, store);

    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont2 .section-content1 img'),
      'facebook',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont2 .section-content2 img'),
      'instagram',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont2 .section-content3 img'),
      'x',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont2 .section-content4 img'),
      'youtube',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont2 .section-content5 img'),
      'lindkin',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont3 .section-content1 img'),
      'bar-code',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont3 .section-content2 img'),
      'Download on Google Play',
    );
    dataMapMoObj.altFunction(
      wrapper.querySelector('.footer-sub-cont3 .section-content3 img'),
      'Download on the App Store',
    );
  }

  loadAutoBlock(footer);
  const footerButton = block.querySelector('.footer-sub-cont4');
  const targetSection = block.querySelector('.footer-sub-cont3 .section-content1');

  if (footerButton && targetSection) {
    targetSection.append(footerButton);
  }

  disableQrLinking(block.querySelector('.footer-sub-cont4'));

  // Init scroll-to-top button
  initScrollToTop();
  const footercls = block.closest('.footer');
  if (footercls.querySelector('.footer-section3 .footer-sub-cont2')) {
    Array.from(
      footercls.querySelector('.footer-section3 .footer-sub-cont2').children,
    ).forEach((efthre) => {
      efthre.classList.add('footerthr');
      const iconEl = efthre.querySelector('.icon');
      const imgEl = iconEl?.querySelector('img');
      const iconName = imgEl.getAttribute('data-icon-name');
      if (iconName) {
        imgEl.setAttribute('alt', iconName);
      }
    });
  }
  const footerContainer = document.querySelector('.footer-sub3 .icon img');

  if (footerContainer) {
    footerContainer.setAttribute('alt', 'QR code to download Motilal Oswal Mutual Fund, PMS and AIF app');
    // const altTextMap = {
    //   'footer-bar-code': 'QR code',
    // };
    // const imagesToFix = footerContainer.querySelectorAll('img[alt=""]');

    // imagesToFix.forEach((image) => {
    //   const { iconName } = image.dataset;

    //   const altText = altTextMap[iconName];

    //   if (altText) {
    //     image.setAttribute('alt', altText);
    //   }
    // });
  }

  const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
  async function removeClassAfterDelay() {
    await delay(2000);
    let blokform;
    if (block.querySelector('#form-email-1')) {
      blokform = block.querySelector('#form-email-1');
    } else if (block.querySelector('#form-email')) {
      blokform = block.querySelector('#form-email');
    }
    const footerfield = block.querySelector('.footer-section2 .footer-sub-cont2');
    if (footerfield !== null) {
      footerfield.style.display = 'none';
    }
    if (blokform !== undefined) {
      blokform.style.display = 'none';
    }
    if (blokform !== null && blokform !== undefined) {
      const elemObj = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const formem = blokform;
      formem.classList.add('email-imput');
      formem.addEventListener('input', (event) => {
        const closblock = event.target.closest('.footer');
        elemObj.errorelm = closblock;
        if (closblock.querySelector('.errormsg') === null) {
          closblock.querySelector('.field-wrapper').append(span({ class: 'errormsg' }, 'Enter a valid email address'));
          closblock.querySelector('.field-wrapper').querySelector('.errormsg').setAttribute('role', 'alert');
        }
        const inpval = event.target.value;
        const inpelm = event.target.parentElement.classList;

        const getEmailInputElem = event.target;

        if (inpval.length < 1) {
          inpelm.remove('email-fail');
          inpelm.remove('email-success');
          closblock.querySelector('.errormsg').style.display = 'none';
          formem.nextElementSibling.style.display = 'none';

          getEmailInputElem.removeAttribute('aria-describedby', 'err');
        } else if (emailRegex.test(inpval)) {
          closblock.querySelector('.errormsg').style.display = 'none';
          inpelm.remove('email-fail');
          formem.nextElementSibling.style.display = 'none';
          // inpelm.add('email-success');

          getEmailInputElem.removeAttribute('aria-describedby', 'err');
        } else {
          closblock.querySelector('.errormsg').style.display = 'block';
          inpelm.add('email-fail');
          formem.nextElementSibling.style.display = 'block';
          // inpelm.remove('email-success');

          getEmailInputElem.setAttribute('aria-describedby', 'err');

          // const imgEl = formem.nextElementSibling;

          // // Only run if the next element is actually an <img>
          // if (imgEl && imgEl.tagName.toLowerCase() === 'img') {

          //   // Create button
          //   const btn = document.createElement('button');
          //   btn.type = "button";
          //   btn.className = "crossbtn";
          //   btn.style.display = 'contents';
          //   // Move image inside button
          //   btn.appendChild(imgEl.cloneNode(true));

          //   // Replace <img> with button
          //   imgEl.replaceWith(btn);
          // }
        }
      });
      const wrapperimg = document.createElement('div');
      wrapperimg.classList.add('wrapimgform');
      wrapperimg.append(formem);
      wrapperimg.append(img({
        src: '/icons/error-cross.svg',
        alt: 'Clear',
        class: 'crossimg',
        onclick: () => {
          formem.value = '';
          formem.parentElement.classList.remove('email-fail');
          elemObj.errorelm.querySelector('.errormsg').style.display = 'none';
          formem.nextElementSibling.style.display = 'none';
        },
      }));
      block.querySelector('.email-wrapper').append(wrapperimg);
      block.querySelector('.submit-btn .button').addEventListener('click', () => {
        if (emailRegex.test(formem.value)) {
          elemObj.errorelm.querySelector('.errormsg').style.display = 'none';
          formem.closest('.wrapimgform').classList
            .remove('email-fail');
          formem.closest('.wrapimgform').classList
            .add('email-success');
          formem.nextElementSibling.style.display = 'none';
        }
      });
    }

    if (store) {
      // Convert LI elements first
      const liItems = store.querySelectorAll('li.list-inneritem-1, li.list-inneritem-2');
      liItems.forEach((li) => {
        const span = document.createElement('span');
        span.className = li.className;
        span.innerHTML = li.innerHTML;
        li.replaceWith(span);
      });
      // After LI replacement: now convert the UL (optional)
      const ulItems = store.querySelectorAll('ul.list-items2');
      ulItems.forEach((ul) => {
        const span = document.createElement('span');
        span.className = ul.className;
        span.innerHTML = ul.innerHTML;
        ul.replaceWith(span);
      });
    }
  }

  removeClassAfterDelay();

  // if (block.classList.contains('footer')) {
  //   const replace = (from, to) => {
  //     block.querySelectorAll(from).forEach((el) => {
  //       const n = document.createElement(to);
  //       [...el.attributes].forEach((a) => n.setAttribute(a.name, a.value));
  //       n.innerHTML = el.innerHTML;
  //       el.replaceWith(n);
  //     });
  //   };
  //   replace('li', 'span');
  //   replace('p', 'button');
  // }

  if (block.classList.contains('footer')) {
    const replace = (from, to) => {
      block.querySelectorAll(from).forEach((el) => {
        // ❌ Skip if inside summary
        if (el.closest('summary')) return;
        if (el.closest('.footer-sub-cont2')) return;
        if (el.closest('.footer-sub-cont3')) return;
        const n = document.createElement(to);
        [...el.attributes].forEach((a) => n.setAttribute(a.name, a.value));
        n.innerHTML = el.innerHTML;
        el.replaceWith(n);
      });
    };
    replace('ul', 'span');
    replace('li', 'span');
    replace('p', 'button');
  }

  // Service link interception for handshake API
  block.addEventListener('click', (event) => {
    const link = event.target.closest('a[href="/login-page"]');
    if (link && block.contains(link)) {
      HandshakeService.handleServiceLinkClick(event, link);
    }
  });
}

const container = document.querySelector('.footer-sub-cont3');

if (container) {
  const altTextMap = {
    'footer-bar-code': 'QR code to download Motilal Oswal Mutual Fund, PMS and AIF app',
    'Playstore-footer': 'Google Play Store icon',
    'Apple-footer': 'Apple App Store icon',
  };

  const images = container.querySelectorAll('img');

  images.forEach((image) => {
    const { iconName } = image.dataset;

    const altText = altTextMap[iconName];
    if (altText) {
      image.setAttribute('alt', altText);
    }
  });
}

// Function to hide footer on WCS PAGE

const currentPath = window.location.pathname;

const targetPath = '/wcs';

if (currentPath.includes(targetPath)) {
  const hideFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
  };

  hideFooter();

  const observer = new MutationObserver((mutations, obs) => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
      obs.disconnect();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Code End Function to hide footer on WCS PAGE
