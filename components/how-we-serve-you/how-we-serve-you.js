import { loadCSS } from '../../scripts/aem.js';

export function linkToBtn(document) {
  {
    const elements = [...document.querySelectorAll('.how-we-serve-you li')];

    elements.forEach((element) => {
      // Check if the element text contains the marker
      if (element.textContent.includes('||con-to-btn||')) {
        // Get the existing anchor and its href
        const existingAnchor = element.querySelector('a');

        // Create a wrapper div
        const a = document.createElement('a');
        // Only set href if an anchor with href exists
        if (existingAnchor && existingAnchor.getAttribute('href')) {
          a.setAttribute('href', existingAnchor.getAttribute('href'));
        }

        // Clean up innerHTML: remove ||con-to-btn|| marker
        const cleanHTML = element
          .querySelector('a')
          .innerHTML.replace('||con-to-btn||', '')
          .trim();
        a.innerHTML = cleanHTML;

        // Add icon span with image to the a tag
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon icon-up_arrow';
        const iconImg = document.createElement('img');
        iconImg.className = 'icon icon-up_arrow';
        iconImg.src = `${window.hlx.codeBasePath}/icons/up_arrow.svg`;
        iconImg.alt = 'up arrow';
        iconSpan.appendChild(iconImg);
        a.appendChild(iconSpan);

        // Remove href from the anchor inside the div, keep it only on the div
        const innerAnchor = a.querySelector('a');
        if (innerAnchor) {
          a.className = 'link-div';
          innerAnchor.removeAttribute('href');
        }

        // Replace the li element with the div
        element.replaceWith(a);
        console.log('Replaced li with div:', a);
      }
    });

    // After all li conversions, convert all ul elements to div
    document.querySelectorAll('.how-we-serve-you ul').forEach((ul) => {
      const div = document.createElement('div');
      div.className = 'divwithlinks';
      div.innerHTML = ul.innerHTML;
      ul.replaceWith(div);
    });

    // Add explicit classes to avoid index-based CSS selectors
    document
      .querySelectorAll('.how-we-serve-you .columns.columns-2-cols > div > div')
      .forEach((col) => {
        if (!col.classList.contains('columns-img-col')) {
          col.classList.add('hwsy-content-col');
        }
      });

    loadCSS(
      `${window.hlx.codeBasePath}/components/how-we-serve-you/how-we-serve-you.css`,
    );
  }
}
