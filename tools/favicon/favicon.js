/**
 * Favicon Generator Tool
 */
(function() {
  'use strict';

  // ==================== State ====================
  // Separate state for each tab to keep them independent
  const imageState = {
    sourceImage: null,
    sourceCanvas: null,
    background: 'transparent',
    shape: 'square',
    padding: 0,
    useGradient: false,
    gradientColor1: '#3b82f6',
    gradientColor2: '#8b5cf6',
    gradientDirection: 'to bottom'
  };

  const textState = {
    sourceImage: null,
    sourceCanvas: null,
    background: '#3b82f6',
    shape: 'square',
    padding: 0,
    text: 'F',
    textFont: 'Inter, sans-serif',
    textColor: '#ffffff',
    useGradient: false,
    gradientColor1: '#3b82f6',
    gradientColor2: '#8b5cf6',
    gradientDirection: 'to bottom'
  };

  const emojiState = {
    sourceImage: null,
    sourceCanvas: null,
    background: '#3b82f6',
    shape: 'square',
    padding: 0,
    emoji: '🎨',
    useGradient: false,
    gradientColor1: '#3b82f6',
    gradientColor2: '#8b5cf6',
    gradientDirection: 'to bottom'
  };

  // Current active mode
  let currentMode = 'image';

  // Favicon sizes
  const SIZES = [16, 32, 48, 64, 128, 256];
  const APPLE_SIZE = 180;
  const ANDROID_SIZES = [192, 512];

  // ==================== DOM Elements ====================
  const elements = {
    // Tab navigation
    tabs: document.querySelectorAll('.tool-tab'),
    panels: document.querySelectorAll('.favicon-panel'),
    // Image panel
    uploadArea: document.getElementById('uploadArea'),
    imageInput: document.getElementById('imageInput'),
    imageCreator: document.getElementById('imageCreator'),
    imagePreviewCanvas: document.getElementById('imagePreviewCanvas'),
    imageSourceInfo: document.getElementById('imageSourceInfo'),
    changeImageBtn: document.getElementById('changeImageBtn'),
    imageBgOptions: document.getElementById('imageBgOptions'),
    imageCreatorBgColor: document.getElementById('imageCreatorBgColor'),
    imageCreatorGradient: document.getElementById('imageCreatorGradient'),
    imageGradientColor1: document.getElementById('imageGradientColor1'),
    imageGradientColor2: document.getElementById('imageGradientColor2'),
    imageShapeOptions: document.getElementById('imageShapeOptions'),
    imagePaddingSlider: document.getElementById('imagePaddingSlider'),
    imagePaddingValue: document.getElementById('imagePaddingValue'),
    imageInlineEditor: document.getElementById('imageInlineEditor'),
    // Text panel
    textInput: document.getElementById('textInput'),
    textFont: document.getElementById('textFont'),
    textColor: document.getElementById('textColor'),
    textBgOptions: document.getElementById('textBgOptions'),
    textCreatorBgColor: document.getElementById('textCreatorBgColor'),
    textCreatorGradient: document.getElementById('textCreatorGradient'),
    textGradientColor1: document.getElementById('textGradientColor1'),
    textGradientColor2: document.getElementById('textGradientColor2'),
    textShapeOptions: document.getElementById('textShapeOptions'),
    textPaddingSlider: document.getElementById('textPaddingSlider'),
    textPaddingValue: document.getElementById('textPaddingValue'),
    createTextBtn: document.getElementById('createTextBtn'),
    textPreviewCanvas: document.getElementById('textPreviewCanvas'),
    textInlineEditor: document.getElementById('textInlineEditor'),
    // Emoji panel
    emojiInput: document.getElementById('emojiInput'),
    emojiBtns: document.querySelectorAll('.emoji-btn'),
    emojiBgOptions: document.getElementById('emojiBgOptions'),
    emojiCreatorBgColor: document.getElementById('emojiCreatorBgColor'),
    emojiCreatorGradient: document.getElementById('emojiCreatorGradient'),
    emojiGradientColor1: document.getElementById('emojiGradientColor1'),
    emojiGradientColor2: document.getElementById('emojiGradientColor2'),
    emojiShapeOptions: document.getElementById('emojiShapeOptions'),
    emojiPaddingSlider: document.getElementById('emojiPaddingSlider'),
    emojiPaddingValue: document.getElementById('emojiPaddingValue'),
    createEmojiBtn: document.getElementById('createEmojiBtn'),
    emojiPreviewCanvas: document.getElementById('emojiPreviewCanvas'),
    emojiInlineEditor: document.getElementById('emojiInlineEditor')
  };

  // Current active inline editor
  let activeInlineEditor = null;

  // Helper to get current state based on active editor
  function getCurrentState() {
    if (activeInlineEditor === elements.imageInlineEditor) return imageState;
    if (activeInlineEditor === elements.textInlineEditor) return textState;
    if (activeInlineEditor === elements.emojiInlineEditor) return emojiState;
    // Fallback based on current mode
    if (currentMode === 'image') return imageState;
    if (currentMode === 'text') return textState;
    if (currentMode === 'emoji') return emojiState;
    return imageState;
  }

  // Helper to get state for a specific editor
  function getStateForEditor(editor) {
    if (editor === elements.imageInlineEditor) return imageState;
    if (editor === elements.textInlineEditor) return textState;
    if (editor === elements.emojiInlineEditor) return emojiState;
    return imageState;
  }

  // ==================== Tab Switching ====================
  function switchTab(tab) {
    currentMode = tab;

    elements.tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tab}Panel`);
    });
  }

  // ==================== File Handling ====================
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea?.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    } else {
      ToolsCommon.showToast('Please drop an image file', 'error');
    }
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imageState.sourceImage = img;
        imageState.sourceCanvas = null;

        // Update source info
        if (elements.imageSourceInfo) {
          elements.imageSourceInfo.textContent = `${img.width} × ${img.height}px`;
        }

        // Hide upload area, show image creator
        elements.uploadArea.style.display = 'none';
        elements.imageCreator.style.display = 'block';

        // Set as active inline editor so previews update
        activeInlineEditor = elements.imageInlineEditor;

        // Update preview and all favicon sizes
        updateImagePreview();
        updateInlineEditorPreviews(elements.imageInlineEditor);

        ToolsCommon.showToast('Image loaded successfully', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateImagePreview() {
    const canvas = elements.imagePreviewCanvas;
    if (!canvas || !imageState.sourceImage) return;

    const ctx = canvas.getContext('2d');
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    // Draw background with shape
    if (imageState.background !== 'transparent') {
      let fillStyle;
      if (imageState.useGradient) {
        fillStyle = createGradientForState(ctx, size, imageState);
      } else {
        fillStyle = imageState.background;
      }
      ctx.fillStyle = fillStyle;

      if (imageState.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (imageState.shape === 'rounded') {
        ctx.beginPath();
        roundRect(ctx, 0, 0, size, size, size * 0.2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // Apply clipping for shape
    if (imageState.shape !== 'square') {
      ctx.save();
      ctx.beginPath();
      if (imageState.shape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (imageState.shape === 'rounded') {
        roundRect(ctx, 0, 0, size, size, size * 0.2);
      }
      ctx.clip();
    }

    // Calculate padding and draw image
    const paddingPx = (imageState.padding / 100) * size;
    const drawSize = size - (paddingPx * 2);
    const scale = Math.min(drawSize / imageState.sourceImage.width, drawSize / imageState.sourceImage.height);
    const imgWidth = imageState.sourceImage.width * scale;
    const imgHeight = imageState.sourceImage.height * scale;
    const x = (size - imgWidth) / 2;
    const y = (size - imgHeight) / 2;

    ctx.drawImage(imageState.sourceImage, x, y, imgWidth, imgHeight);

    if (imageState.shape !== 'square') {
      ctx.restore();
    }
  }

  function changeImage() {
    // Clear file input and trigger new selection
    elements.imageInput.value = '';
    elements.imageInput.click();
  }

  // ==================== Text Favicon ====================
  function createTextFavicon() {
    const text = elements.textInput.value.trim() || 'F';
    textState.text = text;
    textState.textFont = elements.textFont.value;
    textState.textColor = elements.textColor.value;

    // Toggle inline editor
    const isExpanded = !elements.textInlineEditor.classList.contains('collapsed');
    if (isExpanded) {
      // Collapse
      elements.textInlineEditor.classList.add('collapsed');
      elements.createTextBtn.classList.remove('expanded');
      activeInlineEditor = null;
      return;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear canvas (transparent background - main Background option controls the color)
    ctx.clearRect(0, 0, size, size);

    // Draw text
    ctx.fillStyle = textState.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate font size based on text length
    const fontSize = text.length === 1 ? size * 0.7 : text.length === 2 ? size * 0.5 : size * 0.4;
    ctx.font = `bold ${fontSize}px ${textState.textFont}`;
    ctx.fillText(text, size / 2, size / 2 + fontSize * 0.05);

    // Convert to image
    const img = new Image();
    img.onload = () => {
      textState.sourceImage = img;
      textState.sourceCanvas = canvas;

      // Expand inline editor
      elements.textInlineEditor.classList.remove('collapsed');
      elements.createTextBtn.classList.add('expanded');
      activeInlineEditor = elements.textInlineEditor;

      // Update previews in inline editor
      updateInlineEditorPreviews(elements.textInlineEditor);
      ToolsCommon.showToast('Text favicon created', 'success');
    };
    img.src = canvas.toDataURL();
  }

  // ==================== Emoji Favicon ====================
  function createEmojiFavicon() {
    const emoji = elements.emojiInput.value.trim() || '🎨';
    emojiState.emoji = emoji;

    // Toggle inline editor
    const isExpanded = !elements.emojiInlineEditor.classList.contains('collapsed');
    if (isExpanded) {
      // Collapse
      elements.emojiInlineEditor.classList.add('collapsed');
      elements.createEmojiBtn.classList.remove('expanded');
      activeInlineEditor = null;
      return;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear canvas first
    ctx.clearRect(0, 0, size, size);

    // Draw emoji (no background baked in - user controls via Background option)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size * 0.75}px serif`;
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.05);

    // Convert to image
    const img = new Image();
    img.onload = () => {
      emojiState.sourceImage = img;
      emojiState.sourceCanvas = canvas;

      // Expand inline editor
      elements.emojiInlineEditor.classList.remove('collapsed');
      elements.createEmojiBtn.classList.add('expanded');
      activeInlineEditor = elements.emojiInlineEditor;

      // Update previews in inline editor
      updateInlineEditorPreviews(elements.emojiInlineEditor);
      ToolsCommon.showToast('Emoji favicon created', 'success');
    };
    img.src = canvas.toDataURL();
  }

  // ==================== Live Preview Functions ====================
  function updateTextPreview() {
    const canvas = elements.textPreviewCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    const text = elements.textInput?.value.trim() || 'F';
    const textColor = elements.textColor?.value || '#ffffff';
    const font = elements.textFont?.value || 'Inter, sans-serif';

    // Draw background with shape
    if (textState.background !== 'transparent') {
      let fillStyle;
      if (textState.useGradient) {
        fillStyle = createGradientForState(ctx, size, textState);
      } else {
        fillStyle = textState.background;
      }
      ctx.fillStyle = fillStyle;

      if (textState.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (textState.shape === 'rounded') {
        ctx.beginPath();
        roundRect(ctx, 0, 0, size, size, size * 0.2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // Apply clipping for shape
    if (textState.shape !== 'square') {
      ctx.save();
      ctx.beginPath();
      if (textState.shape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (textState.shape === 'rounded') {
        roundRect(ctx, 0, 0, size, size, size * 0.2);
      }
      ctx.clip();
    }

    // Calculate padding
    const paddingPx = (textState.padding / 100) * size;
    const drawSize = size - (paddingPx * 2);

    // Draw text with padding applied
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const baseFontSize = text.length === 1 ? 0.7 : text.length === 2 ? 0.5 : 0.4;
    const fontSize = drawSize * baseFontSize;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.fillText(text, size / 2, size / 2 + fontSize * 0.05);

    if (textState.shape !== 'square') {
      ctx.restore();
    }
  }

  function updateEmojiPreview() {
    const canvas = elements.emojiPreviewCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    const emoji = elements.emojiInput?.value.trim() || '🎨';

    // Draw background with shape
    if (emojiState.background !== 'transparent') {
      let fillStyle;
      if (emojiState.useGradient) {
        fillStyle = createGradientForState(ctx, size, emojiState);
      } else {
        fillStyle = emojiState.background;
      }
      ctx.fillStyle = fillStyle;

      if (emojiState.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (emojiState.shape === 'rounded') {
        ctx.beginPath();
        roundRect(ctx, 0, 0, size, size, size * 0.2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // Apply clipping for shape
    if (emojiState.shape !== 'square') {
      ctx.save();
      ctx.beginPath();
      if (emojiState.shape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (emojiState.shape === 'rounded') {
        roundRect(ctx, 0, 0, size, size, size * 0.2);
      }
      ctx.clip();
    }

    // Calculate padding
    const paddingPx = (emojiState.padding / 100) * size;
    const drawSize = size - (paddingPx * 2);

    // Draw emoji with padding applied
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = drawSize * 0.75;
    ctx.font = `${fontSize}px serif`;
    ctx.fillText(emoji, size / 2, size / 2 + fontSize * 0.05);

    if (emojiState.shape !== 'square') {
      ctx.restore();
    }
  }

  // ==================== Copy to Clipboard ====================
  async function copyToClipboard() {
    const state = getCurrentState();
    if (!state.sourceImage) {
      ToolsCommon.showToast('Please create a favicon first', 'error');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, 256, state);

      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          ToolsCommon.showToast('Favicon copied to clipboard!', 'success');
        } catch (err) {
          // Fallback: copy as data URL
          const dataUrl = canvas.toDataURL('image/png');
          await navigator.clipboard.writeText(dataUrl);
          ToolsCommon.showToast('Favicon data URL copied!', 'success');
        }
      }, 'image/png');
    } catch (err) {
      ToolsCommon.showToast('Failed to copy to clipboard', 'error');
    }
  }


  // ==================== Regenerate Source ====================
  function regenerateTextSource() {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear canvas (transparent background - main Background option controls the color)
    ctx.clearRect(0, 0, size, size);

    // Draw text
    ctx.fillStyle = textState.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = textState.text.length === 1 ? size * 0.7 : textState.text.length === 2 ? size * 0.5 : size * 0.4;
    ctx.font = `bold ${fontSize}px ${textState.textFont}`;
    ctx.fillText(textState.text, size / 2, size / 2 + fontSize * 0.05);

    // Update source
    const img = new Image();
    img.onload = () => {
      textState.sourceImage = img;
      textState.sourceCanvas = canvas;
      updatePreviewsForEditor(elements.textInlineEditor);
    };
    img.src = canvas.toDataURL();
  }

  function regenerateEmojiSource() {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);

    // Draw emoji (no background baked in)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size * 0.75}px serif`;
    ctx.fillText(emojiState.emoji, size / 2, size / 2 + size * 0.05);

    // Update source
    const img = new Image();
    img.onload = () => {
      emojiState.sourceImage = img;
      emojiState.sourceCanvas = canvas;
      updatePreviewsForEditor(elements.emojiInlineEditor);
    };
    img.src = canvas.toDataURL();
  }

  // ==================== Preview Generation ====================
  function updatePreviews() {
    const state = getCurrentState();
    if (!state.sourceImage) return;

    // Update live preview canvas in creator panel based on which mode is active
    if (activeInlineEditor === elements.imageInlineEditor) {
      updateImagePreview();
    } else if (activeInlineEditor === elements.textInlineEditor) {
      updateTextPreview();
    } else if (activeInlineEditor === elements.emojiInlineEditor) {
      updateEmojiPreview();
    }

    // Also update active inline editor if any
    if (activeInlineEditor) {
      updateInlineEditorPreviews(activeInlineEditor);
    }
  }

  function updatePreviewsForEditor(editor) {
    const state = getStateForEditor(editor);
    if (!state.sourceImage || !editor) return;

    // Update live preview canvas
    if (editor === elements.imageInlineEditor) {
      updateImagePreview();
    } else if (editor === elements.textInlineEditor) {
      updateTextPreview();
    } else if (editor === elements.emojiInlineEditor) {
      updateEmojiPreview();
    }

    // Update inline editor previews
    updateInlineEditorPreviews(editor);
  }

  function updateInlineEditorPreviews(editor) {
    const state = getStateForEditor(editor);
    if (!state.sourceImage || !editor) return;

    // Update preview canvases
    SIZES.forEach(size => {
      const canvas = editor.querySelector(`.preview${size}`);
      if (canvas) renderFavicon(canvas, size, state);
    });

    // Update browser favicon preview
    const browserFavicon = editor.querySelector('.browserFavicon');
    if (browserFavicon) {
      renderFavicon(browserFavicon, 16, state);
    }
  }

  function renderFavicon(canvas, size, state) {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Draw background
    if (state.background !== 'transparent') {
      // Create fill style (solid or gradient)
      let fillStyle;
      if (state.useGradient) {
        fillStyle = createGradientForState(ctx, size, state);
      } else {
        fillStyle = state.background;
      }
      ctx.fillStyle = fillStyle;

      if (state.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (state.shape === 'rounded') {
        roundRect(ctx, 0, 0, size, size, size * 0.2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // Apply clipping for shape
    if (state.shape !== 'square') {
      ctx.save();
      ctx.beginPath();
      if (state.shape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (state.shape === 'rounded') {
        roundRect(ctx, 0, 0, size, size, size * 0.2);
      }
      ctx.clip();
    }

    // Calculate padding and draw image
    const paddingPx = (state.padding / 100) * size;
    const drawSize = size - (paddingPx * 2);
    const scale = Math.min(drawSize / state.sourceImage.width, drawSize / state.sourceImage.height);
    const imgWidth = state.sourceImage.width * scale;
    const imgHeight = state.sourceImage.height * scale;
    const x = (size - imgWidth) / 2;
    const y = (size - imgHeight) / 2;

    ctx.drawImage(state.sourceImage, x, y, imgWidth, imgHeight);

    if (state.shape !== 'square') {
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function createGradientForState(ctx, size, state) {
    let x0, y0, x1, y1;

    switch (state.gradientDirection) {
      case 'to right':
        x0 = 0; y0 = 0; x1 = size; y1 = 0;
        break;
      case 'to bottom right':
        x0 = 0; y0 = 0; x1 = size; y1 = size;
        break;
      case 'to top right':
        x0 = 0; y0 = size; x1 = size; y1 = 0;
        break;
      case 'to bottom':
      default:
        x0 = 0; y0 = 0; x1 = 0; y1 = size;
        break;
    }

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, state.gradientColor1);
    gradient.addColorStop(1, state.gradientColor2);
    return gradient;
  }

  // ==================== Download Functions ====================
  async function downloadPng() {
    const state = getCurrentState();
    if (!state.sourceImage) {
      ToolsCommon.showToast('Please create a favicon first', 'error');
      return;
    }

    const zip = new JSZip();

    SIZES.forEach(size => {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, size, state);
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      zip.file(`favicon-${size}x${size}.png`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'favicons-png.zip');
    ToolsCommon.showToast('PNG icons downloaded', 'success');
  }

  async function downloadIco() {
    const state = getCurrentState();
    if (!state.sourceImage) {
      ToolsCommon.showToast('Please create a favicon first', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    renderFavicon(canvas, 32, state);

    canvas.toBlob((blob) => {
      downloadBlob(blob, 'favicon.ico');
      ToolsCommon.showToast('ICO file downloaded', 'success');
    }, 'image/png');
  }

  function downloadSvg() {
    const state = getCurrentState();
    if (!state.sourceImage) {
      ToolsCommon.showToast('Please create a favicon first', 'error');
      return;
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    renderFavicon(canvas, size, state);
    const dataUrl = canvas.toDataURL('image/png');

    // Create SVG with embedded image
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <image width="${size}" height="${size}" xlink:href="${dataUrl}"/>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadBlob(blob, 'favicon.svg');
    ToolsCommon.showToast('SVG file downloaded', 'success');
  }

  async function downloadAll() {
    const state = getCurrentState();
    if (!state.sourceImage) {
      ToolsCommon.showToast('Please create a favicon first', 'error');
      return;
    }

    const zip = new JSZip();

    // PNG favicons
    SIZES.forEach(size => {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, size, state);
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      zip.file(`favicon-${size}x${size}.png`, base64, { base64: true });
    });

    // Apple Touch Icon
    const appleCanvas = document.createElement('canvas');
    renderFavicon(appleCanvas, APPLE_SIZE, state);
    zip.file('apple-touch-icon.png', appleCanvas.toDataURL('image/png').split(',')[1], { base64: true });

    // Android icons
    ANDROID_SIZES.forEach(size => {
      const canvas = document.createElement('canvas');
      renderFavicon(canvas, size, state);
      zip.file(`android-chrome-${size}x${size}.png`, canvas.toDataURL('image/png').split(',')[1], { base64: true });
    });

    // favicon.ico
    const icoCanvas = document.createElement('canvas');
    renderFavicon(icoCanvas, 32, state);
    zip.file('favicon.ico', icoCanvas.toDataURL('image/png').split(',')[1], { base64: true });

    // SVG favicon
    const svgCanvas = document.createElement('canvas');
    renderFavicon(svgCanvas, 256, state);
    const svgDataUrl = svgCanvas.toDataURL('image/png');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256" viewBox="0 0 256 256">
  <image width="256" height="256" xlink:href="${svgDataUrl}"/>
</svg>`;
    zip.file('favicon.svg', svgContent);

    // Web manifest
    const manifest = {
      name: "My Website",
      short_name: "Website",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone"
    };
    zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

    // browserconfig.xml
    zip.file('browserconfig.xml', `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/favicon-128x128.png"/>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`);

    // README
    zip.file('README.txt', `Favicon Package
===============

Files included:
- favicon.ico (32x32)
- favicon.svg (scalable)
- favicon-16x16.png to favicon-256x256.png
- apple-touch-icon.png (180x180)
- android-chrome-192x192.png
- android-chrome-512x512.png
- site.webmanifest
- browserconfig.xml

HTML Code:
----------
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
`);

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'favicon-package.zip');
    ToolsCommon.showToast('Full package downloaded', 'success');
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ==================== Code Copy ====================
  function copyHtmlCode() {
    const htmlCode = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
    ToolsCommon.copyWithToast(htmlCode, 'HTML code copied!');
  }


  // ==================== Keyboard Handler ====================
  function handleKeyboard(e) {
    if (e.target.matches('input, textarea, select')) return;

    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        elements.imageInput?.click();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadAll();
      }
    }
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab navigation
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Collapse any open inline editors when switching tabs (for text/emoji)
        if (activeInlineEditor && activeInlineEditor !== elements.imageInlineEditor) {
          activeInlineEditor.classList.add('collapsed');
          elements.createTextBtn?.classList.remove('expanded');
          elements.createEmojiBtn?.classList.remove('expanded');
        }

        // Set active inline editor based on tab
        const tabName = tab.dataset.tab;
        if (tabName === 'image' && elements.imageCreator?.style.display !== 'none') {
          activeInlineEditor = elements.imageInlineEditor;
        } else {
          activeInlineEditor = null;
        }

        switchTab(tabName);
      });
    });

    // Image mode - Upload
    elements.uploadArea?.addEventListener('click', () => elements.imageInput?.click());
    elements.imageInput?.addEventListener('change', handleFileSelect);
    elements.uploadArea?.addEventListener('dragover', handleDragOver);
    elements.uploadArea?.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea?.addEventListener('drop', handleDrop);

    // Image mode - Change button
    elements.changeImageBtn?.addEventListener('click', changeImage);

    // Image creator background options
    elements.imageBgOptions?.querySelectorAll('.creator-bg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.type === 'color') return;

        elements.imageBgOptions.querySelectorAll('.creator-bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const bg = btn.dataset.bg;
        if (bg === 'gradient') {
          imageState.useGradient = true;
          imageState.background = 'gradient';
          elements.imageCreatorGradient.style.display = 'flex';
        } else if (bg === 'transparent') {
          imageState.useGradient = false;
          imageState.background = 'transparent';
          elements.imageCreatorGradient.style.display = 'none';
        } else if (bg === 'custom') {
          imageState.useGradient = false;
          imageState.background = elements.imageCreatorBgColor.value;
          elements.imageCreatorGradient.style.display = 'none';
        }
        updateImagePreview();
        if (activeInlineEditor === elements.imageInlineEditor) {
          updatePreviews();
        }
      });
    });

    elements.imageCreatorBgColor?.addEventListener('input', (e) => {
      imageState.background = e.target.value;
      imageState.useGradient = false;
      elements.imageBgOptions.querySelectorAll('.creator-bg-btn').forEach(b => b.classList.remove('active'));
      e.target.closest('.creator-bg-btn').classList.add('active');
      elements.imageCreatorGradient.style.display = 'none';
      updateImagePreview();
      if (activeInlineEditor === elements.imageInlineEditor) {
        updatePreviews();
      }
    });

    elements.imageGradientColor1?.addEventListener('input', (e) => {
      imageState.gradientColor1 = e.target.value;
      updateImagePreview();
      if (activeInlineEditor === elements.imageInlineEditor) {
        updatePreviews();
      }
    });

    elements.imageGradientColor2?.addEventListener('input', (e) => {
      imageState.gradientColor2 = e.target.value;
      updateImagePreview();
      if (activeInlineEditor === elements.imageInlineEditor) {
        updatePreviews();
      }
    });

    // Image creator shape options
    elements.imageShapeOptions?.querySelectorAll('.creator-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.imageShapeOptions.querySelectorAll('.creator-shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        imageState.shape = btn.dataset.shape;
        updateImagePreview();
        if (activeInlineEditor === elements.imageInlineEditor) {
          updatePreviews();
        }
      });
    });

    // Image creator padding
    elements.imagePaddingSlider?.addEventListener('input', (e) => {
      imageState.padding = parseInt(e.target.value);
      elements.imagePaddingValue.textContent = `${imageState.padding}%`;
      updateImagePreview();
      if (activeInlineEditor === elements.imageInlineEditor) {
        updatePreviews();
      }
    });

    // Text mode
    elements.createTextBtn?.addEventListener('click', createTextFavicon);
    elements.textInput?.addEventListener('input', () => {
      updateTextPreview();
      // Also regenerate if inline editor is open
      if (activeInlineEditor === elements.textInlineEditor) {
        textState.text = elements.textInput.value.trim() || 'F';
        regenerateTextSource();
      }
    });
    elements.textFont?.addEventListener('change', () => {
      updateTextPreview();
      if (activeInlineEditor === elements.textInlineEditor) {
        textState.textFont = elements.textFont.value;
        regenerateTextSource();
      }
    });
    elements.textColor?.addEventListener('input', () => {
      updateTextPreview();
      if (activeInlineEditor === elements.textInlineEditor) {
        textState.textColor = elements.textColor.value;
        regenerateTextSource();
      }
    });

    // Text creator background options
    elements.textBgOptions?.querySelectorAll('.creator-bg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.type === 'color') return;

        elements.textBgOptions.querySelectorAll('.creator-bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const bg = btn.dataset.bg;
        if (bg === 'gradient') {
          textState.useGradient = true;
          textState.background = 'gradient';
          elements.textCreatorGradient.style.display = 'flex';
        } else if (bg === 'transparent') {
          textState.useGradient = false;
          textState.background = 'transparent';
          elements.textCreatorGradient.style.display = 'none';
        } else if (bg === 'custom') {
          textState.useGradient = false;
          textState.background = elements.textCreatorBgColor.value;
          elements.textCreatorGradient.style.display = 'none';
        }
        updateTextPreview();
        if (activeInlineEditor === elements.textInlineEditor) {
          updatePreviews();
        }
      });
    });

    elements.textCreatorBgColor?.addEventListener('input', (e) => {
      textState.background = e.target.value;
      textState.useGradient = false;
      elements.textBgOptions.querySelectorAll('.creator-bg-btn').forEach(b => b.classList.remove('active'));
      e.target.closest('.creator-bg-btn').classList.add('active');
      elements.textCreatorGradient.style.display = 'none';
      updateTextPreview();
      if (activeInlineEditor === elements.textInlineEditor) {
        updatePreviews();
      }
    });

    elements.textGradientColor1?.addEventListener('input', (e) => {
      textState.gradientColor1 = e.target.value;
      updateTextPreview();
      if (activeInlineEditor === elements.textInlineEditor) {
        updatePreviews();
      }
    });

    elements.textGradientColor2?.addEventListener('input', (e) => {
      textState.gradientColor2 = e.target.value;
      updateTextPreview();
      if (activeInlineEditor === elements.textInlineEditor) {
        updatePreviews();
      }
    });

    // Text creator shape options
    elements.textShapeOptions?.querySelectorAll('.creator-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.textShapeOptions.querySelectorAll('.creator-shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        textState.shape = btn.dataset.shape;
        updateTextPreview();
        if (activeInlineEditor === elements.textInlineEditor) {
          updatePreviews();
        }
      });
    });

    // Text creator padding
    elements.textPaddingSlider?.addEventListener('input', (e) => {
      textState.padding = parseInt(e.target.value);
      elements.textPaddingValue.textContent = `${textState.padding}%`;
      updateTextPreview();
      if (activeInlineEditor === elements.textInlineEditor) {
        updatePreviews();
      }
    });

    // Emoji mode
    elements.createEmojiBtn?.addEventListener('click', createEmojiFavicon);
    elements.emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.emojiInput.value = btn.dataset.emoji;
        elements.emojiBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateEmojiPreview();
        // Also regenerate if inline editor is open
        if (activeInlineEditor === elements.emojiInlineEditor) {
          emojiState.emoji = btn.dataset.emoji;
          regenerateEmojiSource();
        }
      });
    });
    elements.emojiInput?.addEventListener('input', () => {
      updateEmojiPreview();
      if (activeInlineEditor === elements.emojiInlineEditor) {
        emojiState.emoji = elements.emojiInput.value.trim() || '🎨';
        regenerateEmojiSource();
      }
    });

    // Emoji creator background options
    elements.emojiBgOptions?.querySelectorAll('.creator-bg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.type === 'color') return;

        elements.emojiBgOptions.querySelectorAll('.creator-bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const bg = btn.dataset.bg;
        if (bg === 'gradient') {
          emojiState.useGradient = true;
          emojiState.background = 'gradient';
          elements.emojiCreatorGradient.style.display = 'flex';
        } else if (bg === 'transparent') {
          emojiState.useGradient = false;
          emojiState.background = 'transparent';
          elements.emojiCreatorGradient.style.display = 'none';
        } else if (bg === 'custom') {
          emojiState.useGradient = false;
          emojiState.background = elements.emojiCreatorBgColor.value;
          elements.emojiCreatorGradient.style.display = 'none';
        }
        updateEmojiPreview();
        if (activeInlineEditor === elements.emojiInlineEditor) {
          updatePreviews();
        }
      });
    });

    elements.emojiCreatorBgColor?.addEventListener('input', (e) => {
      emojiState.background = e.target.value;
      emojiState.useGradient = false;
      elements.emojiBgOptions.querySelectorAll('.creator-bg-btn').forEach(b => b.classList.remove('active'));
      e.target.closest('.creator-bg-btn').classList.add('active');
      elements.emojiCreatorGradient.style.display = 'none';
      updateEmojiPreview();
      if (activeInlineEditor === elements.emojiInlineEditor) {
        updatePreviews();
      }
    });

    elements.emojiGradientColor1?.addEventListener('input', (e) => {
      emojiState.gradientColor1 = e.target.value;
      updateEmojiPreview();
      if (activeInlineEditor === elements.emojiInlineEditor) {
        updatePreviews();
      }
    });

    elements.emojiGradientColor2?.addEventListener('input', (e) => {
      emojiState.gradientColor2 = e.target.value;
      updateEmojiPreview();
      if (activeInlineEditor === elements.emojiInlineEditor) {
        updatePreviews();
      }
    });

    // Emoji creator shape options
    elements.emojiShapeOptions?.querySelectorAll('.creator-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.emojiShapeOptions.querySelectorAll('.creator-shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        emojiState.shape = btn.dataset.shape;
        updateEmojiPreview();
        if (activeInlineEditor === elements.emojiInlineEditor) {
          updatePreviews();
        }
      });
    });

    // Emoji creator padding
    elements.emojiPaddingSlider?.addEventListener('input', (e) => {
      emojiState.padding = parseInt(e.target.value);
      elements.emojiPaddingValue.textContent = `${emojiState.padding}%`;
      updateEmojiPreview();
      if (activeInlineEditor === elements.emojiInlineEditor) {
        updatePreviews();
      }
    });

    // Initialize inline editor controls for all tabs
    initInlineEditorControls(elements.imageInlineEditor);
    initInlineEditorControls(elements.textInlineEditor);
    initInlineEditorControls(elements.emojiInlineEditor);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  function initInlineEditorControls(editor) {
    if (!editor) return;

    // Download buttons
    editor.querySelector('.copyToClipboardBtn')?.addEventListener('click', copyToClipboard);
    editor.querySelector('.downloadPngBtn')?.addEventListener('click', downloadPng);
    editor.querySelector('.downloadIcoBtn')?.addEventListener('click', downloadIco);
    editor.querySelector('.downloadSvgBtn')?.addEventListener('click', downloadSvg);
    editor.querySelector('.downloadAllBtn')?.addEventListener('click', downloadAll);

    // Copy code
    editor.querySelector('.copyCodeBtn')?.addEventListener('click', copyHtmlCode);
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    // Initialize live previews
    updateTextPreview();
    updateEmojiPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
