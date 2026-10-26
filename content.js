// CodeChef Clipboard Helper - Content Script

// 1. Unblock keyboard shortcuts (Ctrl+V, Ctrl+C, Ctrl+A, Ctrl+X) from being intercepted by CodeChef
function unblockKeydown(e) {
  if (e.ctrlKey || e.metaKey) {
    const k = e.key ? e.key.toLowerCase() : '';
    if (k === 'v' || k === 'c' || k === 'a' || k === 'x' || e.keyCode === 86 || e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 88) {
      e.stopImmediatePropagation();
    }
  }
}
window.addEventListener('keydown', unblockKeydown, true);
document.addEventListener('keydown', unblockKeydown, true);

// 2. Unblock Copy / Paste / Cut / ContextMenu
['copy', 'paste', 'cut', 'contextmenu', 'beforeinput'].forEach((eventType) => {
  window.addEventListener(eventType, (e) => {
    e.stopImmediatePropagation();
  }, true);
  document.addEventListener(eventType, (e) => {
    e.stopImmediatePropagation();
  }, true);
});
