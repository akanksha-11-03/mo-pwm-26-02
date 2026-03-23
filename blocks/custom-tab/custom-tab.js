// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // Give the main block wrapper an ID
  block.id = 'custom-tab-primary';

  const ul = block.querySelector('ul');
  if (!ul) return;

  // Convert <ul> to a tab navigation
  ul.classList.add('tabs-list');
  ul.setAttribute('role', 'tablist');

  // Create panels container
  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'tabs-panels';

  const items = [...ul.querySelectorAll('li')];
  const panels = [];

  items.forEach((li, i) => {
    const slug = toClassName(li.textContent.trim());

    // Add ID and attributes to each <li>
    li.id = `tab-${slug}`;
    li.setAttribute('role', 'tab');
    li.setAttribute('aria-selected', i === 0);
    li.setAttribute('aria-controls', `tabpanel-${slug}`);
    li.setAttribute('data-tab', slug);
    li.tabIndex = i === 0 ? 0 : -1;

    if (i === 0) li.classList.add('active');

    // Create a tab panel div for each tab
    const panel = document.createElement('div');
    panel.className = `tabs-panel tab-${slug}`;
    panel.id = `tabpanel-${slug}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${slug}`);
    if (i === 0) {
      panel.classList.add('active');
      panel.setAttribute('aria-hidden', false);
    } else {
      panel.setAttribute('aria-hidden', true);
    }
    panelsContainer.append(panel);
    panels.push(panel);

    // Click handler — toggle panels
    li.addEventListener('click', () => {
      // Update active tab
      items.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', false);
        item.tabIndex = -1;
      });
      li.classList.add('active');
      li.setAttribute('aria-selected', true);
      li.tabIndex = 0;

      // Show/hide panels
      panels.forEach((p) => {
        if (p.id === `tabpanel-${slug}`) {
          p.classList.add('active');
          p.setAttribute('aria-hidden', false);
        } else {
          p.classList.remove('active');
          p.setAttribute('aria-hidden', true);
        }
      });
    });
  });

  // Keyboard navigation (Arrow Left / Right)
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

  // Append panels after the tab list
  block.append(panelsContainer);

  // Move authored sections with class "tab-content" into matching panels
  // Author adds style "tab-content" + "tab-overview" (or tab-blogs, etc.) to a section
  items.forEach((li) => {
    const slug = li.getAttribute('data-tab');
    const panel = document.getElementById(`tabpanel-${slug}`);
    if (!panel) return;

    // Find all sections on the page that have the matching tab class
    const matchingSections = document.querySelectorAll(`.section.tab-content.tab-${slug}`);
    matchingSections.forEach((section) => {
      panel.append(section);
      section.classList.remove('hidden');
      section.removeAttribute('aria-hidden');
    });
  });
}
