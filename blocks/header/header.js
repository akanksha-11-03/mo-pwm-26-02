import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      nav.classList.remove('menu-open');
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      const btn = nav.querySelector('button');
      if (btn) btn.focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
      nav.classList.remove('menu-open');
    } else if (!isDesktop.matches && e.relatedTarget) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.classList.contains('nav-drop');
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
    const navEl = focused.closest('nav');
    if (navEl) navEl.classList.toggle('menu-open', !dropExpanded);
  }
}

function focusNavSection() {
  // Remove first to prevent duplicate listeners from stacking
  document.activeElement.removeEventListener('keydown', openOnKeydown);
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
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
  document.body.style.overflow = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
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
  // Always remove first to prevent duplicate listeners from stacking
  window.removeEventListener('keydown', closeOnEscape);
  nav.removeEventListener('focusout', closeOnFocusLost);
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
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
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const btnContainer = brandLink.closest('.button-container');
      if (btnContainer) btnContainer.className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  const closeTimeouts = new Map();
  if (navSections) {
    // Prevent clicks inside nav-sections from closing hamburger menu on mobile
    navSections.addEventListener('click', (e) => {
      if (!isDesktop.matches) {
        e.stopPropagation();
      }
    });

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      // Expand nav-drop on hover (desktop only)
      navSection.addEventListener('mouseenter', () => {
        if (isDesktop.matches && navSection.classList.contains('nav-drop')) {
          // Cancel ALL pending close timeouts to prevent stale removals
          closeTimeouts.forEach((timeout) => clearTimeout(timeout));
          closeTimeouts.clear();
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', 'true');
          nav.classList.add('menu-open');
          // Remove active state from header-tool
          const activeTool = nav.querySelector('.header-toollist-2.active');
          if (activeTool) activeTool.classList.remove('active');
        }
      });
      // Collapse nav-drop on mouse leave with a small delay to allow moving to dropdown
      navSection.addEventListener('mouseleave', () => {
        if (isDesktop.matches && navSection.classList.contains('nav-drop')) {
          const timeout = setTimeout(() => {
            navSection.setAttribute('aria-expanded', 'false');
            // Also reset active states on sub-items
            navSection.querySelectorAll('.menulist-item-2 .item-li').forEach((li) => {
              li.classList.remove('active');
              li.setAttribute('aria-expanded', 'false');
            });
            closeTimeouts.delete(navSection);
            // Only remove menu-open if no other nav-drop is still expanded
            const anyExpanded = navSections.querySelector(':scope .default-content-wrapper > ul > li[aria-expanded="true"]');
            if (!anyExpanded) {
              nav.classList.remove('menu-open');
            }
          }, 1000);
          closeTimeouts.set(navSection, timeout);
        }
      });
      navSection.addEventListener('click', (e) => {
        if (isDesktop.matches) {
          e.stopPropagation();
          // Cancel any pending close timeout from mouseleave
          if (closeTimeouts.has(navSection)) {
            clearTimeout(closeTimeouts.get(navSection));
            closeTimeouts.delete(navSection);
          }
          // Always open on click (close others, expand this one)
          // Avoids double-click issue caused by mouseenter already setting aria-expanded
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', 'true');
          nav.classList.add('menu-open');
          // Remove active state from header-tool
          const activeTool = nav.querySelector('.header-toollist-2.active');
          if (activeTool) activeTool.classList.remove('active');
        } else if (navSection.classList.contains('nav-drop')) {
          e.stopPropagation();
          const wasExpanded = navSection.getAttribute('aria-expanded') === 'true';
          // close all other nav-drops
          navSections.querySelectorAll(':scope .default-content-wrapper > ul > li.nav-drop').forEach((otherSection) => {
            otherSection.setAttribute('aria-expanded', 'false');
          });
          // close all item-drops
          navSections.querySelectorAll('.menulist-item-2 li.item-drop').forEach((item) => {
            item.classList.remove('active');
          });
          // toggle clicked nav-drop
          navSection.setAttribute('aria-expanded', wasExpanded ? 'false' : 'true');
          nav.classList.toggle('menu-open', !wasExpanded);
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  // hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  hamburger.addEventListener('click', () => {
    toggleMenu(nav, navSections);
    if (!isDesktop.matches) {
      navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
        li.setAttribute('aria-expanded', 'false');
      });
      navSections.querySelectorAll('.menulist-item-2 li.item-drop').forEach((item) => {
        item.classList.remove('active');
      });
      nav.classList.remove('menu-open');
    }
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // class start for header element
  const headerSec = block.querySelector('.nav-sections ul');
  if (!headerSec) return;
  headerSec.classList.add('header-menu');
  Array.from(headerSec.children).forEach((li) => {
    li.classList.add('header-menulist');
    Array.from(li.children).forEach((item, i) => {
      item.classList.add(`menulist-item-${i + 1}`);
    });
  });

  headerSec.querySelectorAll('.menulist-item-2').forEach((elem) => {
    Array.from(elem.children).forEach((itemLi, i) => {
      itemLi.classList.add('item-li', `itemli-${i + 1}`);
      Array.from(itemLi.children).forEach((el, ind) => {
        el.classList.add(`subitem-${ind + 1}`);
        Array.from(el.children).forEach((elitem, index) => {
          elitem.classList.add('sub-list', `sublist-${index + 1}`);
        });
      });
      if (itemLi.querySelector('ul')) {
        itemLi.classList.add('item-drop');
      }
    });
  });

  // Mobile click handler for item-drop inside menulist-item-2
  headerSec.querySelectorAll('.menulist-item-2 li.item-drop').forEach((itemDrop) => {
    itemDrop.addEventListener('click', (e) => {
      if (!isDesktop.matches) {
        e.stopPropagation();
        const wasActive = itemDrop.classList.contains('active');
        // close all other item-drops within the same menulist-item-2
        itemDrop.closest('.menulist-item-2').querySelectorAll('li.item-drop').forEach((other) => {
          other.classList.remove('active');
        });
        // toggle clicked item-drop
        if (!wasActive) {
          itemDrop.classList.add('active');
        }
      }
    });
  });

  const headerTools = block.querySelector('.nav-tools ul');
  if (!headerTools) return;
  headerTools.classList.add('header-tool');
  Array.from(headerTools.children).forEach((li, ind) => {
    li.classList.add('header-toollist', `header-toollist-${ind + 1}`);
    Array.from(li.children).forEach((item, i) => {
      item.classList.add(`toollist-item-${i + 1}`);
      Array.from(item.children).forEach((el) => {
        el.classList.add('toolsubitem');
      });
    });
  });

  // Login toggle on .header-toollist-2
  const loginTool = headerTools.querySelector('.header-toollist-2');
  if (loginTool) {
    loginTool.addEventListener('click', (e) => {
      e.stopPropagation();
      // Cancel any pending mouseleave close timeouts from nav-drops
      closeTimeouts.forEach((timeout) => clearTimeout(timeout));
      closeTimeouts.clear();
      // Collapse all nav-drop sections
      if (navSections) {
        toggleAllNavSections(navSections, false);
      }
      loginTool.classList.toggle('active');
      if (loginTool.classList.contains('active')) {
        nav.classList.add('menu-open');
      } else {
        nav.classList.remove('menu-open');
      }
    });
    document.addEventListener('click', (e) => {
      if (!loginTool.contains(e.target)) {
        loginTool.classList.remove('active');
        // Only remove menu-open if no nav-drop is expanded either
        const anyExpanded = navSections && navSections.querySelector(':scope .default-content-wrapper > ul > li[aria-expanded="true"]');
        if (!anyExpanded) {
          nav.classList.remove('menu-open');
        }
      }
    });
  }
}
