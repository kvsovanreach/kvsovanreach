EditorFields.register('comparison', function(slide) {
  const E = EditorFields;
  const left = slide.left || {};
  const right = slide.right || {};
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Context for the comparison' }),
    E.sectionTitle('Left Side'),
    E.input('left.heading', 'Heading', left.heading || 'Before', { placeholder: 'e.g. Before, Pros, Old' }),
    E.bulletList('left.bullets', 'Points', left.bullets || []),
    E.sectionTitle('Right Side'),
    E.input('right.heading', 'Heading', right.heading || 'After', { placeholder: 'e.g. After, Cons, New' }),
    E.bulletList('right.bullets', 'Points', right.bullets || []),
  ].join('');
});
