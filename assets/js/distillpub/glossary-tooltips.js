// document.addEventListener('DOMContentLoaded', (event) => {
//     tippy('.glossary-term', {
//       content(reference) {
//         const term = reference.getAttribute('data-term');
//         return glossary[term] || 'Definition not found';
//       },
//       allowHTML: true,
//       theme: 'custom',
//     });
//   });
document.addEventListener('DOMContentLoaded', (event) => {
  fetch('/assets/json/glossary.json')
    .then(response => response.json())
    .then(glossary => {
      tippy('.glossary-term', {
        content(reference) {
          const term = reference.getAttribute('data-term');
          const entry = glossary.find(item => item.term === term);
          return entry ? entry.definition : 'Definition not found';
        },
        allowHTML: true,
        theme: 'custom',
      });

      const fullGlossary = document.getElementById('full-glossary');
      if (fullGlossary) {
        glossary.forEach(entry => {
          const dt = document.createElement('dt');
          dt.textContent = entry.term;
          const dd = document.createElement('dd');
          dd.textContent = entry.definition;
          fullGlossary.appendChild(dt);
          fullGlossary.appendChild(dd);
        });
      }
    })
    .catch(error => console.error('Error loading glossary:', error));
});

// function updateMathColor() {
//   if (document.documentElement.getAttribute('data-theme') === 'dark') {
//     document.querySelectorAll('.MathJax, .MathJax *, .katex, .katex *').forEach(el => {
//       el.style.setProperty('color', 'var(--global-text-color)', 'important');
//       el.style.setProperty('border-color', 'var(--global-text-color)', 'important');
//     });
//   }
// }

// Run once when the page loads
// document.addEventListener('DOMContentLoaded', updateMathColor);

// Run whenever the theme changes (you'll need to trigger this event when changing themes)
// document.addEventListener('themeChanged', updateMathColor);