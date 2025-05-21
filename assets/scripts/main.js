// main.js
// Dynamically load and structure the surfaces-section with minimal and CMC surfaces

document.addEventListener('DOMContentLoaded', () => {
  // Define surface section metadata with MathJax-formatted titles and group labels
  const surfacesData = [
    { id: 'minimal-r3', title: String.raw`Minimal surfaces in \(\mathbb{R}^3\)`, group: String.raw`\(\bigcirc\) Surfaces in \(\mathbb{R}^3\)` },
    { id: 'cmc-r3', title: String.raw`CMC \(1\) surfaces in \(\mathbb{R}^3\)` },
    { id: 'cmc-s3', title: String.raw`CMC \(1\) surfaces in \(\mathbb{S}^3\)`, group: String.raw`\(\bigcirc\) Surfaces in \(\mathbb{S}^3\)` },
    { id: 'cmc-h3', title: String.raw`CMC \(1\) surfaces in \(\mathbb{H}^3\)`, group: String.raw`\(\bigcirc\) Surfaces in \(\mathbb{H}^3\)` },
  ];

  const container = document.getElementById('surfaces-section');
  let currentGroup = '';

  // Loop through each surface entry and generate group headings and content blocks
  surfacesData.forEach(({ id, title, group }) => {
    if (group && group !== currentGroup) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'section-heading-wrapper';
      groupDiv.innerHTML = `<div class="section-title">${group}</div>`;
      container.appendChild(groupDiv);
      currentGroup = group;
    }

    // Create collapsible section heading
    const headingWrapper = document.createElement('div');
    headingWrapper.className = 'section-heading-wrapper';
    const heading = document.createElement('div');
    heading.className = 'section-heading';
    heading.innerHTML = `<span class="caret">▸</span>${title}`;
    heading.onclick = () => toggleSection(heading, id);
    headingWrapper.appendChild(heading);
    container.appendChild(headingWrapper);

    // Ensure MathJax renders section titles immediately after insertion
    if (window.MathJax) {
      MathJax.typesetPromise([heading]);
    }

    // Create container for the inner contents of this surface category
    const contentDiv = document.createElement('div');
    contentDiv.id = id;
    contentDiv.style.display = 'none';
    contentDiv.style.transition = 'all 0.4s ease';
    container.appendChild(contentDiv);
  });

  // Load HTML content for each section and render it
  Promise.resolve().then(() => {
    const contentFiles = {
      'minimal-r3': ['scherk.html', 'enneper.html'],
      'cmc-r3': [],
      'cmc-s3': ['scherk.html', 'enneper.html'],
      'cmc-h3': ['scherk.html', 'enneper.html'],
    };

    Object.entries(contentFiles).forEach(([id, files]) => {
      const section = document.getElementById(id);
      files.forEach(file => {
        fetch(`includes/${file}`)
          .then(res => res.text())
          .then(html => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('fade-in');
            wrapper.innerHTML = html;
            section.appendChild(wrapper);

            // Ensure MathJax renders dynamically inserted surface descriptions
            if (window.MathJax) {
              requestAnimationFrame(() => {
                MathJax.typesetPromise([wrapper]);
              });
            }
          });
      });
    });
  });

  // Toggle the open/close state of a section
  window.toggleSection = function (headingEl, id) {
    const section = document.getElementById(id);
    const isOpen = section.classList.contains('open');
    headingEl.classList.toggle('active', !isOpen);

    section.style.transition = 'max-height 0.8s ease';
    section.style.overflow = 'hidden';
    section.style.position = 'relative';
    section.style.zIndex = '0';

    if (!isOpen) {
      section.classList.add('open');
      section.style.display = 'block';
      section.style.maxHeight = '0px';
      void section.offsetHeight;
      section.style.maxHeight = section.scrollHeight + 'px';

      section.addEventListener('transitionend', function handleOpen(e) {
        if (e.propertyName !== 'max-height') return;
        section.style.maxHeight = 'none';
        section.style.overflow = 'visible';
        section.removeEventListener('transitionend', handleOpen);
      });
    } else {
      section.style.maxHeight = section.scrollHeight + 'px';
      void section.offsetHeight;
      section.style.maxHeight = '0px';

      section.addEventListener('transitionend', function handleClose(e) {
        if (e.propertyName !== 'max-height') return;
        section.classList.remove('open');
        section.style.display = 'none';
        section.style.overflow = 'visible';
        section.style.maxHeight = 'none';
        section.removeEventListener('transitionend', handleClose);
      });
    }
  };

  // Show the selected top-level section and highlight the corresponding nav tab
  window.showSection = function (target) {
    const sections = ['others', 'surfaces', 'about'];
    const navs = ['nav-others', 'nav-surfaces', 'nav-about'];
    sections.forEach(id => {
      const el = document.getElementById(id + '-section');
      if (el) el.style.display = (id === target) ? 'block' : 'none';
    });
    navs.forEach(id => {
      const nav = document.getElementById(id);
      if (nav) nav.classList.toggle('active', id === 'nav-' + target);
    });
  };

  // Setup dropdown behavior for "Surfaces" navigation item
  const navSurfaces = document.getElementById('nav-surfaces');
  const dropdown = document.getElementById('surfaces-dropdown');
  navSurfaces.parentElement.addEventListener('mouseenter', () => {
    dropdown.style.display = 'block';
    document.getElementById('surfaces-caret').style.transform = 'rotate(90deg)';
  });
  navSurfaces.parentElement.addEventListener('mouseleave', () => {
    dropdown.style.display = 'none';
    document.getElementById('surfaces-caret').style.transform = 'rotate(0deg)';
  });

  // Smooth scroll to a specific surface subsection
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Show the "surfaces" section by default when the page loads
  showSection('surfaces');
});
