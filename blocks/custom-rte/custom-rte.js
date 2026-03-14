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
        Array.from(ele.children).forEach((elee, indd) => {
          elee.classList.add(`wc-inner-item-${indd + 1}`);
          Array.from(elee.children).forEach((item, index) => {
            item.classList.add(`wc-list-${index + 1}`);
            Array.from(item.children).forEach((list, innd) => {
              list.classList.add(`listitem-${innd + 1}`);
              Array.from(list.children).forEach((e, indexx) => {
                e.classList.add('inneritem', `inneritem-${indexx + 1}`);
              });
            });
          });
        });
      });
    });
  }
}
