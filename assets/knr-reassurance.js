(() => {
  class KnrReassurance extends HTMLElement {
    connectedCallback() {
      this.slides = [...this.querySelectorAll('[data-knr-slide]')];
      this.region = this.querySelector('[data-knr-slides]');
      this.index = 0;

      this.show(0);
      if (this.slides.length < 2) return;

      this.interval = Number(this.dataset.interval) || 5000;
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.classPrefix = this.dataset.classPrefix || 'knr-reassurance';
      if (this.dataset.media) {
        this.mediaQuery = window.matchMedia(this.dataset.media);
        this.mediaQuery.addEventListener('change', this.onMediaChange);
      }

      this.renderControls();
      this.addEventListener('mouseenter', this.stop);
      this.addEventListener('mouseleave', this.start);
      this.addEventListener('focusin', this.stop);
      this.addEventListener('focusout', this.onFocusOut);
      this.start();
    }

    disconnectedCallback() {
      this.stop();
      this.mediaQuery?.removeEventListener('change', this.onMediaChange);
    }

    onMediaChange = () => {
      if (this.mediaQuery.matches) {
        this.start();
      } else {
        this.stop();
      }
    };

    renderControls() {
      const controls = document.createElement('div');
      controls.className = `${this.classPrefix}__controls`;

      const dots = document.createElement('div');
      dots.className = `${this.classPrefix}__dots`;

      this.dots = this.slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `${this.classPrefix}__dot`;
        dot.setAttribute('aria-label', this.dataset.labelGoTo.replace('[index]', index + 1));
        dot.addEventListener('click', () => {
          this.region.setAttribute('aria-live', 'polite');
          this.show(index);
        });
        dots.append(dot);
        return dot;
      });

      controls.append(dots);
      this.append(controls);
      this.updateControls();
    }

    show(index) {
      this.index = (index + this.slides.length) % this.slides.length;
      this.slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === this.index);
      });
      this.updateControls();
    }

    start = () => {
      if (this.prefersReducedMotion || this.timer) return;
      if (this.mediaQuery && !this.mediaQuery.matches) return;
      this.region.setAttribute('aria-live', 'off');
      this.timer = window.setInterval(() => this.show(this.index + 1), this.interval);
    };

    stop = () => {
      window.clearInterval(this.timer);
      this.timer = null;
    };

    onFocusOut = (event) => {
      if (!this.contains(event.relatedTarget)) this.start();
    };

    updateControls() {
      this.dots?.forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === this.index));
      });
    }
  }

  if (!customElements.get('knr-reassurance')) {
    customElements.define('knr-reassurance', KnrReassurance);
  }
})();
