let CLASS_PREFIXES = ['block-item', 'block-subitem', 'block-subitem-finelsub'];

export function setClassPrefixes(prefixes) {
  CLASS_PREFIXES = prefixes;
}

export function addIndexed(parentElement, level = 0) {
  if (level >= CLASS_PREFIXES.length || !parentElement.children.length) {
    return;
  }
  const prefix = CLASS_PREFIXES[level];
  const commonClass = level === 0 ? 'comlist' : `comlist-${level + 1}`;
  const { children } = parentElement;
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    const index = i + 1;
    child.classList.add(commonClass);
    child.classList.add(`${prefix}${index}`);
    addIndexed(child, level + 1);
  }
}
