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
    Array.from(block.children).forEach((el, i) => {
      el.classList.add(`careers-rte-item-${i + 1}`);
      Array.from(el.children).forEach((ele, ind) => {
        ele.classList.add(`careers-rte-inner-${ind + 1}`);
      });
    });
  }
}
