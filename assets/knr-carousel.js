(() => {
  class KnrCarousel extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-knr-carousel-track]');
      if (!this.track) return;

      this.buttons = [...this.querySelectorAll('[data-knr-carousel-prev], [data-knr-carousel-next]')];
      this.buttons.forEach((button) => button.addEventListener('click', this.onButtonClick));

      this.hideAtEdges = this.hasAttribute('data-hide-at-edges');
      this.progress = this.querySelector('[data-knr-carousel-progress]');
      this.track.addEventListener('scroll', this.onScroll, { passive: true });

      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.track);
      this.onResize();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      this.track?.removeEventListener('scroll', this.onScroll);
      this.buttons?.forEach((button) => button.removeEventListener('click', this.onButtonClick));
    }

    onResize = () => {
      this.updateButtons();
      this.updateProgress();
      this.updateFocusable();
    };

    updateFocusable() {
      if (this.hasOverflow()) {
        this.track.tabIndex = 0;
      } else {
        this.track.removeAttribute('tabindex');
      }
    }

    onScroll = () => {
      if (this.hideAtEdges) this.updateButtons();
      this.updateProgress();
    };

    onButtonClick = (event) => {
      const direction = event.currentTarget.hasAttribute('data-knr-carousel-next') ? 1 : -1;
      this.scrollByItem(direction);
    };

    getFirstItem() {
      let item = this.track.firstElementChild;
      while (item && getComputedStyle(item).display === 'contents') {
        item = item.firstElementChild;
      }
      return item;
    }

    scrollByItem(direction) {
      const item = this.getFirstItem();
      if (!item) return;

      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      const step = item.getBoundingClientRect().width + gap;
      const maxScroll = this.track.scrollWidth - this.track.clientWidth;
      const isAtEnd = this.track.scrollLeft >= maxScroll - 1;

      if (direction > 0 && isAtEnd && !this.hideAtEdges) {
        this.track.scrollTo({ left: 0, behavior });
        return;
      }

      const currentIndex = Math.round(this.track.scrollLeft / step);
      const target = Math.min(Math.max((currentIndex + direction) * step, 0), maxScroll);
      this.track.scrollTo({ left: target, behavior });
    }

    hasOverflow() {
      return this.track.scrollWidth > this.track.clientWidth + 1;
    }

    updateButtons = () => {
      const hasOverflow = this.hasOverflow();
      const maxScroll = this.track.scrollWidth - this.track.clientWidth;
      const isAtStart = this.track.scrollLeft <= 1;
      const isAtEnd = this.track.scrollLeft >= maxScroll - 1;

      this.buttons.forEach((button) => {
        const isNext = button.hasAttribute('data-knr-carousel-next');
        const isUseless = this.hideAtEdges && (isNext ? isAtEnd : isAtStart);
        button.hidden = !hasOverflow || isUseless;
      });
    };

    updateProgress = () => {
      if (!this.progress) return;

      const hasOverflow = this.hasOverflow();
      this.progress.hidden = !hasOverflow;
      if (!hasOverflow) return;

      const maxScroll = this.track.scrollWidth - this.track.clientWidth;
      const visible = this.track.clientWidth / this.track.scrollWidth;
      const progress = maxScroll > 0 ? this.track.scrollLeft / maxScroll : 0;

      this.progress.style.setProperty('--knr-carousel-visible', visible.toFixed(3));
      this.progress.style.setProperty('--knr-carousel-progress', progress.toFixed(3));
    };
  }

  if (!customElements.get('knr-carousel')) {
    customElements.define('knr-carousel', KnrCarousel);
  }
})();
