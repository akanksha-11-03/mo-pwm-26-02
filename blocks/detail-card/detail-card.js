export default function decorate(block) {
  const detailSec = block.closest('.cmmn-explr-btn');
  Array.from(detailSec.querySelector('.default-content-wrapper').children).forEach((list) => {
    list.classList.add('button-list');
    Array.from(list.children).forEach((item, i) => {
      item.classList.add(`list-item-${i + 1}`);
      Array.from(item.children).forEach((button) => {
        button.classList.add('button');
        Array.from(button.children).forEach((child) => {
          child.classList.add('button-text');
        });
      });
    });
  });

  Array.from(block.children).forEach((child) => {
    child.classList.add('detail-card');
    Array.from(child.children).forEach((item, i) => {
      item.classList.add(`detail-card-item-${i + 1}`);
      Array.from(item.children).forEach((el, ind) => {
        el.classList.add(`content-${ind + 1}`);
        Array.from(el.children).forEach((elem) => {
          elem.classList.add('inner-content');
          Array.from(elem.children).forEach((elee) => {
            elee.classList.add('inner-item');
          });
        });
      });
    });
  });
}
