import { loadCSS } from '../../scripts/aem.js';

export function decoratePressRelease(document) {
  const section = document.querySelector('.press-release');
  if (!section) return;

  loadCSS(`${window.hlx.codeBasePath}/components/press-release/press-release.css`);
}
