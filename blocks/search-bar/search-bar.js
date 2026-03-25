import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  const rows = [...block.children];
  const heading = rows[0]?.textContent.trim() || '';
  const contentRow = rows[1];

  // Parse richtext: extract icon spans and text for placeholder
  const icons = contentRow ? [...contentRow.querySelectorAll('span.icon')] : [];
  const placeholder = contentRow?.textContent.trim() || 'Search...';
  const searchIconEl = icons[0];
  const submitIconEl = icons[1];

  block.textContent = '';

  /* ── Heading ── */
  const h2 = document.createElement('h2');
  h2.classList.add('search-bar-heading');
  h2.textContent = heading;
  block.appendChild(h2);

  /* ── Search container ── */
  const container = document.createElement('div');
  container.classList.add('search-bar-container');

  // input wrapper (icon + input)
  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('search-bar-input-wrapper');

  if (searchIconEl) {
    searchIconEl.classList.add('search-bar-icon');
    inputWrapper.appendChild(searchIconEl);
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.classList.add('search-bar-input');
  input.setAttribute('aria-label', placeholder);
  inputWrapper.appendChild(input);

  // submit button
  const submitBtn = document.createElement('button');
  submitBtn.classList.add('search-bar-submit');
  submitBtn.setAttribute('aria-label', 'Search');
  submitBtn.type = 'button';
  if (submitIconEl) submitBtn.appendChild(submitIconEl);

  container.appendChild(inputWrapper);
  container.appendChild(submitBtn);
  block.appendChild(container);

  await decorateIcons(block);

  /* ── Search action ── */
  const doSearch = () => {
    const query = input.value.trim();
    if (query) {
      block.dispatchEvent(new CustomEvent('search', {
        detail: { query },
        bubbles: true,
      }));
    }
  };

  submitBtn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
