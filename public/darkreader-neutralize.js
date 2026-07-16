(function() {
  if (typeof window === 'undefined') return;
  
  const DARKREADER_ATTRS = [
    'data-darkreader-inline-stroke',
    'data-darkreader-inline-fill',
    'data-darkreader-inline-stopcolor',
    'data-darkreader-inline-bgcolor',
    'data-darkreader-inline-color',
    'data-darkreader-inline-backgroundcolor',
  ];
  
  const DARKREADER_VARS = [
    '--darkreader-inline-stroke',
    '--darkreader-inline-fill',
    '--darkreader-inline-stopcolor',
    '--darkreader-inline-bgcolor',
    '--darkreader-inline-color',
    '--darkreader-inline-backgroundcolor',
  ];
  
  function neutralize() {
    DARKREADER_ATTRS.forEach(attr => {
      document.querySelectorAll('[' + attr + ']').forEach(el => {
        el.removeAttribute(attr);
      });
    });
    
    DARKREADER_VARS.forEach(v => {
      document.querySelectorAll('[' + v + ']').forEach(el => {
        el.style.removeProperty(v);
      });
    });
    
    document.querySelectorAll('[data-darkreader-mode]').forEach(el => {
      el.style.filter = 'none';
    });
    
    document.querySelectorAll('svg').forEach(svg => {
      svg.style.colorScheme = 'normal';
      svg.style.filter = 'none';
    });
  }
  
  neutralize();
  const times = [50, 100, 200, 400, 800, 1600, 3200];
  times.forEach(t => setTimeout(neutralize, t));
  setInterval(neutralize, 2000);
  
  const observer = new MutationObserver(neutralize);
  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
  });
})();
