(() => {
  class KnrCartIcon extends HTMLElement {
    connectedCallback() {
      document.addEventListener('knr:cart:updated', this.onCartUpdated);
    }

    disconnectedCallback() {
      document.removeEventListener('knr:cart:updated', this.onCartUpdated);
    }

    onCartUpdated = (event) => {
      const sectionHtml = event.detail?.sections?.[this.dataset.knrCartSection];
      if (!sectionHtml) return;

      const freshDocument = new DOMParser().parseFromString(sectionHtml, 'text/html');
      const freshIcon = freshDocument.querySelector('knr-cart-icon');
      if (freshIcon) this.innerHTML = freshIcon.innerHTML;
    };
  }

  if (!customElements.get('knr-cart-icon')) {
    customElements.define('knr-cart-icon', KnrCartIcon);
  }
})();
