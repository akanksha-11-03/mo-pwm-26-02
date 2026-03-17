export default function decorate(block) {
  if (block.closest('.who-we-are')) {
    // console.log('swdfv');
    Array.from(block.children).forEach((child, i) => {
      child.classList.add(`who-we-are-${i + 1}`);
      Array.from(child.children).forEach((item, ind) => {
        item.classList.add(`innercontent-${ind + 1}`);
        Array.from(item.children).forEach((inner, index) => {
          inner.classList.add(`item-${index + 1}`);
          Array.from(inner.children).forEach((el) => {
            el.classList.add('listitem');
            Array.from(el.children).forEach((ele, indd) => {
              ele.classList.add(`innerlist-${indd + 1}`);
              Array.from(ele.children).forEach((elem, indx) => {
                elem.classList.add(`inneritem-${indx + 1}`);
              });
            });
          });
        });
      });
    });
  }

  if (block.closest('.wealth-creation')) {
    Array.from(block.children).forEach((el, i) => {
      el.classList.add(`wc-item-${i + 1}`);
      Array.from(el.children).forEach((ele, ind) => {
        ele.classList.add(`wc-inner-${ind + 1}`);
      });
    });
  }

  if (block.closest('.careers-rte')) {
    Array.from(block.children).forEach((row, i) => {
      row.classList.add(`careers-row-${i + 1}`);
      if (i === 0) row.classList.add('careers-intro');
      else row.classList.add('careers-block');

      Array.from(row.children).forEach((col) => {
        col.classList.add('careers-col');

        const h2 = col.querySelector('h2');
        if (h2) h2.classList.add('careers-heading');

        col.querySelectorAll('p').forEach((p) => p.classList.add('careers-para'));

        const ul = col.querySelector('ul');
        if (ul) {
          ul.classList.add('careers-list');
          ul.querySelectorAll('li').forEach((li) => li.classList.add('careers-list-item'));
        }
      });
    });
  }

  if (block.closest('.say-hello')) {
    const rows = Array.from(block.children);
    rows.forEach((row, i) => {
      if (i === 0) {
        row.classList.add('say-hello-image');
        const innerDiv = row.querySelector('div');
        if (innerDiv) innerDiv.classList.add('say-hello-image-inner');
      } else {
        row.classList.add('say-hello-content');
        const innerDiv = row.querySelector('div');
        if (innerDiv) {
          innerDiv.classList.add('say-hello-content-inner');
          const heading = innerDiv.querySelector('h1, h2, h3, h4, h5, h6, p:first-child');
          if (heading) heading.classList.add('say-hello-text');
          const btnContainer = innerDiv.querySelector('.button-container');
          if (btnContainer) btnContainer.classList.add('say-hello-btn');
          const link = innerDiv.querySelector('a');
          if (link) link.classList.add('say-hello-link');
        }
      }
    });
  }
}
