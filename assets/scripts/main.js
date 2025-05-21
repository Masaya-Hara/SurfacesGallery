function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

function showSection(target) {
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
}

window.addEventListener('DOMContentLoaded', () => {
  showSection('others');
});

function toggleSection(headingEl, id) {
  const section = document.getElementById(id);
  const isOpen = section.classList.contains('open');
  headingEl.classList.toggle('active', !isOpen);

  // Reset transition state
  section.style.transition = 'max-height 0.8s ease';
  section.style.overflow = 'hidden';
  section.style.position = 'relative';
  section.style.zIndex = '0';

  if (!isOpen) {
    section.classList.add('open');
    section.style.display = 'block';
    section.style.maxHeight = '0px';

    // Force reflow
    void section.offsetHeight;

    section.style.maxHeight = section.scrollHeight + 'px';

    section.addEventListener('transitionend', function handleOpen(e) {
      if (e.propertyName !== 'max-height') return;
      section.style.maxHeight = 'none'; // Allow natural expansion after transition
      section.style.overflow = 'visible';
      section.removeEventListener('transitionend', handleOpen);
    });
  } else {
    section.style.maxHeight = section.scrollHeight + 'px';

    // Force reflow
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
}

fetch('../../includes/About/about.html')
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('about-section');
    container.innerHTML = html;
    MathJax.typeset();  // 数式再レンダリング
  });
fetch('../../includes/Others/others.html')
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('others-section');
    container.innerHTML = html;
    MathJax.typeset();  // 数式再レンダリング
  });