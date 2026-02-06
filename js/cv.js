/**
 * CV Page JavaScript
 * Handles print and download functionality
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const printBtn = document.getElementById('print-btn');
  const downloadBtn = document.getElementById('download-btn');

  // ==================== Print Functionality ====================
  function handlePrint() {
    window.print();
  }

  // ==================== Download PDF ====================
  function handleDownload() {
    // Direct link to PDF file
    const pdfUrl = 'assets/pdf/Kong_Vungsovanreach_CV_20260206.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Kong_Vungsovanreach_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==================== Initialize ====================
  function init() {
    // Event listeners
    printBtn?.addEventListener('click', handlePrint);
    downloadBtn?.addEventListener('click', handleDownload);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + P for print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    });
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
