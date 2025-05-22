// main.js — Final version with full Safari fix, consistent ordering, and robust toggle logic

document.addEventListener('DOMContentLoaded', () => {
  const othersFetch = fetch('includes/others.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('others-section').innerHTML = html;
    });

  const aboutFetch = fetch('includes/about.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('about-section').innerHTML = html;
    });

  const galleryData = [
    { id: 'minimal-r3', title: String.raw`Minimal surfaces`, group: String.raw`\(\bigcirc\) \(\mathbb{R}^3\)` },
    { id: 'cmc-r3', title: String.raw`CMC \(1\) surfaces`, group: String.raw`\(\bigcirc\) \(\mathbb{R}^3\)` },
    { id: 'cmc-s3', title: String.raw`CMC \(1\) surfaces`, group: String.raw`\(\bigcirc\) \(\mathbb{S}^3\)` },
    { id: 'cmc-h3', title: String.raw`CMC \(1\) surfaces`, group: String.raw`\(\bigcirc\) \(\mathbb{H}^3\)` },
  ];

  const contentFiles = {
    'minimal-r3': ['enneper.html', 'scherk.html'],
    'cmc-r3': [],
    'cmc-s3': ['enneper.html', 'scherk.html'],
    'cmc-h3': ['enneper.html', 'scherk.html'],
  };

  const buildGallery = () => {
    const container = document.getElementById('gallery-section');
    let currentGroup = '';
    galleryData.forEach(({ id, title, group }) => {
      if (group !== currentGroup) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'section-heading-wrapper';
        groupDiv.innerHTML = `<div class="section-title">${group}</div>`;
        container.appendChild(groupDiv);
        currentGroup = group;
      }

      const headingWrapper = document.createElement('div');
      headingWrapper.className = 'section-heading-wrapper';
      const heading = document.createElement('div');
      heading.className = 'section-heading';
      heading.innerHTML = `<span class="caret">▸</span>${title}`;
      heading.setAttribute('data-section', id);
      heading.onclick = () => toggleSection(heading, id);
      headingWrapper.appendChild(heading);
      container.appendChild(headingWrapper);

      const contentDiv = document.createElement('div');
      contentDiv.id = id;
      contentDiv.style.display = 'none';
      container.appendChild(contentDiv);
    });
  };

  const loadGalleryContent = () => {
    const promises = [];
    Object.entries(contentFiles).forEach(([id, files]) => {
      const section = document.getElementById(id);
      files.forEach(file => {
        const p = fetch(`includes/${file}`)
          .then(res => res.text())
          .then(html => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('fade-in');
            wrapper.innerHTML = html;
            section.appendChild(wrapper);
          });
        promises.push(p);
      });
    });
    return Promise.all(promises);
  };

  Promise.all([othersFetch, aboutFetch]).then(() => {
    buildGallery();
    loadGalleryContent().then(() => {
      if (window.MathJax) {
        MathJax.typesetPromise().then(() => showSection('gallery'));
      } else {
        showSection('gallery');
      }
    });
  });

  // Toggle logic with Safari fallback
  window.toggleSection = function (headingEl, id) {
    const section = document.getElementById(id);
    const isOpen = section.classList.contains('open');
    headingEl.classList.toggle('active', !isOpen);

    if (!isOpen) {
      section.classList.add('open');
      section.style.display = 'block';
      section.style.maxHeight = '0px';
      requestAnimationFrame(() => {
        section.style.transition = 'max-height 0.6s ease';
        section.style.maxHeight = section.scrollHeight + 'px';
      });
      section.addEventListener('transitionend', function finalizeOpen(e) {
        if (e.propertyName === 'max-height') {
          section.style.maxHeight = 'none';
          section.style.overflow = 'visible';
          section.removeEventListener('transitionend', finalizeOpen);
        }
      }, { once: true });
    } else {
      section.style.transition = 'max-height 0.6s ease';
      section.style.maxHeight = section.scrollHeight + 'px';
      requestAnimationFrame(() => {
        section.style.maxHeight = '0px';
      });
      section.addEventListener('transitionend', function finalizeClose(e) {
        if (e.propertyName === 'max-height') {
          section.classList.remove('open');
          section.style.display = 'none';
          section.style.overflow = 'visible';
          section.style.maxHeight = 'none';
          section.removeEventListener('transitionend', finalizeClose);
        }
      }, { once: true });
    }
  };

  // Navigation switcher
  window.showSection = function (target) {
    const sections = ['others', 'gallery', 'about'];
    const navs = ['nav-others', 'nav-gallery', 'nav-about'];
    sections.forEach(id => {
      const el = document.getElementById(id + '-section');
      if (el) el.style.display = (id === target) ? 'block' : 'none';
    });
    navs.forEach(id => {
      const nav = document.getElementById(id);
      if (nav) nav.classList.toggle('active', id === 'nav-' + target);
    });

    if (target !== 'gallery') {
      const openSections = document.querySelectorAll('#gallery-section .open');
      openSections.forEach(section => {
        const headingEl = section.previousElementSibling;
        if (headingEl && headingEl.classList.contains('section-heading')) {
          toggleSection(headingEl, section.id);
        }
      });
    }
  };

  // Gallery dropdown hover handler
  const navGallery = document.getElementById('nav-gallery');
  const dropdown = document.getElementById('gallery-dropdown');
  navGallery.parentElement.addEventListener('mouseenter', () => {
    dropdown.style.display = 'block';
    document.getElementById('gallery-caret').style.transform = 'rotate(90deg)';
  });
  navGallery.parentElement.addEventListener('mouseleave', () => {
    dropdown.style.display = 'none';
    document.getElementById('gallery-caret').style.transform = 'rotate(0deg)';
  });

  // Scroll to section by ID
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Scroll and open specific gallery subsection
  window.handleSurfaceNav = function(sectionId) {
    showSection('gallery');
    setTimeout(() => {
      const heading = document.querySelector(`[data-section="${sectionId}"]`);
      const section = document.getElementById(sectionId);
      if (heading && section) {
        const isOpen = section.classList.contains('open');
        if (!isOpen) heading.click();
        const yOffset = -60;
        const y = heading.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 300);
  };
});
