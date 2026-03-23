// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * Show/hide only the sections that belong to this tab block instance.
 * @param {Set<string>} ownTabIds - the tab IDs this block owns
 * @param {string} activeTabId - the tab to show
 */
function showTab(ownTabIds, activeTabId) {
  document.querySelectorAll('.section.tab-content').forEach((section) => {
    // Skip sections that don't belong to this block instance
    const belongsToMe = [...ownTabIds].some((id) => section.classList.contains(id));
    if (!belongsToMe) return;

    section.style.display = section.classList.contains(activeTabId) ? '' : 'none';
  });
}

export default async function decorate(block) {
  const ul = block.querySelector('ul');
  if (!ul) return;

  ul.classList.add('tabs-list');
  ul.setAttribute('role', 'tablist');

  const items = [...ul.querySelectorAll('li')];
  const ownTabIds = new Set(); // tab IDs owned by THIS instance

  // --- Build tab navigation ---
  items.forEach((li, i) => {
    const slug = toClassName(li.textContent.trim());
    const tabId = `tab-${slug}`; // e.g. "tab-overview"
    ownTabIds.add(tabId);

    li.id = tabId;
    li.classList.add(tabId);
    li.setAttribute('role', 'tab');
    li.setAttribute('aria-selected', i === 0);
    li.setAttribute('data-tab', tabId);
    li.tabIndex = i === 0 ? 0 : -1;

    if (i === 0) li.classList.add('active');
  });

  const firstTabId = items[0]?.getAttribute('data-tab');

  // --- Tab click: show matching section, hide others (scoped to this instance) ---
  items.forEach((li) => {
    li.addEventListener('click', () => {
      const tabId = li.getAttribute('data-tab');

      items.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', false);
        item.tabIndex = -1;
      });
      li.classList.add('active');
      li.setAttribute('aria-selected', true);
      li.tabIndex = 0;

      showTab(ownTabIds, tabId);
    });
  });

  // --- Keyboard navigation ---
  ul.addEventListener('keydown', (e) => {
    const current = items.findIndex((item) => item === document.activeElement);
    let next = -1;

    if (e.key === 'ArrowRight') next = (current + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;

    if (next >= 0) {
      e.preventDefault();
      items[next].focus();
      items[next].click();
    }
  });

  // --- Observer: hide inactive tab sections after EDS loads them ---
  const observer = new MutationObserver((mutations) => {
    let needsUpdate = false;

    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes'
        && mutation.attributeName === 'data-section-status'
      ) {
        const section = mutation.target;
        if (
          section.classList.contains('tab-content')
          && section.dataset.sectionStatus === 'loaded'
          && [...ownTabIds].some((id) => section.classList.contains(id))
        ) {
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      requestAnimationFrame(() => {
        const activeTab = block.querySelector('.tabs-list li.active');
        const activeId = activeTab ? activeTab.getAttribute('data-tab') : firstTabId;
        showTab(ownTabIds, activeId);
      });

      // Stop once all THIS instance's sections are loaded
      const mySections = document.querySelectorAll('.section.tab-content');
      const mine = [...mySections].filter(
        (s) => [...ownTabIds].some((id) => s.classList.contains(id)),
      );
      const allLoaded = mine.length > 0
        && mine.every((s) => s.dataset.sectionStatus === 'loaded');
      if (allLoaded) observer.disconnect();
    }
  });

  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-section-status'],
  });
}
