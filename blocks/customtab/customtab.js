import { loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Custom Tab Block
 *
 * Authoring pattern (Universal Editor):
 * Each row in the block = one tab.
 *   Column 1 = Tab title (text)
 *   Column 2 = Tab panel content (any content — text, images, blocks, etc.)
 *
 * | Custom Tab       |                          |
 * |------------------|--------------------------|
 * | Overview         | <overview content>       |
 * | Blogs            | <blogs content>          |
 * | Reports          | <reports content>        |
 * | Videos           | <videos content>         |
 */

function activateTab(tabNav, panels, index) {
  tabNav.querySelectorAll('.customtab-btn').forEach((btn, i) => {
    const isActive = i === index;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });
  panels.forEach((p, i) => {
    const isActive = i === index;
    p.classList.toggle('active', isActive);
    p.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });
}

export default function decorate(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/customtab/customtab.css`);

  const rows = [...block.children];

  // Tab navigation
  const tabNav = document.createElement('div');
  tabNav.classList.add('customtab-nav');
  tabNav.setAttribute('role', 'tablist');

  // Panels container
  const panelsContainer = document.createElement('div');
  panelsContainer.classList.add('customtab-panels');

  const panels = [];

  rows.forEach((row, idx) => {
    const cols = [...row.children];
    const titleCol = cols[0];
    const contentCol = cols[1];

    // Get tab title text
    const titleText = titleCol ? titleCol.textContent.trim() : `Tab ${idx + 1}`;

    // Tab button
    const btn = document.createElement('button');
    btn.classList.add('customtab-btn');
    if (idx === 0) btn.classList.add('active');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.setAttribute('tabindex', idx === 0 ? '0' : '-1');
    btn.setAttribute('aria-controls', `customtab-panel-${idx}`);
    btn.id = `customtab-btn-${idx}`;
    btn.textContent = titleText;

    btn.addEventListener('click', () => {
      activateTab(tabNav, panels, idx);
    });

    tabNav.append(btn);

    // Tab panel
    const panel = document.createElement('div');
    panel.classList.add('customtab-panel');
    if (idx === 0) panel.classList.add('active');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');
    panel.setAttribute('aria-labelledby', btn.id);
    panel.id = `customtab-panel-${idx}`;
    moveInstrumentation(row, panel);

    // Move content column children into the panel
    if (contentCol) {
      while (contentCol.firstChild) {
        panel.append(contentCol.firstChild);
      }
    }

    panelsContainer.append(panel);
    panels.push(panel);
  });

  // Keyboard navigation
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

  // Replace block content
  block.textContent = '';
  block.append(tabNav, panelsContainer);
}
