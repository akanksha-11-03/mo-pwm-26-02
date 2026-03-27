export default function decorate(block) {

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
    const cardPicture = cardFirstItem.querySelector('picture');
    if (!cardPicture) {
      cardFirstItem.remove();
    };
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
