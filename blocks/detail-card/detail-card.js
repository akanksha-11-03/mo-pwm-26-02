export default function decorate(block) {
  const detailSec = block.closest('.cmmn-explr-btn');
  const defaultContent = detailSec?.querySelector('.default-content-wrapper');
  if (defaultContent) {
    Array.from(defaultContent?.children).forEach((list) => {
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
  }

  Array.from(block.children).forEach((child) => {
    child.classList.add('detail-content');
    Array.from(child.children).forEach((item, i) => {
      item.classList.add(`detail-card-item-${i + 1}`);
      Array.from(item.children).forEach((el, ind) => {
        el.classList.add(`content-${ind + 1}`);
        Array.from(el.children).forEach((elem, indd) => {
          elem.classList.add(`inner-content-${indd + 1}`);
          Array.from(elem.children).forEach((elee) => {
            elee.classList.add('inner-item');
          });
        });
      });
    });
  });

  const eachCard = block.querySelectorAll('.detail-content');
  eachCard.forEach((card) => {
    const cardFirstItem = card.querySelector('.detail-card-item-1');
    const cardContent = cardFirstItem.querySelector('.content-1');
    const cardLink = cardFirstItem.querySelector('a');
    if (!cardLink) return;
    const redirectURL = cardLink.getAttribute('href');
    if (!redirectURL) return;
    const anchor = document.createElement('a');
    anchor.setAttribute('href', redirectURL);
    anchor.classList.add('card-link');
    anchor.appendChild(cardContent);
    cardFirstItem.appendChild(anchor);
    cardFirstItem.querySelector('.content-2')?.remove();
  });
}
