import { loadCSS } from '../../scripts/aem.js';

/**
 * Custom Tab Block
 *
 * Authoring pattern (Universal Editor):
 * 1. Add a "customtab" block — its first row/cell contains the tab-group ID (e.g. "mytabs").
 * 2. For each tab panel, create a separate section and add section-metadata:
 *      - tab-group : mytabs          (must match the block's group ID)
 *      - tab-title : Overview        (displayed on the tab button)
 *      - tab-icon  : icon-name       (optional — icon slug from /icons/)
 *
 * At runtime the block pulls every matching section into itself, hides
 * the original section wrappers, and generates the tab navigation.
 */

function activateTab(tabNav, panels, index) {
  // Deactivate all
  tabNav.querySelectorAll('.customtab-btn').forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('tabindex', '-1');
  });
  panels.forEach((p) => {
    p.classList.remove('active');
    p.setAttribute('aria-hidden', 'true');
  });

  // Activate target
  const activeBtn = tabNav.children[index];
  const activePanel = panels[index];
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
    activeBtn.setAttribute('tabindex', '0');
  }
  if (activePanel) {
    activePanel.classList.add('active');
    activePanel.setAttribute('aria-hidden', 'false');
  }
}

export default function decorate(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/customtab/customtab.css`);

  // ── 1. Read the tab-group ID from the block content ──
  const firstCell = block.querySelector('div > div');
  const groupId = firstCell ? firstCell.textContent.trim().toLowerCase() : '';
  block.textContent = ''; // clear authored content

  if (!groupId) {
    block.textContent = 'customtab: missing tab-group ID';
    return;
  }

  // ── 2. Find all sections that belong to this tab group ──
  const allSections = [...document.querySelectorAll('.section')];
  const tabSections = allSections.filter(
    (s) => (s.dataset.tabGroup || '').toLowerCase() === groupId,
  );

  if (!tabSections.length) {
    block.textContent = `customtab: no sections found for group "${groupId}"`;
    return;
  }

  // ── 3. Build tab navigation ──
  const tabNav = document.createElement('div');
  tabNav.classList.add('customtab-nav');
  tabNav.setAttribute('role', 'tablist');

  // ── 4. Build tab panels ──
  const panelsContainer = document.createElement('div');
  panelsContainer.classList.add('customtab-panels');

  const panels = [];

  tabSections.forEach((section, idx) => {
    const title = section.dataset.tabTitle || `Tab ${idx + 1}`;
    const iconSlug = section.dataset.tabIcon || '';

    // Tab button
    const btn = document.createElement('button');
    btn.classList.add('customtab-btn');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.setAttribute('tabindex', idx === 0 ? '0' : '-1');
    btn.setAttribute('aria-controls', `customtab-panel-${groupId}-${idx}`);
    btn.id = `customtab-btn-${groupId}-${idx}`;

    if (iconSlug) {
      const icon = document.createElement('span');
      icon.classList.add('icon', `icon-${iconSlug}`);
      btn.append(icon);
    }

    const label = document.createElement('span');
    label.classList.add('customtab-btn-label');
    label.textContent = title;
    btn.append(label);

    btn.addEventListener('click', () => {
      activateTab(tabNav, panels, idx);
    });

    tabNav.append(btn);

    // Tab panel — move section content into it
    const panel = document.createElement('div');
    panel.classList.add('customtab-panel');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');
    panel.setAttribute('aria-labelledby', btn.id);
    panel.id = `customtab-panel-${groupId}-${idx}`;
    if (idx === 0) panel.classList.add('active');

    // Move all wrappers from the section into the panel
    while (section.firstElementChild) {
      panel.append(section.firstElementChild);
    }
    // Hide the now-empty original section
    section.style.display = 'none';

    panelsContainer.append(panel);
    panels.push(panel);
  });

  // Mark first tab active
  if (tabNav.firstElementChild) {
    tabNav.firstElementChild.classList.add('active');
  }

  // ── 5. Keyboard navigation (arrow keys) ──
  tabNav.addEventListener('keydown', (e) => {
    const btns = [...tabNav.querySelectorAll('.customtab-btn')];
    const current = btns.findIndex((b) => b === document.activeElement);
    let next = -1;

    if (e.key === 'ArrowRight') next = (current + 1) % btns.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = btns.length - 1;

    if (next >= 0) {
      e.preventDefault();
      btns[next].focus();
      activateTab(tabNav, panels, next);
    }
  });

  // ── 6. Assemble ──
  block.append(tabNav, panelsContainer);
}
