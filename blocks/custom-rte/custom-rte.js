import {
  div, input, img, form, span, button,
} from '../../scripts/dom-helpers.js';
import { loadCSS } from '../../scripts/aem.js';

export default function decorate(block) {
  const section = block.closest('.section');
  const variant = ['who-we-are', 'wealth-creation', 'careers-rte', 'say-hello']
    .find((cls) => section?.classList.contains(cls));
  if (variant) {
    loadCSS(`${window.hlx.codeBasePath}/blocks/custom-rte/${variant}.css`);
  }

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

  if (block.closest('.careers-rte')) {
    Array.from(block.children).forEach((row, i) => {
      row.classList.add(`careers-row-${i + 1}`);
      if (i === 0) row.classList.add('careers-intro');
      else row.classList.add('careers-block');

      Array.from(row.children).forEach((col) => {
        col.classList.add('careers-col');

        const h2 = col.querySelector('h2');
        if (h2) h2.classList.add('careers-heading');

        col.querySelectorAll('p').forEach((p) => p.classList.add('careers-para'));

        const ul = col.querySelector('ul');
        if (ul) {
          ul.classList.add('careers-list');
          ul.querySelectorAll('li').forEach((li) => li.classList.add('careers-list-item'));
        }
      });
    });
  }

  if (block.closest('.say-hello')) {
    const rows = Array.from(block.children);
    rows.forEach((row, i) => {
      if (i === 0) {
        row.classList.add('say-hello-image');
        const innerDiv = row.querySelector('div');
        if (innerDiv) innerDiv.classList.add('say-hello-image-inner');
      } else {
        row.classList.add('say-hello-content');
        const innerDiv = row.querySelector('div');
        if (innerDiv) {
          innerDiv.classList.add('say-hello-content-inner');
          const heading = innerDiv.querySelector('h1, h2, h3, h4, h5, h6, p:first-child');
          if (heading) heading.classList.add('say-hello-text');
          const btnContainer = innerDiv.querySelector('.button-container');
          if (btnContainer) btnContainer.classList.add('say-hello-btn');
          const link = innerDiv.querySelector('a');
          if (link) link.classList.add('say-hello-link');
        }
      }
    });
  }

  if (block.closest('.say-hello-form')) {
    const rows = Array.from(block.children);
    rows.forEach((row, i) => {
      row.classList.add(`sayhello-form-${i + 1}`);
      Array.from(row.children).forEach((col, ind) => {
        col.classList.add(`sayhello-col-${ind + 1}`);
        Array.from(col.children).forEach((item, index) => {
          item.classList.add(`sayhello-item-${index + 1}`);
          Array.from(item.children).forEach((el, indd) => {
            el.classList.add(`sayhello-list-${indd + 1}`);
          });
        });
      });
    });

    // Creating form structure
    const nameLabel = block.querySelector('.sayhello-item-3 .sayhello-list-1').textContent || 'Anurag';
    const indImg = block.querySelector('.sayhello-item-3 .sayhello-list-2 img').src;
    const contCode = block.querySelector('.sayhello-item-3 .sayhello-list-2').textContent;
    const mobNumberLabel = block.querySelector('.sayhello-item-3 .sayhello-list-3').textContent;
    const btnLabel = block.querySelector('.sayhello-item-3 .sayhello-list-4').textContent;

    const sayHelloForm = div(
      { class: 'sayhello-col-2' },
      form(
        { class: 'sayhello-form' },
        div(
          { class: 'form-group' },
          div(
            { class: 'form-field name-field' },
            input({
              type: 'text', name: 'name', placeholder: nameLabel, class: 'cmmn-input',
            }),
          ),
          div(
            { class: 'form-field mob-field' },
            div(
              { class: 'select-drpdwn-wrap' },
              button(
                { class: 'drpdwn-sltxt', type: 'button' },
                img({ src: indImg, alt: 'India Flag', class: 'country-flag' }),
                span({ class: 'country-code' }, contCode),
              ),
              div(
                { class: 'drpdwn-wrap' },
                div(
                  { class: 'drpdwn-menu' },
                  button(
                    { class: 'drpdwn-list', type: 'button' },
                    img({ src: indImg, alt: 'Flag', class: 'code-flag' }),
                    span({ class: 'code-list' }, contCode),
                  ),
                  button(
                    { class: 'drpdwn-list', type: 'button' },
                    img({ src: indImg, alt: 'Flag', class: 'code-flag' }),
                    span({ class: 'code-list' }, contCode),
                  ),
                  button(
                    { class: 'drpdwn-list', type: 'button' },
                    img({ src: indImg, alt: 'Flag', class: 'code-flag' }),
                    span({ class: 'code-list' }, contCode),
                  ),
                ),
              ),
            ),
            input({
              type: 'number', name: 'mobile', placeholder: mobNumberLabel, class: 'cmmn-input',
            }),
          ),
          div(
            { class: 'formn-btn-wrap' },
            button({ type: 'submit', class: 'sayhello-submit' }, btnLabel),
          ),
        ),
      ),
    );

    const sayHelloContainer = block.querySelector('.sayhello-form-1');
    block.querySelector('.sayhello-item-3').remove();
    sayHelloContainer.appendChild(sayHelloForm);
  }
}
