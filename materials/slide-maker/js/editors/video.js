EditorFields.register('video', function(slide) {
  const E = EditorFields;
  const vid = slide.video || {};
  return [
    E.input('title', 'Section Title', slide.title || '', { placeholder: 'Slide heading (optional)' }),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Context shown above the video (optional)' }),
    E.input('video.src', 'Video', vid.src || '', { placeholder: 'URL or file path' }),
    E.input('video.poster', 'Thumbnail', vid.poster || '', { placeholder: 'Poster image URL' }),
    E.input('figureCaption', 'Figure Caption', slide.figureCaption || vid.caption || '', { placeholder: 'Shown as "Figure N. caption"' }),
    E.collapse('video-opts', 'Video Options', [
      E.row(
        E.checkbox('video.autoplay', 'Autoplay'),
        E.checkbox('video.loop', 'Loop'),
        E.checkbox('video.muted', 'Muted', vid.muted !== false)
      ),
      E.mediaFields('media', slide.media),
    ].join('')),
  ].join('');
});
