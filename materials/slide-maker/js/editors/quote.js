EditorFields.register('quote', function(slide) {
  const E = EditorFields;
  return [
    E.textarea('quote', 'Quote', slide.quote || '', { rows: 4, placeholder: 'The quote text. Use <nl> for line breaks.' }),
    E.row(
      E.input('author', 'Author', slide.author || '', { placeholder: 'Who said it' }),
      E.input('source', 'Source', slide.source || '', { placeholder: 'Role, year, or context' })
    ),
    E.input('authorImage', 'Author Photo', slide.authorImage || '', { placeholder: './assets/images/author.jpg (optional)' }),
    E.collapse('quote-opts', 'Layout', [
      E.select('layout', 'Layout', slide.layout || 'centered', [
        { value: 'centered', label: 'Centered' },
        { value: 'left', label: 'Left Aligned' },
        { value: 'with-image', label: 'Side Image' }
      ], { hint: 'Side Image uses the image below as a full-height panel' }),
      E.input('backgroundImage', 'Image', slide.backgroundImage || '', { placeholder: './assets/images/bg.jpg', hint: 'Background overlay (centered/left) or side panel (Side Image)' }),
    ].join('')),
  ].join('');
});
