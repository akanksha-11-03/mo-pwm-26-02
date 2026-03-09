export default function decorate(block) {
  // debugger
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.closest('main').querySelector('.pwm-group')) {
    const pwmGroup = block.closest('main').querySelector('.pwm-group');
    const divWrap = document.createElement('div');
    divWrap.classList.add('column-main-wrap');
    if (!pwmGroup.querySelector('.column-main-wrap')) {
      pwmGroup.appendChild(divWrap);
      Array.from(pwmGroup.children).slice(1).forEach((child) => {
        divWrap.appendChild(child);
      });
    }
    Array.from(pwmGroup.children).forEach((child, i) => {
      child.classList.add(`pwm-child-${i + 1}`);
      Array.from(child.children).forEach((item, x) => {
        item.classList.add(`item-${x + 1}`);
        Array.from(item.children).forEach((el, ind) => {
          el.classList.add(`inneritem-${ind + 1}`);
          Array.from(el.children).forEach((inner, index) => {
            inner.classList.add(`innerchild-${index + 1}`);
            Array.from(inner.children).forEach((elem, indx) => {
              elem.classList.add('childitem', `childitem-${indx + 1}`);
              Array.from(elem.children).forEach((ele, indxx) => {
                ele.classList.add(`childinner-${indxx + 1}`);
                Array.from(ele.children).forEach((elee, indd) => {
                  elee.classList.add(`childitem-${indd + 1}`);
                });
              });
            });
          });
        });
      });
    });
  }
}
