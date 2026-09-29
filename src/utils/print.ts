export const handlePrintSection = (elementId: string, orientation: 'portrait' | 'landscape' = 'portrait', isPassport: boolean = false) => {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Print element not found: ${elementId}`);
    return;
  }
  
  // Clone the element so we can isolate it cleanly outside the React root
  const clone = el.cloneNode(true) as HTMLElement;
  clone.id = 'print-clone-container';
  
  // Apply print classes to the body
  document.body.classList.add('printing');
  document.body.classList.add(`print-${orientation}`);
  if(isPassport) {
    document.body.classList.add('print-passport');
    // If passport, override styles to show all pages
    const pages = clone.querySelectorAll('.passport-page');
    pages.forEach(p => {
       (p as HTMLElement).style.display = 'block';
    });
  }
  
  // Append the clone directly to the body
  document.body.appendChild(clone);
  
  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    
    document.body.classList.remove('printing');
    document.body.classList.remove(`print-${orientation}`);
    document.body.classList.remove('print-passport');
    
    const cloneNode = document.getElementById('print-clone-container');
    if (cloneNode && cloneNode.parentNode === document.body) {
      document.body.removeChild(cloneNode);
    }
    
    window.removeEventListener('afterprint', cleanup);
    window.removeEventListener('focus', cleanup);
    window.removeEventListener('mousemove', cleanup);
    window.removeEventListener('touchstart', cleanup);
  };
  
  // Standard cleanup when print dialog closes
  window.addEventListener('afterprint', cleanup);
  
  // Fallbacks: if afterprint doesn't fire, cleanup as soon as they interact with the window again
  window.addEventListener('focus', cleanup);
  window.addEventListener('mousemove', () => {
    // Only cleanup on mouse move if we're sure the print dialog should be gone
    // We add a tiny delay so it doesn't instantly trigger if they were moving the mouse as they clicked
    setTimeout(cleanup, 1000);
  }, { once: true });
  window.addEventListener('touchstart', cleanup, { once: true });
  
  // Call window.print synchronously. Browsers force a layout flush before printing, 
  // and doing this synchronously prevents popup blockers from stopping it due to lost user activation.
  try {
    window.print();
  } catch (err) {
    console.error('Print failed', err);
    cleanup();
  }
  
  // Fallback: Some mobile/embedded browsers don't fire afterprint reliably.
  // If the classes are still there after 3 seconds, clean them up anyway.
  setTimeout(cleanup, 3000);
};
