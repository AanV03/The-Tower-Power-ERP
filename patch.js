const fs = require('fs');

let css = fs.readFileSync('app/globals.css', 'utf8');

if (!css.includes('contrast-medium.css')) {
    css = css.replace('@import "shadcn/tailwind.css";', '@import "shadcn/tailwind.css";\n@import "../styles/contrast-medium.css";\n@import "../styles/contrast-high.css";');
}

const replacements = [
    ['rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)', 'rgba(255, 255, 255, 0.15), rgba(248, 250, 252, 0.05)'],
    ['rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.88)', 'rgba(255, 255, 255, 0.15), rgba(248, 250, 252, 0.05)'],
    ['rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)', 'rgba(255, 255, 255, 0.2), rgba(248, 250, 252, 0.1)'],
    ['rgba(14, 16, 24, 0.98), rgba(9, 10, 15, 0.94)', 'rgba(14, 16, 24, 0.4), rgba(9, 10, 15, 0.5)'],
    ['rgba(13, 15, 24, 0.99), rgba(7, 8, 13, 0.97)', 'rgba(13, 15, 24, 0.4), rgba(7, 8, 13, 0.5)'],
    ['rgba(15, 17, 25, 0.99), rgba(9, 10, 15, 0.97)', 'rgba(15, 17, 25, 0.5), rgba(9, 10, 15, 0.6)']
];

for (const [oldStr, newStr] of replacements) {
    css = css.replaceAll(oldStr, newStr);
}

const missingGlassClasses = `
  .glass-menu {
    @apply border border-[var(--sidebar-border-color)] text-[var(--sidebar-text-primary)] shadow-[var(--glass-shadow)] backdrop-blur-lg backdrop-saturate-150;
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  }
`;

if (!css.includes('.glass-menu {')) {
    css = css.replace('.glass-topbar {', missingGlassClasses.trim() + '\n\n  .glass-topbar {');
}

const missingDarkGlassClasses = `
  .dark .glass-menu.glass-topbar {
    background:
      linear-gradient(180deg, rgba(15, 17, 25, 0.5), rgba(9, 10, 15, 0.6)),
      var(--topbar-bg);
  }

  .dark .glass-menu.glass-sidebar {
    background:
      linear-gradient(180deg, rgba(15, 17, 25, 0.5), rgba(9, 10, 15, 0.6)),
      var(--sidebar-bg);
  }
`;

if (!css.includes('.dark .glass-menu.glass-topbar')) {
    css = css.replace('.erp-module-hero {', missingDarkGlassClasses.trim() + '\n\n  .erp-module-hero {');
}

const missingLightGlassClasses = `
  .glass-menu.glass-topbar {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(248, 250, 252, 0.1)),
      var(--topbar-bg);
  }

  .glass-menu.glass-sidebar {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(248, 250, 252, 0.1)),
      var(--sidebar-bg);
  }
`;

if (!css.includes('.glass-menu.glass-topbar')) {
    css = css.replace('.dark .glass-topbar .glass-control {', missingLightGlassClasses.trim() + '\n\n  .dark .glass-topbar .glass-control {');
}

const fontCss = `
/* Accessibility Font Overrides */
:root[data-font="serif"] * {
  font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
}

:root[data-font="mono"] * {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}

:root[data-font="elegant"] * {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
`;

if (!css.includes('/* Accessibility Font Overrides */')) {
    css += fontCss;
}

fs.writeFileSync('app/globals.css', css);
console.log('Patched correctly!');
