// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  if (block.closest('.sharper-focus')) {
    const customBlock = block.querySelector('.custom-rte');
    const animeItem = Array.from(customBlock.children).slice(0, 4);
    const centerText = Array.from(customBlock.children).slice(-1)[0];
    animeItem.forEach((el) => {
      el.classList.add('circle-item');
      Array.from(el.children).forEach((ele, i) => {
        ele.classList.add(`inner-content-${i + 1}`);
        Array.from(ele.children).forEach((item) => {
          item.classList.add('child-item');
        });
      });
    });

    centerText.classList.add('circle-text');
    centerText.querySelector('div').classList.add('text-main');
    centerText.querySelector('p').classList.add('center-text');

    // Array.from(customBlock.children).forEach((el) => {
    //   el.classList.add('item')
    // })
    
  }
}