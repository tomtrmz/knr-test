(() => {
  const FADE = { duration: 400, easing: 'ease-out' };

  class KnrTestimonials extends HTMLElement {
    connectedCallback() {
      this.slides = [...this.querySelectorAll('[data-knr-testimonials-slide]')];
      if (this.slides.length < 2) return;

      const template = this.dataset.slidePosition || '';
      this.slides.forEach((slide, index) => {
        slide.setAttribute(
          'aria-label',
          template.replace('[index]', index + 1).replace('[count]', this.slides.length),
        );
      });

      this.prevButton = this.querySelector('[data-knr-testimonials-prev]');
      this.nextButton = this.querySelector('[data-knr-testimonials-next]');
      this.prevButton?.addEventListener('click', this.onPrev);
      this.nextButton?.addEventListener('click', this.onNext);
      this.addEventListener('shopify:block:select', this.onBlockSelect);

      this.show(0, false);
    }

    disconnectedCallback() {
      this.prevButton?.removeEventListener('click', this.onPrev);
      this.nextButton?.removeEventListener('click', this.onNext);
      this.removeEventListener('shopify:block:select', this.onBlockSelect);
    }

    onPrev = () => this.show(this.current - 1);

    onNext = () => this.show(this.current + 1);

    onBlockSelect = (event) => {
      const index = this.slides.findIndex((slide) => slide.contains(event.target) || event.target.contains(slide));
      if (index !== -1) this.show(index, false);
    };

    show(index, animate = true) {
      const count = this.slides.length;
      this.current = (index + count) % count;

      this.slides.forEach((slide, i) => {
        slide.hidden = i !== this.current;
      });

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (animate && !reduceMotion) {
        this.slides[this.current].animate({ opacity: [0, 1] }, FADE);
      }
    }
  }

  if (!customElements.get('knr-testimonials')) {
    customElements.define('knr-testimonials', KnrTestimonials);
  }
})();
