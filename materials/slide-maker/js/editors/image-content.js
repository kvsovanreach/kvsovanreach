EditorFields.register('image-content', function(slide) {
  const E = EditorFields;
  const img = slide.image || {};
  const content = slide.content || {};
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Context shown above the image and content (optional)' }),
    E.sectionTitle('Image'),
    E.input('image.src', 'Image URL', img.src || '', { placeholder: './assets/images/...' }),
    E.input('figureCaption', 'Figure Caption', slide.figureCaption || '', { placeholder: 'Shown as "Figure N. caption" (optional)', hint: 'Leave empty to hide figure label' }),
    E.select('layout', 'Layout', slide.layout || 'image-left', [
      { value: 'image-left', label: 'Image Left' },
      { value: 'image-right', label: 'Image Right' }
    ]),
    E.sectionTitle('Content'),
    E.textarea('content.text', 'Text', content.text || '', { rows: 2 }),
    E.bulletList('content.bullets', 'Bullets', content.bullets || []),
  ].join('');
});
