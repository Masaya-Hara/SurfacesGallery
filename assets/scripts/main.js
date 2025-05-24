// loader.js

// Wait for full window load to ensure MathJax is initialized
window.addEventListener("load", async () => {
  if (window.MathJax && MathJax.startup) {
    await MathJax.startup.promise;
  }

  fetch('includes/gallery-data.json')
    .then(res => res.json())
    .then(async data => {
      const container = document.getElementById('gallery-section');
      let currentGroup = '';

      for (const section of data) {
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

        for (const file of section.items) {
          const filePath = section.prefix ? `${section.prefix}${file}` : file;
          const res = await fetch(`includes/${filePath}`);
          const html = await res.text();
          const wrapper = document.createElement('div');
          wrapper.classList.add('illustration-item');
          wrapper.innerHTML = html;
          document.getElementById(section.id).appendChild(wrapper);
        }
      }

      // Ensure MathJax is applied to the entire document after all content is added
      if (window.MathJax && MathJax.typesetPromise) {
        await MathJax.typesetPromise();
      }
    });

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

  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('a[href^="#illustration-"]');
    if (!target) return;

    const id = target.getAttribute('href').slice(1);
    const targetEl = document.getElementById(id);
    if (!targetEl) return;

    const details = targetEl.closest('details');
    if (details && !details.open) details.open = true;

    setTimeout(() => {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    e.preventDefault();
  });
});

function showSection(target) {
  const sections = ['others', 'gallery', 'about'];
  const navs = ['nav-others', 'nav-gallery', 'nav-about'];
  const body = document.body;

  sections.forEach(id => {
    const el = document.getElementById(id + '-section');
    if (el) el.style.display = (id === target) ? 'block' : 'none';
  });

  navs.forEach(id => {
    const nav = document.getElementById(id);
    if (nav) nav.classList.toggle('active', id === 'nav-' + target);
  });

  body.classList.toggle('gallery-active', target === 'gallery');

  const sidebar = document.getElementById('toc-sidebar');
  if (target === 'gallery') {
    body.classList.add('collapsed');
    sidebar.style.transform = 'translateX(-100%)';
  } else {
    body.classList.remove('collapsed');
    sidebar.style.transform = 'translateX(-100%)';
  }
}

window.showSection = showSection;

document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".surface-section summary").forEach(summary => {
      if (!summary.querySelector(".caret")) {
        const caret = document.createElement("span");
        caret.className = "caret";
        caret.innerHTML = '▸<span style="display:inline-block; width: 10px;"></span>';
        summary.prepend(caret);
      }
      summary.addEventListener("click", () => {
        setTimeout(() => {
          summary.classList.toggle("active", summary.parentElement.hasAttribute("open"));
        }, 0);
      });
    });
  });
  observer.observe(document.getElementById("gallery-section"), { childList: true, subtree: true });

  const searchInput = document.getElementById('search-input');
  let matches = [];
  let currentIndex = -1;

  function updateHighlights(query) {
    document.querySelectorAll('.highlight-match').forEach(el => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
    matches = [];
    currentIndex = -1;
    const counter = document.getElementById('search-counter');
    counter.textContent = '';
    if (!query) return;
    const elements = document.querySelectorAll('.illustration-info h3, .illustration-info p');
    elements.forEach(el => {
      const text = el.textContent;
      const regex = new RegExp(`(${query})`, 'gi');
      if (regex.test(text)) {
        el.innerHTML = text.replace(regex, '<span class="highlight-match">$1</span>');
        matches.push(...el.querySelectorAll('.highlight-match'));
      }
    });
    if (matches.length > 0) {
      counter.textContent = `1/${matches.length}`;
      currentIndex = 0;
      matches[0].classList.add('highlight-current');
    }
  }

  searchInput.addEventListener('input', e => {
    updateHighlights(e.target.value.trim());
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && matches.length > 0) {
      if (document.getElementById('gallery-section').style.display === 'none') {
        showSection('gallery');
      }
      currentIndex = (currentIndex + 1) % matches.length;
      matches.forEach(el => el.classList.remove('highlight-current'));
      const current = matches[currentIndex];
      current.classList.add('highlight-current');
      const details = current.closest('details');
      if (details && !details.open) details.open = true;
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const counter = document.getElementById('search-counter');
      counter.textContent = `${currentIndex + 1}/${matches.length}`;
    }
  });

  const toggleButton = document.getElementById('toc-toggle');
  const tocSidebar = document.getElementById('toc-sidebar');

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      document.body.classList.toggle('collapsed');
      if (document.body.classList.contains('collapsed')) {
        tocSidebar.style.transform = 'translateX(-100%)';
      } else {
        tocSidebar.style.transform = 'translateX(0)';
      }
    });
  }

  showSection('gallery');
  document.body.classList.add('collapsed');
});
