EditorFields.register('title-hero', function(slide) {
  const E = EditorFields;
  const meta = slide.meta || {};
  // Auto-fill hint: if meta is empty but App.meta has values
  const appMeta = (typeof App !== 'undefined') ? App.meta : {};
  const presenterHint = (!meta.presenter && appMeta.presenter) ? `Auto: ${appMeta.presenter}` : '';
  return [
    E.select('style', 'Style', slide.style || 1, [
      { value: 1, label: 'Style 1 — Centered Hero' },
      { value: 2, label: 'Style 2 — Split Panel' },
      { value: 3, label: 'Style 3 — Gradient Bold' }
    ], { hint: 'Changes the visual layout' }),
    E.input('title', 'Title', slide.title || '', { placeholder: 'Your presentation title' }),
    E.input('highlight', 'Highlight', slide.highlight || '', { placeholder: 'Colored text below title (optional)', hint: 'Appears in accent color' }),
    E.input('subtitle', 'Subtitle', slide.subtitle || '', { placeholder: 'One-line description' }),
    E.input('hook', 'Hook Badge', slide.hook || '', { placeholder: 'Short text in pill badge (optional)', hint: 'Shows above title' }),
    E.collapse('presenter', 'Presenter Info', [
      E.row(
        E.input('meta.presenter', 'Name', meta.presenter || '', { placeholder: presenterHint || 'Full name' }),
        E.input('meta.role', 'Role', meta.role || '', { placeholder: 'e.g. Software Engineer' })
      ),
      E.row(
        E.input('meta.location', 'Location', meta.location || '', { placeholder: 'e.g. Phnom Penh' }),
        E.input('meta.date', 'Date', meta.date || '', { placeholder: 'e.g. March 25, 2026' })
      ),
    ].join(''), !!(meta.presenter || meta.role)),
  ].join('');
});
