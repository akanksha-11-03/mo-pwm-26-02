import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import dataMapMoObj from '../../scripts/constant.js';
import {
  button, div, img, input, p, strong,
} from '../../scripts/dom-helpers.js';
import { createModal } from '../modal/modal.js';
import { trackLoginButton } from '../../scripts/analytics.js';
import { getFundListings } from '../../scripts/api.js';

// import dataCfObj from '../../scripts/dataCfObj.js';
// import { loadAutoBlock } from '../../scripts/scripts.js';
// import {a,button,div,h3,li,ul} from '../../scripts/dom-helpers.js'
// media query match that indicates mobile/tablet width
export const isDesktop = window.matchMedia('(min-width: 900px)');
// Media query for mobile - using matchMedia avoids forced reflow unlike window.innerWidth
const isMobile = window.matchMedia('(max-width: 900px)');
/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li , .nav-sections .default-content-wrapper > span > span').forEach((section) => {
    // remove attr from nav onload
    section.setAttribute('data-aria-expanded', expanded);
    section.setAttribute('tabindex', 0);
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    // const navSections = nav.querySelector('.nav-sections');
    // const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    // if (navSectionExpanded && isDesktop.matches) {
    //   // eslint-disable-next-line no-use-before-define
    //   toggleAllNavSections(navSections, false);
    // } else if (isDesktop.matches) {
    //   // eslint-disable-next-line no-use-before-define
    //   toggleMenu(nav, navSections, false);
    // }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function replaceTag(oldEl, newTag) {
  const newEl = document.createElement(newTag);

  // Copy ALL attributes
  for (const attr of oldEl.attributes) {
    newEl.setAttribute(attr.name, attr.value);
  }

  // Move child nodes (safer than innerHTML, preserves events inside)
  while (oldEl.firstChild) {
    newEl.appendChild(oldEl.firstChild);
  }

  oldEl.replaceWith(newEl);
  return newEl;
}

const ICON_ALT_TEXT_MAP = {
  Article: 'Article',
  'youtube-1': 'Video',
  'Press-Releases': 'Press Releases',
  Interview: 'Interview',
  'Article-image-hd': 'Featured article thumbnail',
  'play-btnhd': 'Play video',
  'currency-video': 'Featured video thumbnail',
  'calendar-01': 'Calendar',
  'Watchlist-star': 'My Watchlist',
  'search-white': 'Search',
  'watchlist-star-white': 'My Watchlist',
  'shoppingcart-header': 'Shopping Cart',
  'user-icon-header': 'User Profile',
  'whatup-Icon-header': 'WhatsApp Contact',
  'mobile-icon-header': 'Mobile App Download',
  ShoppingCartSimple: 'Shopping Cart',
  ic_MO_Largecap_Fund: 'Motilal Oswal Large Cap Fund',
  ic_MO_Small_cap_Fund: 'Motilal Oswal Small Cap Fund',
  ic_MO_Midcap_Fund: 'Motilal Oswal Mid Cap Fund',
  ic_MO_Flexi_Cap_Fund: 'Motilal Oswal Flexi Cap Fund',
  'mic-1': 'Podcast',
};

function applyIconAltText(scope) {
  if (!scope) return;
  scope.querySelectorAll('img[data-icon-name]').forEach((imgElement) => {
    const iconName = imgElement.getAttribute('data-icon-name');
    if (!iconName) return;

    const currentAlt = imgElement.getAttribute('alt');
    if (currentAlt && currentAlt.trim() !== '') return;

    const altText = ICON_ALT_TEXT_MAP[iconName] || iconName;
    imgElement.setAttribute('alt', altText);

    if (['play-btnhd', 'youtube-1', 'currency-video'].includes(iconName)) {
      imgElement.setAttribute('aria-label', 'Videos');
    }
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        // drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.classList.add('nfo-nav');

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  if (window.location.href.includes('/pms/') || window.location.href.includes('/aif/')) {
    nav.classList.remove('nfo-nav');
  }

  if ([...block.classList].includes('wealth-header')) {
    nav.classList.remove('nfo-nav');
  }
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // amc header start
  const amcHed = block.closest('.header-wrapper');
  if (nav.querySelector('[data-id="amc-header"]')) {
    block.classList.add('amc-header');
    amcHed?.classList.add('amc-wrp');
  }
  // const headerWrapper = block.closest('.header-wrapper');

  // if (block.querySelector('[data-id="amc-header"]')) {
  //   headerWrapper?.classList.add('amc-header');
  //   block.classList.add('amc-wrpapper');
  // }

  if (nav.querySelector('[data-id="wcs-header"]')) {
    block.classList.add('wealth-header');
  }

  if (nav.querySelector('[data-id="wcs-header"]')) {
    document.body.classList.add('custom-scroll');
  }
  // Find the main .nav-brand container once.
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand.getAttribute('data-id') === 'pms-header') {
    block.classList.add('pms-header');
  }
  if ((navBrand.getAttribute('data-id') === 'pms-header') || window.location.href.includes('/aif/')) {
    nav.classList.remove('nfo-nav');
  }
  // Guard clause: If the .nav-brand element doesn't exist, prevent errors.
  if (navBrand) {
    // --- Section 1: Data Indexing and Button Cleanup (from your snippet) ---

    // Set up the class prefixes for your dataMapMoObj utility.
    if (typeof dataMapMoObj !== 'undefined' && dataMapMoObj.addIndexed) {
      dataMapMoObj.CLASS_PREFIXES = [
        'navbrand-cont',
        'navbrand-sec',
        'navbrand-sub',
        'navbrand-inner-net',
        'navbrand-list',
        'navbrand-list-content',
      ];
      dataMapMoObj.addIndexed(navBrand);
    }

    // Find and clean up the legacy button wrapper, if it exists.
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = ''; // Remove all classes from the link itself.
      const buttonContainer = brandLink.closest('.button-container');
      if (buttonContainer) {
        buttonContainer.className = ''; // Remove all classes from its container.
      }
    }

    // Select both the desktop and mobile logo containers within the navBrand element.
    const logoContainers = navBrand.querySelectorAll('.navbrand-sec1, .navbrand-sec2');

    logoContainers.forEach((container) => {
      // Change the cursor to a pointer to show it's clickable.
      container.style.cursor = 'pointer';

      // Add the click event listener to redirect to the home page.
      container.addEventListener('click', () => {
        if (nav.querySelector('[data-id="wcs-header"]')) {
          window.location.href = `${window.location.origin}/wcs-series`;
        } else if (window.location.href.includes('motilaloswalmf')) {
          window.location.href = `${window.location.origin}/`;
        } else if (window.location.origin.includes('motilaloswalmf') || window.location.origin.includes('motilaloswalamc')) {
          window.location.href = `${window.location.origin}/`;
        } else {
          window.location.href = `${window.location.origin}/home-page`;
        }
      });
    });
  }

  ['ul.navbrand-sec3', 'li.navbrand-sub1'].forEach((selector) => {
    const el = navBrand.querySelector(selector);
    if (el) replaceTag(el, 'span');
  });

  let leaveTimer;
  const getDropdownTrigger = navBrand.querySelector('.navbrand-sec3 .navbrand-inner-net1');
  const dropdownMenu = navBrand.querySelector('.navbrand-sec3 .navbrand-inner-net2');

  const dropdownTrigger = document.createElement('button');
  if (getDropdownTrigger) {
    dropdownTrigger.className = getDropdownTrigger.className;
    dropdownTrigger.innerHTML = getDropdownTrigger.innerHTML;
    // replace the getDropdownTrigger (p) tag with button
    getDropdownTrigger.replaceWith(dropdownTrigger);
    // add attr
    dropdownTrigger.setAttribute('aria-expanded', false);
    dropdownTrigger.setAttribute('aria-label', dropdownTrigger.innerHTML);
  }
  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', (event) => {
      event.stopPropagation();

      // toggle attr
      const isExpanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
      dropdownTrigger.setAttribute('aria-expanded', !isExpanded);

      dropdownMenu.classList.toggle('open');
      dropdownTrigger.classList.toggle('active');
      const logineventab = block.querySelector('.nav-tools .nav-tools-sub4 .nav-tools-inner-net1');
      const nextel = logineventab.nextElementSibling;
      if (nextel.style.display === 'block') {
        nextel.style.display = 'none';
      }
      const headerTo = nav.querySelector('.section.header-top');
      const dropTrigge = headerTo.querySelector('.header-top-sec1 .header-top-sub5 .header-top-inner-text1');
      const dropMen = headerTo.querySelector('.header-top-sec1 .header-top-sub5 .header-top-inner-text2');
      if (dropMen.classList.contains('open')) {
        dropMen.classList.remove('open');
        dropTrigge.classList.remove('active');
      }
    });

    dropdownMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    document.addEventListener('click', () => {
      if (dropdownMenu.classList.contains('open')) {
        dropdownMenu.classList.remove('open');
        dropdownTrigger.classList.remove('active');
      }
    });
  }
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // nav.addEventListener('click', (event) => {
    //   const link = event.target.closest('a');
    //   if (!link || !nav.contains(link)) return;
    //   const href = link.getAttribute('href');
    //   if (!href || href === '#' || href === '#!') {
    //     event.preventDefault();
    //   }
    // });

    // navSections.addEventListener('click', (event) => {
    //   const trigger = event.target.closest('.nav-sec-inner-text1');
    //   if (!trigger || !navSections.contains(trigger) || !isDesktop.matches) return;

    //   const scrollTop = window.scrollY;
    //   event.preventDefault();
    //   event.stopPropagation();

    //   const navItem = trigger.closest('.nav-drop');
    //   if (navItem) {
    //     const expanded = navItem.getAttribute('data-aria-expanded') === 'true';
    //     toggleAllNavSections(navSections, false);
    //     navItem.setAttribute('data-aria-expanded', expanded ? 'false' : 'true');
    //     trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');

    //     if (!block.classList.contains('amc-header')) {
    //       document.body.classList.toggle('no-scroll', !expanded);
    //     }
    //   }

    //   requestAnimationFrame(() => {
    //     if (window.scrollY !== scrollTop) {
    //       window.scrollTo({ top: scrollTop });
    //     }
    //   });
    // });
    // A single timer is shared across all nav sections to prevent flickering.

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach(async (navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        const hrefnaf = navSection.querySelector('ul li');

        // const oldP = navSection.querySelector('p');
        // if (oldP) {
        //   const btn = document.createElement('button');

        //   // copy class + content
        //   btn.className = oldP.className;
        //   btn.innerHTML = oldP.innerHTML;

        //   // accessibility (recommended)
        //   btn.setAttribute('aria-expanded', 'false');

        //   // replace <p> with <button>
        //   oldP.replaceWith(btn);
        // }

        const frgnav = await loadFragment(hrefnaf.children[0].getAttribute('href'));
        navSection.querySelector('ul button li').innerHTML = '';
        if (frgnav !== null) {
          navSection.querySelector('ul button li').append(frgnav.children[0]);
        }
        // hrefnaf.innerHTML = '';
        // if (frgnav !== null) {
        //   hrefnaf.append(frgnav.children[0]);
        // }
        //  else {
        //   hrefnaf.style.display = 'none';
        // }
      }

      // --- Desktop Hover Logic ---
      navSection.addEventListener('mouseenter', () => { // mouseenter
        if (isDesktop.matches) {
          // 1. Cancel any pending timer to close a menu when moving the mouse to a new item.
          clearTimeout(leaveTimer);

          // 2. Standard open: Close all other menus first, then open the current one.
          // Assuming toggleAllNavSections(navSections, false) closes all menus.
          toggleAllNavSections(navSections, false);
          if (!block.classList.contains('amc-header')) {
            document.body.classList.add('no-scroll');
          }
          if (navSection.querySelector('.nav-sec-list1') !== null && navSection.querySelector('.nav-sec-list1').innerHTML !== '') {
            navSection.setAttribute('data-aria-expanded', 'true');

            const btn = navSection.querySelector('.nav-sec-inner-text1');
            btn.setAttribute('aria-expanded', 'true');
          }

          // Prevent body scrolling while the menu is open.
          // document.body.classList.add('no-scroll');

          // *** CRITICAL FIX: The nested mouseleave listener was removed here. ***
          // It was causing multiple redundant timers to fire.
        }

        // ---------------------------------------------------------------------
        // Logic to close other, non-main-nav dropdowns (e.g., utility menus)
        // ---------------------------------------------------------------------
        const headerTop = nav.querySelector('.section.header-top');
        let dropTrigger;
        let dropMenu;
        if (headerTop !== null) {
          dropTrigger = headerTop.querySelector('.header-top-sec1 .header-top-sub5 .header-top-inner-text1');
          dropMenu = headerTop.querySelector('.header-top-sec1 .header-top-sub5 .header-top-inner-text2');
        }
        const dropdownTrigge = navBrand.querySelector('.navbrand-sec3 .navbrand-inner-net1');
        const dropdownMer = navBrand.querySelector('.navbrand-sec3 .navbrand-sec3-inner-net2'); // Corrected typo: dropdownMer was navBrand.querySelector('.navbrand-sec3 .navbrand-inner-net2');

        // Close the first utility dropdown
        if (dropMenu && dropMenu.classList.contains('open')) {
          dropMenu.classList.remove('open');
          dropTrigger.classList.remove('active');
        }

        // Close the login/account dropdown
        const logineventab = block.querySelector('.nav-tools .nav-tools-sub4 .nav-tools-inner-net1');
        const nextel = logineventab ? logineventab.nextElementSibling : null;
        if (nextel && nextel.style.display === 'block') {
          nextel.style.display = 'none';
        }

        // Close the second utility dropdown
        if (dropdownMer && dropdownMer.classList.contains('open')) {
          dropdownMer.classList.remove('open');
          dropdownTrigge.classList.remove('active');
        }
        // ---------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // Logic for dynamic link generation/handling (specific to 'nav-sec-sub2')
        // ---------------------------------------------------------------------
        if (Array.from(navSection.classList).includes('nav-sec-sub2')) {
          const ary = ['sub-popup-sub1', 'sub-popup-sub2'];
          const navdirect = navSection.querySelector('.nav-sec-inner-text1 .sub-popup-sec1');
          if (navdirect) {
            Array.from(navdirect.children).forEach((element) => {
              const navclass = Array.from(element.classList);
              const listel = element.querySelector('.sub-popup-inner-text2');
              if (listel && ary.includes(navclass.at(-1))) {
                listel.querySelectorAll('a').forEach((ael) => {
                  // Remove href to prevent default navigation before click logic
                  ael.removeAttribute('href');
                  ael.addEventListener('click', async (event) => {
                    let textcurr = event.currentTarget.textContent.trim();
                    dataMapMoObj.selectviewFunds = '';

                    if (Array.from(event.currentTarget.classList).length === 0) {
                      // Logic for specific fund links
                      const listing = await getFundListings();
                      const tempDfilt = listing.cfDataObjs.filter((el) => {
                        if (!el.fundsTaggingSection) {
                          return false;
                        }
                        return el;
                      });
                      tempDfilt.forEach((datael) => {
                        if (datael.schemeName === textcurr) {
                          dataMapMoObj.selectviewFunds = datael.schcode;
                        }
                      });
                      if (dataMapMoObj.selectviewFunds !== '') {
                        localStorage.setItem('planCode', `Direct:${dataMapMoObj.selectviewFunds}`);
                        const pathname = '/mutual-funds/funds-details-page';
                        window.location.href = `${window.location.origin}${pathname}`;
                      }
                    } else {
                      // Logic for fund category links
                      if (textcurr === 'ETFs') {
                        textcurr = 'ETF';
                      }
                      if (textcurr === 'Large & Mid Cap') {
                        textcurr = 'large-and-mid-cap';
                      }
                      if (textcurr === 'Multi Cap') {
                        textcurr = 'multi-cap-fund';
                      }
                      if (textcurr === 'View All Funds') {
                        dataMapMoObj.selectviewFunds = '';
                        localStorage.setItem('viewmark', dataMapMoObj.selectviewFunds);
                        const pathname = '/mutual-funds';
                        window.location.href = `${window.location.origin}${pathname}`;
                        return false;
                      }
                      dataMapMoObj.selectviewFunds = textcurr.toLocaleLowerCase().split(' ').join('-');
                      localStorage.setItem('viewmark', dataMapMoObj.selectviewFunds);
                      const pathname = '/mutual-funds';
                      window.location.href = `${window.location.origin}${pathname}`;
                    }
                    return textcurr;
                  });
                });
              }
            });
          }
        }
        // ---------------------------------------------------------------------
      });
      // When the mouse leaves the entire nav item area (L1 button + L2 menu),
      // start a timer to close it.
      if (navSection.querySelector('button')) {
        navSection.querySelector('button').addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            leaveTimer = setTimeout(() => {
              toggleAllNavSections(navSections, false);
              // Fix: Set aria-expanded to 'false' when the menu is closing.

              // need to check here
              navSection.setAttribute('data-aria-expanded', 'false');

              const btn = navSection.querySelector('.nav-sec-inner-text1');
              btn.setAttribute('aria-expanded', 'false');

              document.body.classList.remove('no-scroll');
            }, 300); // A 300ms delay feels smooth and prevents accidental closing.
          }
        });
      }

      try {
        navSection.querySelector('button > li').addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            leaveTimer = setTimeout(() => {
              toggleAllNavSections(navSections, false);
              // Fix: Set aria-expanded to 'false' when the menu is closing.
              navSection.setAttribute('data-aria-expanded', 'false');

              const btn = navSection.querySelector('.nav-sec-inner-text1');
              btn.setAttribute('data-aria-expanded', 'false');

              document.body.classList.remove('no-scroll');
            }, 300); // A 300ms delay feels smooth and prevents accidental closing.
          }
        });
      } catch (error) {
        // console.log(console.error(.);
      }

      // --- Mobile Click Logic (Unaffected) ---
      // Using isMobile.matches instead of window.innerWidth to avoid forced reflow
      if (isMobile.matches) {
        Array.from(navSections.querySelector('ul').children).forEach((elinit) => {
          Array.from(elinit.querySelectorAll('ul')).forEach((elfor) => {
            elfor.style.display = 'none';
          });
        });
        // navSections.querySelectorAll('ul > li').forEach((elfor) => {
        //   if (elfor.querySelector('ul') !== null) {
        //     elfor.querySelector('ul').style.display = 'none';
        //   }
        // });
        // if (index === 1) {
        //   navSection.querySelectorAll('ul').forEach((elfor) => {
        //     if (elfor.querySelector('ul') !== null) {
        //       elfor.querySelector('ul').style.display = 'block';
        //     }
        //   });
        // }
        navSection.addEventListener('click', () => {
          navSections.querySelectorAll('ul > li').forEach((elfor) => {
            if (elfor.querySelector('span') !== null) {
              elfor.querySelector('span').style.display = 'none';
            }
          });
          const expanded = navSection.getAttribute('data-aria-expanded') === 'true';
          if (expanded) {
            toggleAllNavSections(navSections, false);
            navSection.setAttribute('data-aria-expanded', expanded ? 'false' : 'true');
            Array.from(navSection.querySelectorAll('span')).forEach((elul) => {
              elul.style.display = 'none';
            });
            return false;
          }
          toggleAllNavSections(navSections, false);
          navSection.setAttribute('data-aria-expanded', expanded ? 'false' : 'true');
          Array.from(navSection.querySelectorAll('span')).forEach((elul) => {
            elul.style.display = 'block';
          });
          if (navSection.querySelector('.our-popular-funds') && isMobile.matches) {
            Array.from(navSection.querySelectorAll('.our-popular-funds .sub-popup-sub3 span')).forEach((elefund) => {
              if (!Array.from(elefund.classList).includes('sub-popup-list-content2')) {
                elefund.style.display = 'flex';
              }
            });
            navSection.querySelector('.our-popular-funds .sub-popup-sec1 .sub-popup-sub4').style.display = 'none';
          }
          if (navSection.querySelector('.services-header') && isMobile.matches) {
            navSection.querySelector('.services-header .sub-popup-sec2 .sub-popup-sub2').style.display = 'none';
            navSection.querySelector('.services-header .sub-popup-sec1 .sub-popup-sub4').style.display = 'none';
          }
          if (navSection.querySelector('.calculator-header') && isMobile.matches) {
            navSection.querySelector('.calculator-header .sub-popup-sec2 .sub-popup-sub2').style.display = 'none';
            navSection.querySelector('.calculator-header .sub-popup-sec1 .sub-popup-sub3').style.display = 'none';
          }
          if (navSection.querySelector('.investor-edu-header') && isMobile.matches) {
            Array.from(navSection.querySelectorAll('.investor-edu-header .sub-popup-sub2 span')).forEach((elemedu) => {
              elemedu.removeAttribute('style');
            });
            navSection.querySelector('.investor-edu-header .sub-popup-sec1 .sub-popup-sub3').style.display = 'none';
            navSection.querySelector('.investor-edu-header .sub-popup-sec2 .sub-popup-sub2').style.display = 'none';
          }
          if (navSection.querySelector('.mosl-edge-header') && isMobile.matches) {
            Array.from(navSection.querySelectorAll('.mosl-edge-header span')).forEach((elemedu) => {
              elemedu.removeAttribute('style');
            });
            navSection.querySelector('.mosl-edge-header .sub-popup-sec1 .sub-popup-sub3').style.display = 'none';
          }
          return false;
        });
      }

      const subHeader = navSection.querySelectorAll('.section');
      dataMapMoObj.CLASS_PREFIXES = [
        'sub-popup-cont',
        'sub-popup-sec',
        'sub-popup-sub',
        'sub-popup-inner-text',
        'sub-popup-list',
        'sub-popup-list-content',
        'sub-popup-list-row',
      ];
      subHeader.forEach((sublist) => {
        dataMapMoObj.addIndexed(sublist);
        sublist.setAttribute('aria-label', '');
      });

      if (navSection.querySelector('.investor-edu-header') && navSection.querySelector('.investor-edu-header .sub-popup-sec2')) {
        Array.from(navSection.querySelector('.investor-edu-header .sub-popup-sec2 .sub-popup-inner-text2').children).forEach((eleminvest) => {
          eleminvest.querySelector('a').removeAttribute('href');
          eleminvest.querySelector('a').addEventListener('click', (event) => {
            const fundName = event.target.textContent;
            dataMapMoObj.selectviewFunds = fundName;
            dataMapMoObj.selectviewFunds = fundName.toLocaleLowerCase().split(' ').join('-');
            if (fundName === 'Equity Funds') {
              dataMapMoObj.selectviewFunds = 'indian-equity';
            }
            if (fundName === 'Hybrid And Balanced') {
              dataMapMoObj.selectviewFunds = 'hybrid-&-balanced';
            }
            if (fundName === 'International Equities') {
              dataMapMoObj.selectviewFunds = 'international-equity';
            }
            if (dataMapMoObj.selectviewFunds === 'etfs') {
              dataMapMoObj.selectviewFunds = 'etf';
            }
            localStorage.setItem('viewmark', dataMapMoObj.selectviewFunds);
            const pathname = '/mutual-funds';
            window.location.href = `${window.location.origin}${pathname}`;
            console.log(fundName);
            return event;
          });
        });
      }

      // Find the main container of your component

      navSections.querySelectorAll('.nav-sec-sub2 .sub-popup-inner-text2 li,.nav-sec-sub2 ul.sub-popup-inner-text2 ,.nav-sec-sub2 ul.sub-popup-list-content2 ,.nav-sec-sub2 ul.sub-popup-sec1 li ,.nav-sec-sub2 .sub-popup-cont1 ul,.nav-sec-sub2 ul.nav-sec-inner-text2 li ,.nav-sec-sub2 ul').forEach((li) => replaceTag(li, 'span'));
      navSections.querySelectorAll('.nav-sec-sub3 .sub-popup-inner-text2 li ,.nav-sec-sub3 ul.sub-popup-inner-text2 ,.nav-sec-sub3 ul.sub-popup-list-content2 ,.nav-sec-sub3 ul.sub-popup-sec1 li ,.nav-sec-sub3 .sub-popup-cont1 ul,.nav-sec-sub3 ul').forEach((li) => replaceTag(li, 'span'));

      navSections.querySelectorAll('.nav-sec-sub4 .sub-popup-inner-text2 li, .nav-sec-sub4 ul.sub-popup-inner-text2 ,.nav-sec-sub4 ul.sub-popup-list-content2 ,.nav-sec-sub4 ul.sub-popup-sec1 li ,.nav-sec-sub4 .sub-popup-cont1 ul,.nav-sec-sub4 ul').forEach((li) => replaceTag(li, 'span'));

      navSections.querySelectorAll('.nav-sec-sub5 .sub-popup-inner-text2 li, .nav-sec-sub5 ul.sub-popup-inner-text2 ,.nav-sec-sub5 ul.sub-popup-list-content2 ,.nav-sec-sub5 ul.sub-popup-sec1 li ,.nav-sec-sub5 .sub-popup-cont1 ul,.nav-sec-sub5 ul').forEach((li) => replaceTag(li, 'span'));

      navSections.querySelectorAll('.nav-sec-sub6 .sub-popup-inner-text2 li, .nav-sec-sub6 ul.sub-popup-inner-text2 ,.nav-sec-sub6 ul.sub-popup-list-content2 ,.nav-sec-sub6 ul.sub-popup-sec1 li ,.nav-sec-sub6 .sub-popup-cont1 ul,.nav-sec-sub6 ul').forEach((li) => replaceTag(li, 'span'));

      setTimeout(() => {
        navSections.querySelectorAll('.nav-sec-sub3 li ,.nav-sec-sub4 li,.nav-sec-sub5 li').forEach((li) => replaceTag(li, 'span'));
      }, 1000);

      // navSections.querySelectorAll('ul.sub-popup-inner-text2').forEach(li =>
      // replaceTag(li, 'span'));
      // navSections.querySelectorAll('li.sub-popup-sub1 , li.sub-popup-sub2 ,
      //  li.sub-popup-sub3 , li.sub-popup-sub4').forEach(li => replaceTag(li, 'span'));
      // navSections.querySelectorAll('ul.sub-popup-sec1,ul.sub-popup-sec2').forEach(li =>
      //  replaceTag(li, 'span'));
      // // navSections.querySelectorAll('li.nav-sec-list1').forEach(li =>
      // replaceTag(li, 'span'));
      // navSections.querySelectorAll('ul.nav-sec-inner-text2').forEach(li =>
      // replaceTag(li, 'span'));

      // if (container) {
      //   const altTextMap = {
      //     // FIX 1: Removed unnecessary quotes from valid identifier keys
      //     Article: 'Article',
      //     'youtube-1': 'Video',
      //     'Press-Releases': 'Press Releases',
      //     Interview: 'Interview',
      //     'Article-image-hd': 'Featured article thumbnail',
      //     'play-btnhd': 'Play video',
      //     'currency-video': 'Featured video thumbnail',
      //     'calendar-01': '',
      //   };

      //   const images = container.querySelectorAll('img');
      //   images.forEach((img) => {
      //     // FIX 2: Used object destructuring to get iconName from img.dataset
      //     const { iconName } = img.dataset;
      //     const altText = altTextMap[iconName];
      //     if (altText !== undefined) {
      //       img.setAttribute('alt', altText);
      //       img.setAttribute('aria-label', 'Videos');
      //     }
      //   });
      // }

      applyIconAltText(navSection);
    });

    applyIconAltText(nav);
    dataMapMoObj.CLASS_PREFIXES = [
      'nav-sec-cont',
      'nav-sec-sec',
      'nav-sec-sub',
      'nav-sec-inner-text',
      'nav-sec-list',
      'nav-sec-list-content',
    ];
    dataMapMoObj.addIndexed(navSections);

    if (!Array.from(block.classList).includes('amc-header')) {
      const items = navSections.querySelectorAll('.nav-sec-inner-text1');
      items.forEach((oldEl) => {
        const btn = document.createElement('button');
        btn.className = oldEl.className;
        btn.innerHTML = oldEl.innerHTML;
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-expanded', 'false');
        oldEl.replaceWith(btn);
      });
    }

    const mainblk = block.closest('body')?.querySelector('main');
    if (mainblk && Array.from(block.classList).includes('amc-header') && navSections.querySelector('.nav-sec-sec1') !== null) {
      Array.from(navSections.querySelector('.nav-sec-sec1').children).forEach((eleamc, index) => {
        if (index !== 0 && eleamc.querySelector('a') !== null) {
          eleamc.setAttribute('data-id', eleamc.querySelector('a').getAttribute('href'));
          eleamc.querySelector('a').removeAttribute('href');
          eleamc.addEventListener('click', () => {
            const rawTarget = eleamc.getAttribute('data-id') || '';
            let pathname = rawTarget;
            try {
              const targetUrl = new URL(rawTarget, window.location.href);
              pathname = targetUrl.hash ? targetUrl.hash.slice(1) : targetUrl.pathname.replace(/^\/+/, '');
            } catch (error) {
              pathname = rawTarget.replace(/^#/, '').replace(/^\/+/, '');
            }
            const targetKey = pathname.trim();
            const targetSection = Array.from(mainblk.querySelectorAll('.section')).find((section) => {
              const classMatch = Array.from(section.classList).includes(targetKey);
              const idMatch = section.id === targetKey;
              const dataId = section.getAttribute('data-id') || '';
              const dataMatch = dataId.split(/\s+/).includes(targetKey);
              return classMatch || idMatch || dataMatch;
            });
            if (targetSection) {
              const offset = isDesktop.matches ? 100 : 70;
              window.scrollTo({
                top: targetSection.offsetTop - offset,
                behavior: 'smooth',
              });

              // On mobile, close the hamburger and collapse nav after scrolling.
              if (!isDesktop.matches) {
                // forceExpanded=false closes the menu (toggleMenu inverts the flag internally)
                toggleMenu(nav, navSections, false);
                toggleAllNavSections(navSections, 'false');
              }
            }
          });
        }
      });
    }
  }

  // Rename 'block' to 'headerBlock' in the function definition
  function moveMoEdgeImages(headerBlock) {
    const sec4 = headerBlock.querySelector('.mosl-edge-header .sub-popup-cont1 .sub-popup-sec4');
    const target1 = headerBlock.querySelector(
      '.mosl-edge-header .sub-popup-sub2 .sub-popup-inner-text2 .sub-popup-list1 .sub-popup-list-content1 .sub-popup-list-row1',
    );

    const sec5 = headerBlock.querySelector('.mosl-edge-header .sub-popup-cont1 .sub-popup-sec5');
    const target2 = headerBlock.querySelector(
      '.mosl-edge-header .sub-popup-sub2 .sub-popup-inner-text2 .sub-popup-list2 .sub-popup-list-content1 .sub-popup-list-row1',
    );

    if (sec4 && target1) target1.append(sec4);
    if (sec5 && target2) target2.append(sec5);
    return (sec4 && target1) && (sec5 && target2);
  }

  const observer = new MutationObserver((mutations, observe) => {
    // Pass the outer 'block' variable here
    if (moveMoEdgeImages(block)) {
      observe?.disconnect();
    }
  });

  observer.observe(block, { childList: true, subtree: true });

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search && search.textContent === '') {
      search.setAttribute('aria-label', 'Search');
    }
    dataMapMoObj.CLASS_PREFIXES = [
      'nav-tools-cont',
      'nav-tools-sec',
      'nav-tools-sub',
      'nav-tools-inner-net',
      'nav-tools-list',
      'nav-tools-list-content',
    ];
    dataMapMoObj.addIndexed(navTools);
  }
  const globalSearchStr = div(
    { class: 'globalsearch-container' },
    div(
      { class: 'modal-cross' },
      img({ class: 'modal-close-btn', src: '../../../icons/modal-cross-btn.svg', alt: 'Close Button' }),
    ),
    div(
      { class: 'search-wrapper' },
      div(
        { class: 'uppar-wrapper' },
        div(
          { class: 'search-field' },
          input({ class: 'search-inp', placeholder: 'Search here...' }),
          div(
            { class: 'cancel-search' },
            img({ class: 'cancel-btn', src: '/icons/input-cancel.svg', alt: 'Clear' }),
          ),
        ),
        div(
          { class: 'search-tags' },
          button({ class: 'tag-btn active' }, 'All'),
          button({ class: 'tag-btn' }, 'Funds'),
          button({ class: 'tag-btn' }, 'Blogs'),
          button({ class: 'tag-btn' }, 'Calculators'),
          button({ class: 'tag-btn' }, 'FAQs'),
          button({ class: 'tag-btn' }, 'Documents'),
          button({ class: 'tag-btn' }, 'Others'),
        ),
      ),
      div(
        { class: 'searched-content' },
        // div(
        //   { class: 'search-list' },
        //   p({ class: 'list-desc' }, 'Motilal Oswal 5 Year G-Sec Fund Of Fund Direct Growth'),
        //   p({ class: 'list-value' }, 'Return 1Y: '
        // , strong({ class: 'list-value-strong' }, '7.91')),
        // ),
        // div(
        //   { class: 'search-list' },
        //   p({ class: 'list-desc' }, 'Motilal Oswal Active Momentum Fund Direct Growth'),
        //   p({ class: 'list-value' }, strong({ class: 'list-value-strong' })),
        // ),
        // div(
        //   { class: 'search-list' },
        //   p({ class: 'list-desc' }, 'Motilal Oswal Asset A
        // llocation Passive Fund of Fund Conservative Direct Growth'),
        //   p({ class: 'list-value' }, 'Return 1Y: ', stron
        // g({ class: 'list-value-strong' }, '7.91')),
        // ),
        // div(
        //   { class: 'search-list' },
        //   p({ class: 'list-desc' }, 'Motilal Oswal Balanced Advantage Fund Direct Growth'),
        //   p({ class: 'list-value' }, 'Return 1Y: ', str
        // ong({ class: 'list-value-strong' }, '-12.38')),
        // ),
        // div(
        //   { class: 'search-list' },
        //   p({ class: 'list-desc' }, 'Motilal Oswal BSE 1000 Index Fund Direct Growth'),
        //   p({ class: 'list-value' }, strong({ class: 'list-value-strong' })),
        // ),
      ),
    ),
  );

  document.addEventListener('click', async (event) => {
    // const searchBtn = event.target.classList.contains('nav-tools-list-content1');
    // const globalSearchModal = event.target.closest('.globalsearch-container');
    // const globalModalCross = globalSearchModal ? globalSearchModal.querySelector('.modal-cross') : null;
    // const searchDialog = event.target.closest('dialog');

    // if (searchBtn && !event.target.closest('.nav-tools-sub4')) {
    //   // event.preventDefault();
    //   // event.stopPropagation();
    //   const videoContainer = document.createElement('div');
    //   videoContainer.append(globalSearchStr);
    //   // search logic
    //   // om input call

    //   // Assuming createModal is a helper function you've defined
    //   const { showModal } = await createModal([videoContainer]);
    //   showModal();

    //   if (videoContainer) {
    //     const modalBlock = videoContainer.closest('main').querySelector('.modal.block');
    //     if (modalBlock.querySelector('.globalsearch-container')) {
    //       modalBlock.classList.add('search-modal');
    //     }

    //     // Add search input functionality
    //     const searchInput = videoContainer.querySelector('.search-inp');
    //     const searchField = videoContainer.querySelector('.search-field');
    //     if (searchInput) {
    //       let searchTimeout;
    //       let lastSearchQuery = '';

    //       searchInput.addEventListener('input', async (e) => {
    //         const query = e.target.value.trim();

    //         console.log('Search input triggered:', query);

    //         // Add/remove input-active class based on query length
    //         if (query.length >= 3) {
    //           searchField.classList.add('input-active');
    //         } else {
    //           searchField.classList.remove('input-active');
    //         }

    //         // Clear previous timeout for throttling
    //         if (searchTimeout) {
    //           clearTimeout(searchTimeout);
    //         }

    //         // Only make API call if input is more than 3 characters
    //         if (query.length >= 3) {
    //           // Throttle: Wait 300ms before making API call
    //           searchTimeout = setTimeout(async () => {
    //             // Skip if query hasn't changed
    //             if (query === lastSearchQuery) {
    //               console.log('Query unchanged, skipping API call');
    //               return;
    //             }

    //             lastSearchQuery = query;
    //             console.log('Making API call for query:', query);

    //             const searchedContent = videoContainer.querySelector('.searched-content');
    //             const searchTags = videoContainer.querySelector('.search-tags');

    //             // Show loading state
    //             if (searchedContent) {
    //               searchedContent.innerHTML = '<p class="no-results">Loading results...</p>';
    //             }

    //             try {
    //               const apiUrl = `https://uat-api.motilaloswalmf.com/api/public/v1/opensearch/searchContent?query=${encodeURIComponent(query)}`;
    //               console.log('API URL:', apiUrl);

    //               const response = await fetch(apiUrl);
    //               console.log('API Response Status:', response.status);

    //               if (!response.ok) {
    //                 throw new Error(`API error: ${response.status}`);
    //               }

    //               const data = await response.json();
    //               console.log('API Response Data:', data);

    //               if (searchedContent && data) {
    //                 // Combine all results and categorize them
    //                 const allResults = {
    //                   All: [
    //                     ...(data.funds || []),
    //                     ...(data.blogs || []),
    //                     ...(data.tools || []),
    //                     ...(data.documents || []),
    //                     ...(data.faqs || []),
    //                   ],
    //                   Funds: data.funds || [],
    //                   Blogs: data.blogs || [],
    //                   Calculators: data.tools || [],
    //                   Documents: data.documents || [],
    //                   FAQs: data.faqs || [],
    //                 };

    //                 console.log('Categorized results:', {
    //                   All: allResults.All.length,
    //                   Funds: allResults.Funds.length,
    //                   Blogs: allResults.Blogs.length,
    //                   Calculators: allResults.Calculators.length,
    //                   Documents: allResults.Documents.length,
    //                   FAQs: allResults.FAQs.length,
    //                 });

    //                 // Remove empty categories
    //                 const categoriesWithResults = Object.keys(allResults)
    //                   .filter((cat) => allResults[cat].length > 0);

    //                 // Update tabs dynamically
    //                 if (searchTags && categoriesWithResults.length > 0) {
    //                   const existingTags = searchTags.querySelectorAll('.tag-btn');
    //                   existingTags.forEach((tag) => {
    //                     tag.remove();
    //                   });

    //                   // Add tags-active class to show tags
    //                   searchTags.classList.add('tags-active');

    //                   console.log('Creating tabs for categories:', categoriesWithResults);

    //                   categoriesWithResults.forEach((category) => {
    //                     const tagBtn = document.createElement('button');
    //                     tagBtn.className = `tag-btn ${category === 'All' ? 'active' : ''}`;
    //                     tagBtn.textContent = category;
    //                     tagBtn.addEventListener('click', () => {
    //                       console.log('Tab clicked:', category);
    //                       // Remove active class from all buttons
    //                       searchTags.querySelectorAll('.tag-btn').forEach((btn) => {
    //                         btn.classList.remove('active');
    //                       });
    //                       // Add active class to clicked button
    //                       tagBtn.classList.add('active');
    //                       // Render filtered results
    //                       renderSearchResults(allResults[category]);
    //                     });
    //                     searchTags.appendChild(tagBtn);
    //                   });
    //                 }

    //                 // Render all results initially
    //                 const searchedContent = videoContainer.querySelector('.searched-content');
    //                 const globalSearchContainer = videoContainer.querySelector('.globalsearch-container');
    //                 if (globalSearchContainer) {
    //                   globalSearchContainer.classList.add('results-active');
    //                 }
    //                 renderSearchResults(allResults.All);
    //               }
    //             } catch (error) {
    //               console.error('Search API Error:', error);
    //               if (searchedContent) {
    //                 searchedContent.innerHTML = '<p class="no-results">Error loading results. Please try again.</p>';
    //               }
    //             }
    //           }, 300); // Throttle delay of 300ms
    //         } else if (query.length === 0) {
    //           console.log('Search cleared');
    //           lastSearchQuery = '';
    //           const searchedContent = videoContainer.querySelector('.searched-content');
    //           const globalSearchContainer = videoContainer.querySelector('.globalsearch-container');
    //           const searchTags = videoContainer.querySelector('.search-tags');
    //           if (searchedContent) {
    //             searchedContent.innerHTML = '';
    //           }
    //           if (globalSearchContainer) {
    //             globalSearchContainer.classList.remove('results-active');
    //           }
    //           if (searchTags) {
    //             searchTags.classList.remove('tags-active');
    //           }
    //         } else {
    //           console.log('Query too short:', query.length, 'characters (minimum 4 required)');
    //         }

    //         // Render function
    //         function renderSearchResults(items) {
    //           const searchedContent = document.querySelector('.searched-content');
    //           // videoContainer.querySelector('.searched-content');
    //           searchedContent.innerHTML = '';

    //           console.log('Rendering', items.length, 'results');

    //           if (!items || items.length === 0) {
    //             searchedContent.innerHTML = '<p class="no-results">No results found</p>';
    //             return;
    //           }

    //           items.forEach((item, index) => {
    //             const resultDiv = document.createElement('div');
    //             resultDiv.className = 'search-list';
    //             resultDiv.style.cursor = 'pointer';

    //             // Determine the display text and link
    //             const itemTitle = item.title.replaceAll('|', '').split('-').join(' ').trim() || item.description || 'Unknown';
    //             let itemPageUrl = item.pageUrl || '#';
    //             const documentOnlyRegex = /\.(pdf|docx?|xlsx?|csv|txt|pptx?)$/i;
    //             if (documentOnlyRegex.test(item.id)) {
    //               itemPageUrl = item.id;
    //             }

    //             resultDiv.innerHTML = `
    //               <p class="list-desc">${dataMapMoObj.toTitleCase(itemTitle)}</p>
    //               <p class="list-value"></p>
    //             `;

    //             // Add click handler to redirect to item page
    //             resultDiv.addEventListener('click', () => {
    //               if (itemPageUrl && itemPageUrl !== '#') {
    //                 let redirectUrl = itemPageUrl;
    //                 if (documentOnlyRegex.test(itemPageUrl)) {
    //                   // Open in NEW tab for documents
    //                   fetch(itemPageUrl)
    //                     .then((response) => response.blob())
    //                     .then((blob) => {
    //                       const blobUrl = URL.createObjectURL(blob);
    //                       window.open(blobUrl, '_blank');

    //                       // Clean up the URL object memory after a short delay
    //                       setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    //                     })
    //                     .catch((err) => {
    //                       console.error('Could not open PDF:', err);
    //                       // Fallback to standard open if fetch fails
    //                       window.open(itemPageUrl, '_blank');
    //                     });

    //                   return false;
    //                   // window.open(itemPageUrl, '_blank');
    //                   // return false;
    //                 }
    //                 // Remove content path prefix
    //                 redirectUrl = redirectUrl.replace('/content/moamc-eds/mutual-fund/in/en', '');
    //                 console.log('Redirecting to:', redirectUrl);
    //                 window.location.href = redirectUrl;
    //               }
    //             });

    //             searchedContent.appendChild(resultDiv);
    //           });
    //         }
    //       });

    //       // Add clear search functionality
    //       const cancelBtn = videoContainer.querySelector('.cancel-btn');
    //       if (cancelBtn) {
    //         cancelBtn.parentElement.addEventListener('click', () => {
    //           console.log('Cancel search clicked');
    //           searchInput.value = '';
    //           lastSearchQuery = '';
    //           searchField.classList.remove('input-active');

    //           // Reset to default content
    //           const searchedContent = videoContainer.querySelector('.searched-content');
    //           const globalSearchContainer = videoContainer.querySelector('.globalsearch-container');
    //           const searchTags = videoContainer.querySelector('.search-tags');

    //           // Clear search content
    //           if (searchedContent) {
    //             searchedContent.innerHTML = '';
    //           }
    //           if (globalSearchContainer) {
    //             globalSearchContainer.classList.remove('results-active');
    //           }

    //           // Reset tags to default
    //           if (searchTags) {
    //             const existingTags = searchTags.querySelectorAll('.tag-btn');
    //             existingTags.forEach((tag) => {
    //               tag.remove();
    //             });

    //             // Remove tags-active class to hide tags on cancel
    //             searchTags.classList.remove('tags-active');

    //             // Add default tags back
    //             const defaultTags = ['All', 'Funds', 'Blogs', 'Calculators', 'FAQs', 'Documents', 'Others'];
    //             defaultTags.forEach((tagText, index) => {
    //               const tagBtn = document.createElement('button');
    //               tagBtn.className = `tag-btn ${index === 0 ? 'active' : ''}`;
    //               tagBtn.textContent = tagText;
    //               searchTags.appendChild(tagBtn);
    //             });
    //           }

    //           searchInput.focus();
    //         });
    //       }
    //     }
    //   }
    // }

    // if (!globalSearchModal && searchDialog && searchDialog.querySelector('.globalsearch-container')) {
    //   // if (globalSearchModal !== null) {
    //   searchDialog.close();
    //   // }
    //   return false;
    // }
    // if (searchDialog && searchDialog?.open && searchDialog.querySelector('.globalsearch-container') && globalModalCross) {
    //   if (!event.target.classList.contains('search-inp') && !event.target.closest('.nav-tools-sub4') && !event.target.closest('.upper-wrapper')) {
    //     if (event.target.closest('.search-tags')) {
    //       return false;
    //     } if (event.target.classList.contains('cancel-btn')) {
    //       searchDialog.querySelector('input').value = '';
    //     } else if (event.target.classList.contains('modal-close-btn')) {
    //       searchDialog.close();
    //     }
    //   }
    // }
    if (event.target.closest('.footer') && event.target.closest('.section-content1') && !event.target.closest('.footer-section4') && !event.target.closest('.footer-section1')) {
      if (!Array.from(event.target.classList).includes('list-items1')) {
        const textCurr = event.target.textContent
          .toLowerCase().replaceAll(' funds', '');
        let joinstr = textCurr.split(' ').join('-').toLowerCase();
        // console.log(joinstr);
        if (joinstr === 'index') {
          joinstr = 'index-funds';
        }
        dataMapMoObj.selectviewFunds = joinstr;

        localStorage.setItem('viewmark', dataMapMoObj.selectviewFunds);
        // const pathname = '/mutual-fund/in/en/mutual-funds';
        const pathname = '/mutual-funds';
        window.location.href = `${window.location.origin}${pathname}`;
      }
    }
    if (event.target.closest('.footer') && event.target.closest('.footer-section1')) {
      if (window.location.origin.includes('motilaloswalmf')) {
        window.location.href = `${window.location.origin}/`;
      }
      if (window.location.origin.includes('motilaloswalamc')) {
        window.location.href = `${window.location.origin}/`;
      }
    }
    return false;
  });
  const headerTop = nav.querySelector('.section.header-top');
  if (headerTop) {
    dataMapMoObj.CLASS_PREFIXES = [
      'header-top-cont',
      'header-top-sec',
      'header-top-sub',
      'header-top-inner-text',
      'header-top-list',
      'header-top-list-content',
    ];
    dataMapMoObj.addIndexed(headerTop);

    const headerTopItems = headerTop?.querySelectorAll('.header-top-sec1 > li');
    headerTopItems?.forEach((item) => {
      item.setAttribute('tabindex', 0);
    });
  }
  if (headerTop !== null) {
    const getDropTrigger = headerTop.querySelector('.header-top-sec1 .header-top-sub5 .header-top-inner-text1');
    const dropMenu = headerTop.querySelector('.header-top-sec1 .header-top-sub5 .header-top-inner-text2');

    const dropTrigger = document.createElement('button');
    dropTrigger.className = getDropTrigger.className;
    dropTrigger.innerHTML = getDropTrigger.innerHTML;
    // replace the getDropTrigger p tag with button
    getDropTrigger.replaceWith(dropTrigger);

    dropTrigger.setAttribute('aria-expanded', false);
    dropTrigger.setAttribute('aria-label', dropTrigger.innerHTML);

    if (dropTrigger && dropMenu) {
      dropTrigger.addEventListener('click', (event) => {
        event.stopPropagation();
        // toggle attr
        const isExpanded = dropTrigger.getAttribute('aria-expanded') === 'true';
        dropTrigger.setAttribute('aria-expanded', !isExpanded);

        dropMenu.classList.toggle('open');
        dropTrigger.classList.toggle('active');
        const logineventab = block.querySelector('.nav-tools .nav-tools-sub4 .nav-tools-inner-net1');
        const nextel = logineventab.nextElementSibling;
        if (nextel.style.display === 'block') {
          nextel.style.display = 'none';
        }
        const dropdownTrigge = navBrand.querySelector('.navbrand-sec3 .navbrand-inner-net1');
        const dropdownMer = navBrand.querySelector('.navbrand-sec3 .navbrand-inner-net2');
        if (dropdownMer.classList.contains('open')) {
          dropdownMer.classList.remove('open');
          dropdownTrigge.classList.remove('active');
        }
      });

      dropMenu.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      document.addEventListener('click', (event) => {
        if (dropMenu.classList.contains('open')) {
          dropMenu.classList.remove('open');
          dropTrigger.classList.remove('active');
        }
        if (!navSections.contains(event.target)) {
          toggleAllNavSections(navSections);
          document.body.classList.remove('no-scroll');
        }
      });
    }
  }

  const nfoBanner = nav.querySelector('.section.nfo-banner');
  if (nfoBanner) {
    dataMapMoObj.CLASS_PREFIXES = [
      'nfo-banner-cont',
      'nfo-banner-sec',
      'nfo-banner-sub',
      'nfo-banner-inner-text',
      'nfo-banner-list',
      'nfo-banner-list-content',
    ];
    dataMapMoObj.addIndexed(nfoBanner);

    const startdate = nfoBanner.querySelector('p:nth-child(1)').textContent.trim();
    const enddate = nfoBanner.querySelector('p:nth-child(2)').textContent.trim();
    const fundname = nfoBanner.querySelector('p:nth-child(3)').textContent.trim();

    const shouldShowCard = (nfoStartDate, nfoEndDate) => {
      if (!nfoStartDate || !nfoEndDate) return false;
      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      function parseDate(dateStr, isEndDate) {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = monthMap[parts[1]];
        const year = parseInt(parts[2], 10);
        if (!day || month === undefined || !year) return null;
        return isEndDate
          ? new Date(year, month, day, 23, 59, 59, 999)
          : new Date(year, month, day, 0, 0, 0, 0);
      }
      const start = parseDate(nfoStartDate, false);
      const end = parseDate(nfoEndDate, true);
      if (!start || !end || start > end) return false;
      const now = new Date();
      return now >= start && now <= end;
    };
    function formatDate(input) {
      const [dayStr, month, year] = input.split('-');
      const day = parseInt(dayStr, 10);

      let suffix = 'th';
      if (day % 10 === 1 && day !== 11) suffix = 'st';
      else if (day % 10 === 2 && day !== 12) suffix = 'nd';
      else if (day % 10 === 3 && day !== 13) suffix = 'rd';

      return `${dayStr}${suffix} ${month} ${year}`;
    }
    if (shouldShowCard(startdate, enddate)) {
      const formattedEndDate = formatDate(enddate);
      nfoBanner.querySelector('ul li ul li:nth-child(3)').textContent = '';
      // nfoBanner.querySelector('ul li ul li:nth-child(3)').textContent = `Ends On: ${enddate.replaceAll('-', ' ')}`;
      nfoBanner.querySelector('ul li ul li:nth-child(3)').textContent = `Ends On: ${formattedEndDate}`;
      nfoBanner.querySelector('ul li ul li:nth-child(4)').textContent = '';
      nfoBanner.querySelector('ul li ul li:nth-child(4)').textContent = ` ${fundname}`;
      let nameFund;
      if (fundname.includes('&')) {
        nameFund = fundname.replaceAll('&', 'and').split(' ').join('-');
      } else {
        nameFund = fundname.split(' ').join('-');
      }
      nfoBanner.querySelector('ul').querySelector('.nfo-banner-list2 a').removeAttribute('href');
      const linkurl = `/mutual-funds/${nameFund.toLocaleLowerCase()}`;
      nfoBanner.querySelector('ul').querySelector('.nfo-banner-list2 a').setAttribute('href', linkurl);
    } else {
      const navmain = block.closest('body');
      const navblk = navmain.querySelector('main');
      nfoBanner.style.display = 'none';
      navblk?.classList.remove('nfo-nav');
      nav?.classList.remove('nfo-nav');
      if (navmain !== null) {
        const header = navmain.querySelector('header');
        const breadFdp = navmain.querySelector('.breadcrumbs-fdp');
        const fdpDefault = navmain.querySelector('.fdp-card-container .default-content-wrapper');

        const setHeaderPadding = () => {
          if (window.innerWidth <= 900) {
            header.style.paddingTop = '56px'; // mobile
            if (breadFdp && fdpDefault) {
              breadFdp.style.top = '56px'; // mobile
              fdpDefault.classList.add('sticky-fix'); // mobile
            }
          } else {
            header.style.paddingTop = '88px'; // desktop
            if (breadFdp && fdpDefault) {
              breadFdp.style.top = '88px'; // desktop
              fdpDefault.classList.add('sticky-fix'); // desktop
            }
          }
        };

        setHeaderPadding(); // initial
        window.addEventListener('resize', setHeaderPadding);
      }
    }
  }
  (function initializeNfoBanner() {
    try {
      const setupUI = () => {
        const liveIndicatorContainerWrapper = nfoBanner.querySelector('.nfo-banner-sub1');
        liveIndicatorContainerWrapper.setAttribute('tabindex', 0);
        const listliveIndicatorContainerWrapper = nfoBanner.querySelectorAll('.nfo-banner-sub1 li,.nfo-banner-sub1 ul');
        listliveIndicatorContainerWrapper.forEach((each) => {
          replaceTag(each, 'span');
        });

        const liveIndicatorContainer = nfoBanner.querySelector('.nfo-banner-sub1 .nfo-banner-list1');
        const callBackBtn = nfoBanner.querySelector('.nfo-banner-sub2 .nfo-banner-list1');
        callBackBtn.setAttribute('tabindex', -1);
        replaceTag(callBackBtn, 'span');

        const nfoList2 = nfoBanner.querySelector('.nfo-banner-sub1 .nfo-banner-list2');
        if (nfoList2) {
          nfoList2.setAttribute('tabindex', 0);
        }

        const liveIndicatorContainerInvestbutton = nfoBanner.querySelector('.nfo-banner-sub2 .nfo-banner-list2');
        liveIndicatorContainerInvestbutton.setAttribute('tabindex', 0);
        replaceTag(liveIndicatorContainerInvestbutton, 'span');

        const liveIndicatorContainerUl = nfoBanner.querySelector('.nfo-banner-sub2 ul');
        replaceTag(liveIndicatorContainerUl, 'span');

        const liveIndicatorContainerInvestbuttonLi = nfoBanner.querySelector('li.nfo-banner-sub2');
        replaceTag(liveIndicatorContainerInvestbuttonLi, 'span');

        const elementsToReplace = [
          nfoBanner.querySelector('.nfo-banner-sec1 li'),
          nfoBanner.querySelector('.nfo-banner-cont1 ul'),
        ];

        elementsToReplace.forEach((el, i) => {
          if (el) {
            const newEl = replaceTag(el, 'span');
            console.log(`Replaced element ${i + 1}:`, newEl);
          }
        });

        if (liveIndicatorContainer) {
          const liveIndicator = document.createElement('div');
          liveIndicator.className = 'live-indicator';
          liveIndicatorContainer.appendChild(liveIndicator);
          liveIndicatorContainer.setAttribute('tabindex', -1);
        }

        const timerContainer = nfoBanner.querySelector('.nfo-banner-sub1 .nfo-banner-list3');
        if (timerContainer) {
          const timerElement = document.createElement('span');
          timerElement.id = 'countdown-timer';
          timerElement.textContent = '00d : 00h : 00m';
          timerContainer.appendChild(timerElement);
          return timerElement;
        }

        return null;
      };

      const startCountdown = (element) => {
        if (!element) {
          return;
        }

        const COUNTDOWN_DAYS = 2;
        const COUNTDOWN_HOURS = 20;
        const COUNTDOWN_MINUTES = 20;
        const ONE_SECOND_MS = 1000;

        const countDownDate = new Date();
        countDownDate.setDate(countDownDate.getDate() + COUNTDOWN_DAYS);
        countDownDate.setHours(countDownDate.getHours() + COUNTDOWN_HOURS);
        countDownDate.setMinutes(countDownDate.getMinutes() + COUNTDOWN_MINUTES);
        const countDownTime = countDownDate.getTime();

        const interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = countDownTime - now;

          if (distance < 0) {
            clearInterval(interval);
            element.textContent = 'EXPIRED';
            return;
          }

          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

          const pad = (num) => String(num).padStart(2, '0');

          element.textContent = `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m`;
        }, ONE_SECOND_MS);
      };

      const timerElement = setupUI();
      startCountdown(timerElement);
    } catch (error) {
      // console.log(error);
    }
  }());

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => {
    toggleMenu(nav, navSections);
    toggleAllNavSections(navSections, 'false');
  });
  nav.prepend(hamburger);
  // nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
  async function removeClassAfterDelay() {
    await delay(800);
    navSections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach(() => {
      // section.querySelectorAll('ul').forEach((elul) => {
      //   elul.style.display = 'none';
      // });
      // const navshort = navSections.querySelector('ul').children[1];
      // const navsort = navshort.querySelector('.default-content-wrapper').firstElementChild;
      // navsort.querySelector('.li:nth-child(2)').style.display = 'flex';
      // navsort.querySelector('.sub-popup-list6 .sub-popup-list-content2').style.display = 'flex';

      const navinner = navSections.querySelector('.nav-sec-list1 .sub-popup-sub3 .sub-popup-inner-text2');
      if (navinner !== null) {
        navinner.querySelectorAll('ul,span').forEach((navel) => { navel.style.display = 'block'; });
      }
      if (navinner !== null) {
        navinner.querySelectorAll('ul,span').forEach((navel) => { navel.style.display = 'block'; });
      }

      const navinnfive = navSections.querySelector('.nav-sec-sub5 .sub-popup-sub2 .sub-popup-inner-text2');
      if (navinnfive !== null) {
        navinnfive.querySelectorAll('ul,span').forEach((five) => { five.style.display = 'block'; });
      }

      const navinnfour = navSections.querySelector('.nav-sec-sub4 .sub-popup-sub2 .sub-popup-inner-text2');
      if (navinnfour !== null) {
        navinnfour.querySelectorAll('ul,span').forEach((four) => { four.style.display = 'block'; });
      }
    });
  }
  // Using !isDesktop.matches instead of window.innerWidth to avoid forced reflow
  if (!isDesktop.matches) {
    removeClassAfterDelay();
    // const navContainer = document.querySelectorAll('.nav-drop');
    // navContainer.addEventListener('click')
    // navContainer.addEventListener('click', (event) => {
    //   event.stopPropagation();
    //   const clickedListItem = event.target.closest('li.comlist');
    //   if (!clickedListItem) {
    //     return;
    //   }
    //   const submenu = clickedListItem.querySelector(':scope > ul');
    //   if (!submenu) {
    //     return;
    //   }
    //   if (submenu.style.display === 'block') {
    //     submenu.style.display = 'none';
    //     submenu.closest('li').setAttribute('aria-expanded', 'false');
    //   } else {
    //     submenu.style.display = 'block';
    //     if (submenu.querySelector('.default-content-wrapper') !== null) {
    //       const subfilt = Array.from(submenu.querySelector('.default-content-wrapper').children);
    //       subfilt.forEach((elulsub) => {
    //         elulsub.style.display = 'block';
    //       });
    //     }
    //     submenu.closest('li').setAttribute('aria-expanded', 'true');
    //     if (submenu.closest('.nav-sec-sub2')) {
    //       const mosub = submenu.querySelector('.sub-popup-sec1 .sub-popup-sub3');
    //       if (mosub) {
    //         mosub.querySelector('.sub-popup-list5 ul').style.display = 'block';
    //         mosub.querySelector('.sub-popup-list6 ul').style.display = 'block';
    //       }
    //     }
    //   }
    // });
  }

  const searchtemp = block.querySelector('.nav-tools .nav-tools-sec1 .nav-tools-inner-net1');

  const items = block.querySelectorAll('.nav-tools .nav-tools-sec1');
  items.forEach((item) => {
    // get all elements inside this item
    const imgs = item.querySelectorAll('[data-icon-name]');

    imgs.forEach((img) => {
      const iconName = img.getAttribute('data-icon-name');

      if (iconName) {
        img.setAttribute('alt', iconName);
      }
    });
  });

  // const iconcls = searchtemp !== null ? searchtemp.querySelector('.nav-tools-list-content1') : '';
  const navmain = block.closest('body');
  const navblk = navmain.querySelector('main');
  // navblk.classList.add('nfo-nav');
  // if (iconcls !== '') {
  //   iconcls.addEventListener('click', () => {
  //     const nfoban = block.querySelector('.nfo-banner');
  //     const navelement = block.querySelector('nav');
  //     if (nfoban.style.display === 'none') {
  //       nfoban.style.display = 'block';
  //       navblk.classList.add('nfo-nav');
  //       navelement.classList.add('nfo-nav');
  //     } else {
  //       // nfoban.style.display = 'none';
  //       // navblk.classList.remove('nfo-nav');
  //       // navelement.classList.remove('nfo-nav');
  //     }
  //   });
  // }

  const loginevent = block.querySelector('.nav-tools .nav-tools-sub4');// .nav-tools-inner-net1');
  if (loginevent !== null) {
    const getLogineventab = loginevent.querySelector('.nav-tools .nav-tools-sub4 .nav-tools-inner-net1');
    // const createLoginbutton = document.createElement('button');
    // createLoginbutton.className = getLogineventab.className;
    // createLoginbutton.innerHTML = getLogineventab.innerHTML;
    // createLoginbutton.setAttribute('aria-label', getLogineventab.innerHTML);
    // getLogineventab.replaceWith(createLoginbutton);

    loginevent.addEventListener('click', () => {
      const nextel = loginevent.querySelector('ul');
      if (nextel.style.display === 'none') {
        nextel.style.display = 'block';
      } else {
        nextel.style.display = 'none';
      }
      try {
        trackLoginButton();
      } catch (error) {
        console.error('Error while calling trackLoginButton:', error);
      }
    });
  }
  // Array.from(loginevent.querySelectorAll('a')).forEach((anchor) => {
  //   // anchor.removeAttribute('href');
  // });
  document.addEventListener('click', (event) => {
    try {
      const logineventab = block.querySelector('.nav-tools .nav-tools-sub4 .nav-tools-inner-net1');
      if (!logineventab.contains(event.target)) {
        const nextel = logineventab.nextElementSibling;
        nextel.style.display = 'none';
      }
      if (event.target?.closest('.privacy-policy-banner')) {
        const clickedDetails = event.target.closest('details');
        if (!clickedDetails) return;
        event.preventDefault();
        const banner = event.target.closest('.privacy-policy-banner');
        const allItems = banner.querySelector('.accordion')?.children;
        if (allItems) {
          Array.from(allItems).forEach((otherItem) => {
            // 3. Remove 'open' from everything else
            if (otherItem !== clickedDetails) {
              otherItem.removeAttribute('open');
            }
          });
        }

        // 4. Manually toggle the clicked one
        if (clickedDetails.hasAttribute('open')) {
          clickedDetails.removeAttribute('open');
        } else {
          clickedDetails.setAttribute('open', '');
        }
      }
    } catch (error) {
      // console.log(error)
    }
  });
  const userProfile = block.querySelector('.nav-tools .nav-tools-sub4');
  if (userProfile && userProfile.querySelector('.nav-tools-inner-net2 .icon-user-icon-header img')) {
    dataMapMoObj.altFunction(
      userProfile.querySelector('.nav-tools-inner-net2 .icon-user-icon-header img'),
      'User Profile',
    );
  }
  navblk?.classList?.remove('top-nave');

  //
  document.addEventListener('scroll', () => {
    try {
      if (dropdownTrigger && dropdownTrigger.classList.contains('active')) {
        dropdownTrigger.classList.remove('active');
      }

      if (dropdownMenu && dropdownMenu.classList.contains('open')) {
        dropdownMenu.classList.remove('open');
      }
    } catch (error) {
      // console.error('Error in scroll event handler:', error);
    }
  });

  delay(1000).then(() => {
    Array.from(navSections.querySelector('ul').children).forEach((navSection, indexNav) => {
      // --- YOUR EXISTING DOWNWARD LOGIC (Keep as is) ---
      if (navSection.querySelector('button > span') !== null && indexNav !== 0) {
        navSection.querySelector('button > span').addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            leaveTimer = setTimeout(() => {
              toggleAllNavSections(navSections, false);
              navSection.setAttribute('data-aria-expanded', 'false');
              const btn = navSection.querySelector('.nav-sec-inner-text1');
              if (btn) btn.setAttribute('aria-expanded', 'false');
              document.body.classList.remove('no-scroll');
            }, 300);
          }
        });
      }

      // --- ADDED: UPWARD EXIT LOGIC ---
      // Attaching to navSection (the <li>) ensures that when the mouse
      // moves up into the header/top-bar, the menu closes.
      if (indexNav !== 0) {
        navSection.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            // Start timer to close if moving UP out of the whole item area
            leaveTimer = setTimeout(() => {
              toggleAllNavSections(navSections, false);
              navSection.setAttribute('data-aria-expanded', 'false');
              const btn = navSection.querySelector('.nav-sec-inner-text1');
              if (btn) btn.setAttribute('aria-expanded', 'false');
              document.body.classList.remove('no-scroll');
            }, 300);
          }
        });

        // Prevent flickering: Clear the timer if the user moves back in
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            if (typeof leaveTimer !== 'undefined') clearTimeout(leaveTimer);
            // Adding target when menu becomes visible
            navSection.querySelectorAll(
              '.nav-sec-sec1 .nav-sec-sub4 .sub-popup-sec2 .sub-popup-inner-text2 a',
            ).forEach((link) => {
              if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
              }
            });
          }
        });
      }
    });
  });

  // // Create skip link if it doesn't exist
  // if (!document.getElementById('skip-link')) {
  //   const skipLink = document.createElement('a');
  //   skipLink.id = 'skip-link';
  //   skipLink.href = '#main-content'; // Target the ID on your <main> element
  //   skipLink.className = 'skip-to-main';
  //   skipLink.textContent = 'Skip to main content';

  //   // Ensure it is the absolute first element in the body
  //   document.body.prepend(skipLink);
  // }

  // // Ensure <main> has the corresponding ID
  // const main = document.querySelector('main');
  // if (main && !main.id) {
  //   main.id = 'main-content';
  //   main.setAttribute('tabindex', '-1'); // Allows programmatic focus in some browsers
  // }
}
