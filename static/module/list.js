import { Card } from './card.js';

export class List {
  observer = null;
  observed = null;

  getTarget() {
    return document.querySelector('section[name="result"] ul');
  }

  setCounter(count = null) {
    const counter = document.querySelector('h1 .counter');

    counter.innerText = count ?? counter.dataset.all;
  }

	toggleSections () {
    document.querySelectorAll('section').forEach(section => {
      if (section.getAttribute('name') !== 'result') {
        section.style.display = 'none';
      } else {
        section.style.display = null;
      }
    });
  }

  reset() {
    document.querySelectorAll('section').forEach(section => {
      if (section.getAttribute('name') === 'result') {
        section.style.display = 'none';
      } else {
        section.style.display = null;
      }
    });

    this.setCounter();

    if (this.observed) {
      this.observer.unobserve(this.observed);
      this.observed = null;
    }
  }

  clear () {
    document.querySelectorAll('section[name="result"] li').forEach(li => {
      li.remove();
    });

    if (this.observed) {
      this.observer.unobserve(this.observed);
      this.observed = null;
    }
  }

  startRendering(items, batchSize = 12) {
    const total = items.length;
    this.observed = document.querySelector('footer');
    let rendered = 0;

    const renderBatch = () => {
      const next = items.slice(rendered, rendered + batchSize);
      next.forEach(pkg => {
        const li = document.createElement('li');
        li.appendChild((new Card(pkg)).render());
        this.getTarget().appendChild(li);
      });
      rendered += next.length;

      if (rendered >= total) {
        // stop observing
        this.observer.disconnect();
      }
    };

    const isFooterVisibleEnough = () => {
      const rect = this.observed.getBoundingClientRect();
      const height = rect.height || 1;
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
      const visibleRatio = visibleHeight / height;
      return visibleRatio >= 0.2;
    };

    // Render until the footer is pushed below visibility threshold
    while (rendered < total && isFooterVisibleEnough()) {
      renderBatch();
    }

    // Set up observer for future scroll-triggered batches
    this.observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.intersectionRatio >= 0.2)) {
        renderBatch();
      }
    }, {
      root: null,
      threshold: 0.2,
    });

    if (rendered < total) {
      this.observer.observe(this.observed);
    }
  }
}
