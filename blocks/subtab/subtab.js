export default function decorate(block) {
  const ul = block.querySelector('ul');
  if (!ul) return;

  ul.id = 'subtab-container';

  const items = ul.querySelectorAll('li');
  if (items.length) items[0].classList.add('subtab-active');

  items.forEach((li) => {
    li.addEventListener('click', () => {
      ul.querySelectorAll('li').forEach((el) => el.classList.remove('subtab-active'));
      li.classList.add('subtab-active');
    });
  });
}
