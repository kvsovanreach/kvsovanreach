EditorFields.register('image', function(slide) {
  const E = EditorFields;
  const img = slide.image || {};
  return [
    E.input('title', 'Title', slide.title || '', { placeholder: 'Optional heading' }),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Optional text above image' }),
    E.input('image.src', 'Image', img.src || '', { placeholder: './assets/images/photo.jpg' }),
    E.row(
      E.input('image.caption', 'Caption', img.caption || '', { placeholder: 'Image caption' }),
      E.input('image.alt', 'Alt Text', img.alt || '', { placeholder: 'Accessibility text' })
    ),
  ].join('');
});
