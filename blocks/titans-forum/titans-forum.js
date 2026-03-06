export default function decorate(block) {
  block.querySelector('div').classList.add('block-item');
  Array.from(block.querySelector('.block-item').children).forEach((child, i) => {
    child.classList.add(`block-child-${i + 1}`);
    Array.from(child.children).forEach((grandChild, j) => {
      grandChild.classList.add(`grand-child-${j + 1}`);
    });
  });

  const contentWrap = document.createElement('div');
  contentWrap.classList.add('content-wrap');
  const blockItem = block.querySelector('.block-item');
  contentWrap.append(...Array.from(blockItem.children).slice(1));
  blockItem.append(contentWrap);
}
