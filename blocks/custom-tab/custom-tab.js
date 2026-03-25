// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * Show the section matching the active tab, hide all others.
 * li#tab-overview  →  shows .section.tab-content.tab-overview
 * li#tab-blogs     →  shows .section.tab-content.tab-blogs
 */
function showTab(tabId) {
  document.querySelectorAll('.section.tab-content').forEach((section) => {
    if (section.classList.contains(tabId)) {
      section.style.display = '';
    } else {
      section.style.display = 'none';
    }
  });
}

export default async function decorate(block) {
  block.id = 'custom-tab-primary';

  const ul = block.querySelector('ul');
  if (!ul) return;

  ul.classList.add('tabs-list');
  ul.setAttribute('role', 'tablist');

  const items = [...ul.querySelectorAll('li')];

  // --- Build tab navigation ---
  items.forEach((li, i) => {
    const slug = toClassName(li.textContent.trim());
    const tabId = `tab-${slug}`; // e.g. "tab-overview"

    li.id = tabId;
    li.classList.add(tabId);
    li.setAttribute('role', 'tab');
    li.setAttribute('aria-selected', i === 0);
    li.setAttribute('data-tab', tabId);
    li.tabIndex = i === 0 ? 0 : -1;

    if (i === 0) li.classList.add('active');
  });

  const firstTabId = items[0]?.getAttribute('data-tab');

  // --- Tab click: show matching section, hide others ---
  items.forEach((li) => {
    li.addEventListener('click', () => {
      const tabId = li.getAttribute('data-tab');

      // Update active state on all tabs
      items.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', false);
        item.tabIndex = -1;
      });
      li.classList.add('active');
      li.setAttribute('aria-selected', true);
      li.tabIndex = 0;

      // Show/hide sections
      showTab(tabId);
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
  // EDS sets section.style.display = null when status → "loaded",
  // so we use rAF to apply hide AFTER EDS finishes.
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
        ) {
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      requestAnimationFrame(() => {
        const activeTab = block.querySelector('.tabs-list li.active');
        const activeId = activeTab ? activeTab.getAttribute('data-tab') : firstTabId;
        showTab(activeId);
      });

      // Stop observing once all tab-content sections are loaded
      const all = document.querySelectorAll('.section.tab-content');
      const allLoaded = all.length > 0
        && [...all].every((s) => s.dataset.sectionStatus === 'loaded');
      if (allLoaded) observer.disconnect();
    }
  });

  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-section-status'],
  });
}
