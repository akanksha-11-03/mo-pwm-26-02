import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';
import {
  a, li,
} from './dom-helpers.js';
import { linkToBtn } from '../components/how-we-serve-you/how-we-serve-you.js';
import decorateSeeyourWealthInmotion from '../components/Seeyour-wealth-inmotion/Seeyour-wealth-inmotion.js';


/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}



function decorateBreadcrumbItems(title, url, icon = '') {
  // return li(a({ href: url }, title));
  const listItem = li();

  // Add separator span with aria-hidden for screen readers
  const separatorSpan = document.createElement('span');
  separatorSpan.setAttribute('aria-hidden', 'true');
  listItem.appendChild(separatorSpan);

  if (icon) {
    const link = a({ href: url });
    const imgLink = document.createElement('img');
    imgLink.classList.add('homeicon');
    imgLink.src = icon;

    link.appendChild(imgLink);
    listItem.appendChild(link);
    return listItem;
  }

  listItem.appendChild(a({ href: url }, title));
  return listItem;
}
// breadcrumbs use chat gpt2
export async function createBreadcrumbs() {
  // 1. Get breadcrumbs_title from <meta> or fallback to document.title
  const segments = window.location.pathname.split('/').filter(Boolean);

  let currentPath = '';
  // splice(0, segments.length - 1)
  const items = await Promise.all(
    segments.slice(0, segments.length - 1).map(async (segment) => {
      currentPath += `/${segment}`;
      const url = `${currentPath}`;
      // const url = `/mutual-fund/in/en${currentPath}`;
      const resp = await fetch(url);
      const html = await resp.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const breadcrumbTitle = tempDiv.querySelector('meta[name="breadcrumbs_title"]')
        || tempDiv.querySelector('meta[property="og:title"]');
      const breadcrumbHide = tempDiv.querySelector(
        'meta[name="breadcrumbs_hide"]',
      );
      if (breadcrumbHide.getAttribute('content') === 'true') return null;
      return decorateBreadcrumbItems(
        breadcrumbTitle.getAttribute('content'),
        url,
      );
    }),
  );
  const homeIcon = '/icons/home-icon.svg';
  const homeLink = '/';
  // if (window.location.origin.includes('motilaloswalmf')) {
  //   homeLink = `${window.location.origin}/`;
  // }
  const breadcrumbList = document.createElement('ol');
  breadcrumbList.append(
    decorateBreadcrumbItems('Home', homeLink, homeIcon),
    ...items.filter((item) => item !== null),
    decorateBreadcrumbItems(
      getMetadata('breadcrumbs_title'),
      window.location.pathname,
    ),
  );
  return breadcrumbList;
}

async function decorateBreadcrumbs() {
  try {
    if (getMetadata('breadcrumbs') === 'true') {
      const breadcrumb = await createBreadcrumbs();
      breadcrumb.classList.add('breadul');
      Array.from(breadcrumb.children).forEach((brelesub) => {
        brelesub.classList.add('breadli');
      });
      if (Array.from(breadcrumb.children).length > 1) {
        Array.from(breadcrumb.children).at(-1)?.querySelector('a')?.removeAttribute('href');
      }
      // --- CHANGE IS HERE ---
      // Select the first element that has EITHER [data-id="breadcrumb"] OR .breadcrumbs-fdp
      const container = document.querySelector('main .section');

      // Check if a container was found
      if (container) {
        container.prepend(breadcrumb);
      }

      const bdcrumbsAnchor = document.querySelectorAll('.breadcrumbs .breadul .breadli a');
      bdcrumbsAnchor.forEach((link) => {
        link.classList.add('breadlist');
        link.removeAttribute('aria-current');
      });
      const lastCrumbLink = breadcrumb.lastElementChild?.querySelector('a');
      if (lastCrumbLink) {
        lastCrumbLink.setAttribute('aria-current', 'page');
      }
    }
  } catch (error) {
    // console.error('Error decorating breadcrumbs:', error);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  linkToBtn(document);
  decorateSeeyourWealthInmotion(document);
}

export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const cleanPath = path.replace(/(\.plain)?\.html/, '');
    const resp = await fetch(`${cleanPath}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(
            elem.getAttribute(attr),
            new URL(cleanPath, window.location),
          ).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorateFragment(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.classList.add(...fragmentSection.classList);
      block.classList.remove('section');
      block.replaceChildren(...fragmentSection.childNodes);
    }
  }
}

async function decorateAutoBlock(element) {
  const anchors = element.querySelectorAll('a');
  const promises = Array.from(anchors).map(async (origin) => {
    if (origin && origin.href && origin.href.includes('/fragment/')) {
      const parent = origin.parentElement;
      const divblock = document.createElement('div');
      divblock.append(origin);
      parent.append(divblock);
      decorateFragment(divblock);
    }
  });
  await Promise.all(promises);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    decorateAutoBlock(doc);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  decorateBreadcrumbs();
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
