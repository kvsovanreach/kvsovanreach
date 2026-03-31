EditorFields.register('connect', function(slide) {
  const E = EditorFields;
  const contact = slide.contact || {};
  return [
    E.input('title', 'Title', slide.title || "Let's Connect"),
    E.input('subtitle', 'Subtitle', slide.subtitle || '', { placeholder: 'Optional text between title and links' }),
    E.sectionTitle('Links'),
    E.row(
      E.input('contact.email', 'Email', contact.email || '', { placeholder: 'you@example.com' }),
      E.input('contact.website', 'Website', contact.website || '', { placeholder: 'yoursite.com' })
    ),
    E.row(
      E.input('contact.github', 'GitHub', contact.github || '', { placeholder: 'username' }),
      E.input('contact.linkedin', 'LinkedIn', contact.linkedin || '', { placeholder: 'username' })
    ),
    E.input('thanks', 'Thank You Text', slide.thanks || 'Thank You!', { placeholder: 'Closing message' }),
  ].join('');
});
