export default function decorate(block) {
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