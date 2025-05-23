// assets/scripts/loader.js

// Load gallery content from JSON
document.addEventListener("DOMContentLoaded", () => {
  fetch('includes/gallery-data.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('gallery-section');
      let currentGroup = '';

      data.forEach(section => {
        if (section.group !== currentGroup) {
          const g = document.createElement('div');
          g.className = 'section-heading-wrapper';
          g.innerHTML = `<div class="section-title">${section.group}</div>`;
          container.appendChild(g);
          currentGroup = section.group;
        }

        const details = document.createElement('details');
        details.className = 'surface-section';
        details.innerHTML = `<summary class="section-heading">${section.title}</summary>
                             <div class="section-content" id="${section.id}"></div>`;
        container.appendChild(details);

        section.items.forEach(file => {
          fetch(`includes/${file}`)
            .then(res => res.text())
            .then(html => {
              const wrapper = document.createElement('div');
              wrapper.classList.add('illustration-item');
              wrapper.innerHTML = html;
              document.getElementById(section.id).appendChild(wrapper);
              if (window.MathJax) MathJax.typesetPromise([wrapper]);
            });
        });
      });
    });

  // Load additional sections
  fetch('includes/others.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('others-section').innerHTML = html;
      if (window.MathJax) MathJax.typesetPromise();
    });

  fetch('includes/about.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('about-section').innerHTML = html;
      if (window.MathJax) MathJax.typesetPromise();
    });
});
