export default function decorate(block) {
  if (block.closest('.career-section')) {
    const rows = Array.from(block.children);
    rows.forEach((row, i) => {
      if (i === 0) row.classList.add('career-hero-mobile-img');
      else if (i === 1) row.classList.add('career-hero-desktop-img');
      else if (i === 2) {
        row.classList.add('career-hero-content');
        const inner = row.querySelector('div');
        if (inner) inner.classList.add('career-hero-content-inner');
        const h1 = row.querySelector('h1');
        if (h1) h1.classList.add('career-hero-title');
        const btnContainer = row.querySelector('.button-container');
        if (btnContainer) btnContainer.classList.add('career-hero-btn');
      }
    });
  }

  if (block.closest('.alpha-strategist')) {
    Array.from(block.children).forEach((child, i) => {
      child.classList.add(`strategist-${i + 1}`);
      Array.from(child.children).forEach((item, ind) => {
        item.classList.add(`innercontent-${ind + 1}`);
        Array.from(item.children).forEach((inner, index) => {
          inner.classList.add(`item-${index + 1}`);
          Array.from(inner.children).forEach((el, innd) => {
            el.classList.add(`listitem-${innd + 1}`);
            Array.from(el.children).forEach((ele, indd) => {
              ele.classList.add(`innerlist-${indd + 1}`);
              Array.from(ele.children).forEach((elem, indx) => {
                elem.classList.add('inneritem', `inneritem-${indx + 1}`);
              });
            });
          });
        });
      });
    });
  }
}
