(() => {
  class KnrProductZoom extends HTMLElement {
    connectedCallback() {
      this.dialog = this.querySelector('[data-knr-zoom-dialog]');
      if (!this.dialog) return;

      this.items = [...this.dialog.querySelectorAll('[data-knr-zoom-item]')];
      this.addEventListener('click', this.onClick);
      this.dialog.addEventListener('close', this.onClose);
    }

    disconnectedCallback() {
      this.removeEventListener('click', this.onClick);
      this.dialog?.removeEventListener('close', this.onClose);
      this.onClose();
    }

    onClick = (event) => {
      const button = event.target.closest('[data-knr-zoom-open]');
      if (!button) return;

      document.documentElement.style.overflow = 'hidden';
      this.dialog.showModal();

      this.items[Number(button.dataset.knrZoomOpen)]?.scrollIntoView({ block: 'start' });
    };

    onClose = () => {
      document.documentElement.style.overflow = '';
    };
  }

  if (!customElements.get('knr-product-zoom')) {
    customElements.define('knr-product-zoom', KnrProductZoom);
  }
})();
