/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    
    details.append(summary, body);
    row.replaceWith(details);
  });

  // Media query for desktop (900px and above)
  const isDesktop = window.matchMedia('(min-width: 900px)');

  const applyAccordionBehavior = () => {
    // Re-query items each time to get current DOM elements
    const allItems = block.querySelectorAll('.accordion-item');
    if (!allItems.length) return;

    if (isDesktop.matches) {
      // Desktop: All items open, no accordion behavior
      allItems.forEach((item) => {
        item.setAttribute('open', '');
        
        // Prevent closing on desktop
        const preventClose = (e) => {
          if (e.target.tagName === 'SUMMARY') {
            e.preventDefault();
          }
        };
        
        // Remove existing listener and add new one
        item.removeEventListener('click', preventClose);
        item.addEventListener('click', preventClose);
      });
    } else {
      // Mobile/Tablet: Accordion behavior (first item open, only one at a time)
      allItems.forEach((item, index) => {
        // Set initial state
        if (index === 0) {
          item.setAttribute('open', '');
        } else {
          item.removeAttribute('open');
        }
        
        // Remove all existing toggle listeners by cloning and replacing
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
      });

      // Re-query after cloning
      const freshItems = block.querySelectorAll('.accordion-item');
      
      // Add toggle listeners for accordion behavior
      freshItems.forEach((item) => {
        item.addEventListener('toggle', () => {
          if (item.open) {
            freshItems.forEach((otherItem) => {
              if (otherItem !== item) {
                otherItem.removeAttribute('open');
              }
            });
          }
        });
      });
    }
  };

  // Apply initial behavior
  applyAccordionBehavior();

  // Re-apply behavior on viewport resize
  isDesktop.addEventListener('change', applyAccordionBehavior);
}