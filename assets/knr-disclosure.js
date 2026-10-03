(() => {
  const HEIGHT_TIMING = { duration: 500, easing: 'cubic-bezier(0.75, 0, 0.175, 1)' };
  const CONTENT_TIMING = { duration: 250, delay: 200, easing: 'cubic-bezier(0.75, 0, 0.175, 1)', fill: 'backwards' };

  class KnrDisclosure extends HTMLElement {
    connectedCallback() {
      this.details = this.querySelector('details');
      this.summary = this.details?.querySelector('summary');
      this.content = this.details?.querySelector('[data-knr-disclosure-content]');
      if (!this.summary || !this.content) return;

      this.summary.addEventListener('click', this.onClick);
    }

    disconnectedCallback() {
      this.summary?.removeEventListener('click', this.onClick);
    }

    onClick = (event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      event.preventDefault();

      const isOpening = !this.details.open || this.isClosing;
      if (isOpening) {
        this.open();
      } else {
        this.close();
      }
    };

    getBorders() {
      return this.details.offsetHeight - this.details.clientHeight;
    }

    open() {
      const startHeight = this.details.offsetHeight;
      this.isClosing = false;
      this.details.open = true;

      const endHeight = this.details.scrollHeight + this.getBorders();

      this.animateHeight(startHeight, endHeight);
      this.content.animate(
        { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] },
        CONTENT_TIMING,
      );
    }

    close() {
      this.isClosing = true;

      this.animateHeight(this.details.offsetHeight, this.summary.offsetHeight + this.getBorders(), () => {
        this.details.open = false;
        this.isClosing = false;
      });
    }

    animateHeight(from, to, onFinish) {
      this.animation?.cancel();
      this.details.style.overflow = 'hidden';

      this.animation = this.details.animate({ height: [`${from}px`, `${to}px`] }, HEIGHT_TIMING);
      this.animation.onfinish = () => {
        this.details.style.overflow = '';
        this.animation = null;
        onFinish?.();
      };
    }
  }

  if (!customElements.get('knr-disclosure')) {
    customElements.define('knr-disclosure', KnrDisclosure);
  }
})();
