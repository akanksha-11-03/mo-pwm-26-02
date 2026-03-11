// import { isDesktop } from '../header/header.js';
import dataMapMoObj from '../../scripts/constant.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Transforms a content block into an accessible accordion.
 * - First item is open by default (except mob-accordion on desktop).
 * - Only one item can be open at a time
 * - "Load More" / "Show Less" toggles visibility of extra items.
 *
 * @param {HTMLElement} block - The accordion block element.
 */
export default function decorate(block) {
  if (window.location.href.includes('//author')) return;
  const isOurStrategiesBlock = block.classList.contains('our-strategies-text1');
  const ensureUniqueId = (baseId) => {
    let candidate = baseId;
    let counter = 1;
    while (document.getElementById(candidate)) {
      candidate = `${baseId}-${counter}`;
      counter += 1;
    }
    return candidate;
  };
  const getFaqHeading = (root) => {
    if (!root) return null;
    const candidates = Array.from(root.querySelectorAll('.faq-title, h1, h2, h3, h4'));
    return candidates.find((el) => !el.closest('.accordion-item')) || null;
  };
  // --- Part 1: Convert rows to semantic <details>/<summary> or static blocks ---
  [...block.children].forEach((row) => {
    const [label, body, classes] = row.children;

    if (!label || !body || !body.textContent.trim()) {
      row.remove();
      return;
    }

    if (isOurStrategiesBlock) {
      const labelText = document.createElement('span');
      labelText.className = 'accordion-item-label';
      labelText.append(...label.childNodes);

      body.className = 'accordion-item-body';

      const wrapper = document.createElement('div');
      wrapper.className = 'accordion-item';
      wrapper.append(labelText, body);

      if (classes && classes.innerHTML !== '') {
        const data = classes.textContent.trim();
        if (data) {
          wrapper.classList.add(...data.split(' '));
        }
      }

      row.replaceWith(wrapper);
    } else {
      const summary = document.createElement('summary');
      summary.className = 'accordion-item-label';
      summary.append(...label.childNodes);

      body.className = 'accordion-item-body';

      const detailsEl = document.createElement('details');
      detailsEl.className = 'accordion-item';
      detailsEl.append(summary, body);
      // if(classes){
      //    const data = classes.textContent.trim();
      //    detailsEl.classList.add(data)
      //  }
      if (classes && classes.innerHTML !== '') {
        if (block.closest('.nri-accordion') && block.closest('.nri-accordion').getAttribute('data-id') === 'faq-common') {
          const data = classes.textContent.trim();
          detailsEl.classList.add(data);
        }
      }

      row.replaceWith(detailsEl);
    }
  });

  const allItems = block.querySelectorAll('.accordion-item');
  if (!allItems.length) return;

  // --- Part 2: Accordion behavior ---
  if (isOurStrategiesBlock) {
    // Non-interactive list for AIF strategies; no accordion behavior.
  } else if (block.closest('.section.mob-accordion') && isDesktop.matches) {
    // In mob-accordion + desktop → keep all open but prevent toggling
    allItems.forEach((item) => {
      item.setAttribute('open', '');
      // item.addEventListener('click', (e) => e.preventDefault());
      item.addEventListener('click', (e) => {
        e.preventDefault();
        window.addEventListener('resize', () => {
          if (item.getAttribute('open')) {
            item.setAttribute('open', '');
          }
        });
      });
    });
  } else {
    // Normal accordion → first item open by default, only one open at a time
    allItems[0].setAttribute('open', '');
    allItems.forEach((item) => {
      // const classPage = ['faq', 'our-funds'];
      if (block.closest('.freq-ask-ques')) {
        item.addEventListener('click', () => {
          allItems.forEach((otherItem) => {
            if (otherItem !== item) {
              otherItem.removeAttribute('open');
            }
          });
        });
      } else {
        item.addEventListener('toggle', () => {
          if (item.open) {
            allItems.forEach((otherItem) => {
              if (otherItem !== item) {
                otherItem.removeAttribute('open');
              }
            });
          }
        });
      }
    });
  }

  if (block.closest('.prevent-accordion-toggle')) {
    Array.from(block.children).forEach((item) => {
      item.removeAttribute('open');
      item.addEventListener('click', (e) => {
        e.preventDefault();
        item.removeAttribute('open');
      });
    });
  }

  // our strategy should close start

  // document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.our-strategies-aif')) {
    (document.querySelectorAll('.our-strategies-aif .our-strategies-wrap2 .our-strategies-text1 details.accordion-item')).forEach((item) => {
      // 1. Initial State: Force it closed immediately
      item.removeAttribute('open');

      // 2. Prevent the toggle action
      item.addEventListener('click', (e) => {
        // If 'item' is a <details> element, preventDefault stops the toggle
        e.preventDefault();

        // Safety: ensure the attribute stays off even if the browser tries to fight back
        item.removeAttribute('open');
      });
    });
  }
  // });

  // our strategy should close end

  if (block.closest('.privacy-policy-banner')) {
    allItems.forEach((item) => {
      item.addEventListener('click', () => {
        allItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.removeAttribute('open');
          }
        });
        item.setAttribute('open', '');
      });
    });
  }

  if (
    window.location.href.includes('/mutual-funds') || window.location.href.includes('/motilal-oswal-edge')
  ) {
    const mainwrapper = block.closest('.freq-ask-ques');
    if (mainwrapper && !mainwrapper.querySelector('.faq-our-fund')) {
      const divwrapper = document.createElement('div');
      divwrapper.classList.add('faq-our-fund');
      if (block.closest('.table-wrapper')) {
        divwrapper.classList.add('fdp-faq-inner');
        block.closest('.table-wrapper').children[0]
          .classList.add('accordian-parent');
        block.closest('.table-wrapper').children[0]
          .querySelector('p').classList.add('faq-title');
        block.closest('.table-wrapper').children[2]
          .classList.add('accor-parent');
      }
      Array.from(mainwrapper.children).forEach((elchild) => {
        divwrapper.append(elchild);
      });
      mainwrapper.append(divwrapper);
    }
  } else if (
    block.closest('.section').getAttribute('data-id') === 'faq-section-show'
  ) {
    const mainwrapper = block.closest('.section.freq-ask-ques');
    const divwrapper = document.createElement('div');
    divwrapper.classList.add('faq-our-fund');
    Array.from(mainwrapper.children).forEach((elchild) => {
      divwrapper.append(elchild);
    });
    mainwrapper.append(divwrapper);
  }

  /* NRI Wrapper Js  Start */

  // const nriAccordion = block.closest('.nri-accordion');

  // const wrapperAccordion = document.createElement("div");
  // wrapperAccordion.classList.add("faq-our-fund")

  // const allChild =Array.from(nriAccordion.children);
  // allChild.forEach((childs)=>{
  //    wrapperAccordion.append(childs)
  // })

  // nriAccordion.append(wrapperAccordion)

  const allAccordions = Array.from(document.querySelectorAll('.nri-accordion'));

  allAccordions.forEach((nriAccordion) => {
    const children = Array.from(nriAccordion.children);
    const hasWrapper = children.some((child) => child.classList.contains('faq-our-fund'));

    if (hasWrapper) {
      return;
    }

    const wrapperAccordion = document.createElement('div');
    wrapperAccordion.classList.add('faq-our-fund');

    children.forEach((child) => {
      wrapperAccordion.append(child);
    });

    nriAccordion.append(wrapperAccordion);
  });
  /* NRI Wrapper Js  End */

  const allAccordions2 = Array.from(document.querySelectorAll('.nri-accordion'));

  allAccordions2.forEach((nriAccordion) => {
    const children = Array.from(nriAccordion.children);
    const hasWrapper = children.some((child) => child.classList.contains('faq-our-fund'));

    if (hasWrapper) {
      return;
    }

    const wrapperAccordion = document.createElement('div');
    wrapperAccordion.classList.add('faq-our-fund');

    children.forEach((child) => {
      wrapperAccordion.append(child);
    });

    nriAccordion.append(wrapperAccordion);
  });

  //  class added for accordion table start//

  const accordionTable = block.querySelector('.accordion-table');
  if (accordionTable !== null) {
    dataMapMoObj.CLASS_PREFIXES = [
      'leftartmain',
      'leftartsub',
      'leftartitem',
      'subleftart',
      'mainleftart',
      'itemleftart',
      'itemleftart',
      'mainitemleftart',
      'itemmainleftart',
      'submainleftart',
    ];
    dataMapMoObj.addIndexed(accordionTable);
  }

  //  class added for accordion table end//
  /* NRI Wrapper Js  End */

  // console.log(block.closest('.mob-accordion'));

  // faq start

  const faqLimit = 6;

  const focusFirstRevealedItem = (items, startIndex) => {
    const target = Array.from(items).find((item, index) => {
      if (index < startIndex) return false;
      if (item.classList.contains('hidden')) return false;
      if (item.style.display === 'none') return false;
      return true;
    });
    if (!target) return;

    const focusable = target.querySelector(
      'summary, button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusable) {
      focusable.focus();
    } else {
      target.setAttribute('tabindex', '-1');
      target.focus();
    }
  };

  function initFaqViewMore() {
    const accordionBlocks = document.querySelectorAll('.page-faq-section .tabs-panel');

    accordionBlocks.forEach((eachBlock) => {
      // Check if we already initialized this block to avoid duplicate buttons
      if (eachBlock.querySelector('.view-more-container')) return;

      const eachAccordion = eachBlock.querySelector('.freq-ask-ques .accordion');
      const items = eachBlock.querySelectorAll('.freq-ask-ques .accordion .accordion-item');

      if (items.length > faqLimit) {
        // 1. Initial State: Hide items beyond faqLimit
        items.forEach((item, index) => {
          item.style.display = index >= faqLimit ? 'none' : 'block';
        });

        // 2. Create the View More button
        const btnContainer = document.createElement('div');
        btnContainer.className = 'view-more-container';
        // btnContainer.style.cssText = 'text-align: center; margin-top: 20px;';

        const toggleBtn = document.createElement('a');
        toggleBtn.className = 'button view-more-btn';
        toggleBtn.id = ensureUniqueId('loadMoreFaqLink');
        toggleBtn.setAttribute('href', '#');
        toggleBtn.setAttribute('title', 'Load More');
        const faqTitle = getFaqHeading(eachBlock);
        if (faqTitle && !faqTitle.id) {
          faqTitle.id = ensureUniqueId('faqSectionTitle');
        }
        if (faqTitle?.id) {
          toggleBtn.setAttribute('aria-labelledby', `${toggleBtn.id} ${faqTitle.id}`);
          toggleBtn.removeAttribute('aria-label');
        } else {
          toggleBtn.setAttribute('aria-label', 'Load more FAQs');
        }
        toggleBtn.innerText = 'Load More';
        toggleBtn.style.cssText = 'padding: 10px 20px; cursor: pointer;';

        btnContainer.appendChild(toggleBtn);
        eachAccordion.after(btnContainer);

        // 3. Add Click Event
        let isExpanded = false;
        toggleBtn.addEventListener('click', (event) => {
          event.preventDefault();
          isExpanded = !isExpanded;
          items.forEach((item, index) => {
            if (index >= faqLimit) {
              item.style.display = isExpanded ? 'block' : 'none';
            }
          });
          toggleBtn.innerText = isExpanded ? 'Load Less' : 'Load More';
          if (isExpanded) {
            requestAnimationFrame(() => focusFirstRevealedItem(items, faqLimit));
          }
        });

        // 4. Custom Reset Functionality
        // We attach a custom method to the button element so we can trigger it on tab change
        eachBlock.resetFaq = () => {
          isExpanded = false;
          toggleBtn.innerText = 'Load More';
          items.forEach((item, index) => {
            if (index >= faqLimit) item.style.display = 'none';
          });
        };
      }
    });
  }

  // Initialize on page load
  initFaqViewMore();

  // --- TAB CHANGE RESET LOGIC ---
  const tabButtons = document.querySelectorAll('.page-faq-section .subitemfaq1 .tabs-tab');
  tabButtons.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Small timeout to ensure the tab panel visibility has toggled
      // and to let any CSS transitions finish
      setTimeout(() => {
        const panels = document.querySelectorAll('.page-faq-section .tabs-panel');
        panels.forEach((panel) => {
          if (typeof panel.resetFaq === 'function') {
            panel.resetFaq();
          }
        });
      }, 50);
    });
  });

  document.querySelector('.page-faq-section .tabs-list .tabs-tab.innersubfaq1')?.addEventListener('click', () => {
    initFaqViewMore();
  });

  // pms accordian start

  const faqSection = document.querySelector('.section.freq-ask-ques.strategy-details');

  if (faqSection && !faqSection.querySelector('.view-more-container')) {
    const listItems = faqSection.querySelectorAll('.accordion .accordion-item');

    if (listItems.length > 6) {
      const mainCtn = faqSection.querySelector('.accordion-wrapper');
      const btnContainer = document.createElement('div');
      btnContainer.className = 'view-more-container';
      // Note: Removed background:blue to match your requested style, kept left align
      // btnContainer.style.cssText = 'text-align: left;';

      const toggleBtn = document.createElement('a');
      toggleBtn.className = 'button view-more-btn';
      toggleBtn.id = ensureUniqueId('loadMoreFaqLink');
      toggleBtn.setAttribute('href', '#');
      toggleBtn.setAttribute('title', 'Load More');
      const faqTitle = getFaqHeading(faqSection);
      if (faqTitle && !faqTitle.id) {
        faqTitle.id = ensureUniqueId('faqSectionTitle');
      }
      if (faqTitle?.id) {
        toggleBtn.setAttribute('aria-labelledby', `${toggleBtn.id} ${faqTitle.id}`);
        toggleBtn.removeAttribute('aria-label');
      } else {
        toggleBtn.setAttribute('aria-label', 'Load more FAQs');
      }
      toggleBtn.innerText = 'Load More';

      btnContainer.appendChild(toggleBtn);
      mainCtn.appendChild(btnContainer);

      // --- 1. INITIAL STATE (Run on load) ---
      listItems.forEach((item, index) => {
        if (index >= 6) {
          item.style.display = 'none';
        }
      });

      // --- 2. CLICK EVENT WITH SMOOTH COLLAPSE ---
      let isExpanded = false;
      toggleBtn.addEventListener('click', (event) => {
        event.preventDefault();
        isExpanded = !isExpanded;

        listItems.forEach((item, index) => {
          if (index >= 6) {
            item.style.display = isExpanded ? 'block' : 'none';
          }
        });

        toggleBtn.innerText = isExpanded ? 'Load Less' : 'Load More';

        if (isExpanded) {
          requestAnimationFrame(() => focusFirstRevealedItem(listItems, 6));
        }

        // --- 3. SMOOTH SCROLL ON COLLAPSE ---
        if (!isExpanded) {
          // Scrolls back to the top of the accordion when "Load Less" is clicked
          faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  // --- Part 3: Load More / Show Less ---
  const itemsToShowInitially = 3;
  const section = block.closest('.section');
  const loadMoreButton = section?.querySelector('.button-container a.button');
  const faqTitleEl = getFaqHeading(section);
  if (faqTitleEl && !faqTitleEl.id) {
    faqTitleEl.id = ensureUniqueId('faqSectionTitle');
  }
  if (loadMoreButton) {
    if (!loadMoreButton.id) {
      loadMoreButton.id = ensureUniqueId('loadMoreFaqLink');
    }
    if (faqTitleEl?.id) {
      loadMoreButton.setAttribute('aria-labelledby', `${loadMoreButton.id} ${faqTitleEl.id}`);
      loadMoreButton.removeAttribute('aria-label');
    } else {
      loadMoreButton.setAttribute('aria-label', 'Load more FAQs');
    }
    loadMoreButton.setAttribute('title', 'Load More');
  }

  if ((!loadMoreButton || allItems.length <= itemsToShowInitially) && block.closest('.section')?.getAttribute('data-id') !== 'faq-section-show') {
    if (loadMoreButton) loadMoreButton?.parentElement?.remove();
    return;
  }

  // Hide items beyond initial count
  if (!block.closest('.show-accordion') && block.closest('.show-accordion') === null) {
    allItems.forEach((item, index) => {
      if (index >= itemsToShowInitially) item.classList.add('hidden');
    });
    loadMoreButton.addEventListener('click', (event) => {
      event.preventDefault();

      const isShowingAll = !block.querySelector('.accordion-item.hidden');
      const firstHiddenItem = block.querySelector('.accordion-item.hidden');

      if (isShowingAll) {
        // Hide extras
        allItems.forEach((item, index) => {
          if (index >= itemsToShowInitially) {
            item.classList.add('hidden');
            item.open = false;
          }
        });
        loadMoreButton.textContent = 'Load More';
        block.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Show all
        block.querySelectorAll('.accordion-item.hidden').forEach((item) => {
          item.classList.remove('hidden');
        });
        loadMoreButton.textContent = 'Show Less';
        if (firstHiddenItem) {
          requestAnimationFrame(() => {
            focusFirstRevealedItem([firstHiddenItem], 0);
          });
        }
      }
    });
  }
  // pms accordian end

  // if (document.querySelector('.page-faq-section innersubfaq1 active')) {
  //   const firsttab = document.querySelector('.page-faq-section innersubfaq1 active')
  //   firsttab.addEventListener("click", () => {

  //   });
  // }

  // faq end
}
