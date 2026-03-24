import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  // Extract authored heading and placeholder text from block rows
  const rows = [...block.children];
  const heading = rows[0]?.textContent.trim() || 'Press Releases';
  const placeholder = rows[1]?.textContent.trim() || 'Search for an edition';

  // Clear block content
  block.textContent = '';

  // --- Heading ---
  const h2 = document.createElement('h2');
  h2.classList.add('search-bar-heading');
  h2.textContent = heading;
  block.appendChild(h2);

  // --- Search Container ---
  const searchContainer = document.createElement('div');
  searchContainer.classList.add('search-bar-container');

  // Left side: icon + input
  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('search-bar-input-wrapper');

  const searchIcon = document.createElement('span');
  searchIcon.classList.add('icon', 'icon-search-grey');
  inputWrapper.appendChild(searchIcon);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.classList.add('search-bar-input');
  input.setAttribute('aria-label', placeholder);
  inputWrapper.appendChild(input);

  // Right side: submit button with diagonal arrow
  const submitBtn = document.createElement('button');
  submitBtn.classList.add('search-bar-submit');
  submitBtn.setAttribute('aria-label', 'Search');
  submitBtn.type = 'button';

  const arrowIcon = document.createElement('span');
  arrowIcon.classList.add('icon', 'icon-diagonal-arrow');
  submitBtn.appendChild(arrowIcon);

  searchContainer.appendChild(inputWrapper);
  searchContainer.appendChild(submitBtn);
  block.appendChild(searchContainer);

  // Decorate icons (load SVGs)
  await decorateIcons(block);

  // --- Search functionality ---
  const doSearch = () => {
    const query = input.value.trim();
    if (query) {
      // Dispatch custom event for other blocks to listen to
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
