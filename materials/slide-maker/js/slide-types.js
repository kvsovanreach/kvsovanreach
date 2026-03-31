/**
 * Slide type definitions and default templates
 * Organized by category for the type picker
 */
const SLIDE_TYPE_CATEGORIES = [
  {
    name: 'Text & Layout',
    types: ['title-hero', 'content', 'two-column', 'comparison', 'quote', 'section', 'toc', 'blank']
  },
  {
    name: 'Media',
    types: ['image', 'video', 'image-content', 'image-grid']
  },
  {
    name: 'Data & Code',
    types: ['table', 'stats', 'code', 'timeline']
  },
  {
    name: 'Interactive & Closing',
    types: ['discussion', 'connect']
  }
];

const MEDIA_POSITIONS = [
  { value: 'center', label: 'Center' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'full', label: 'Full Bleed' }
];

const MEDIA_SIZES = [
  { value: 'auto', label: 'Auto' },
  { value: 'small', label: 'Small (30%)' },
  { value: 'medium', label: 'Medium (50%)' },
  { value: 'large', label: 'Large (75%)' },
  { value: 'full', label: 'Full Width' },
  { value: 'custom', label: 'Custom' }
];

const MEDIA_FITS = [
  { value: 'contain', label: 'Contain' },
  { value: 'cover', label: 'Cover' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None (original)' }
];

const TITLE_POSITIONS = [
  { value: 'top', label: 'Top (default)' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'overlay-top', label: 'Overlay Top' },
  { value: 'overlay-bottom', label: 'Overlay Bottom' },
  { value: 'hidden', label: 'Hidden' }
];

const SLIDE_TYPES = {
  'title-hero': {
    label: 'Title / Hero',
    icon: 'fa-heading',
    description: 'Opening slide with title, subtitle, and presenter info',
    defaults: {
      type: 'title-hero',
      style: 1,
      hook: '',
      title: 'Presentation Title',
      highlight: '',
      subtitle: '',
      meta: { presenter: '', role: '', location: '', date: '' }
    }
  },
  content: {
    label: 'Content',
    icon: 'fa-list',
    description: 'Text with bullet points',
    defaults: {
      type: 'content',
      title: 'Slide Title',
      text: '',
      bullets: ['Point 1', 'Point 2', 'Point 3']
    }
  },
  'two-column': {
    label: 'Two Column',
    icon: 'fa-columns',
    description: 'Side-by-side columns with headings and bullets',
    defaults: {
      type: 'two-column',
      title: 'Slide Title',
      text: '',
      columns: [
        { heading: 'Column 1', bullets: ['Item 1', 'Item 2'] },
        { heading: 'Column 2', bullets: ['Item 1', 'Item 2'] }
      ]
    }
  },
  comparison: {
    label: 'Comparison',
    icon: 'fa-right-left',
    description: 'Left vs Right comparison (Before/After, Pros/Cons)',
    defaults: {
      type: 'comparison',
      title: 'Comparison Title',
      text: '',
      left: { heading: 'Before', bullets: ['Point 1', 'Point 2'] },
      right: { heading: 'After', bullets: ['Point 1', 'Point 2'] }
    }
  },
  quote: {
    label: 'Quote',
    icon: 'fa-quote-left',
    description: 'Featured quote with attribution',
    defaults: {
      type: 'quote',
      quote: 'Your quote here',
      author: '',
      source: '',
      layout: 'centered'
    }
  },
  section: {
    label: 'Section Divider',
    icon: 'fa-bookmark',
    description: 'Section break with number and title',
    defaults: {
      type: 'section',
      style: 1,
      number: 1,
      title: 'Section Title',
      subtitle: ''
    }
  },
  toc: {
    label: 'Table of Contents',
    icon: 'fa-bars-staggered',
    description: 'Agenda / table of contents',
    defaults: {
      type: 'toc',
      title: 'Agenda',
      items: [
        { title: 'Topic 1', description: 'Description' },
        { title: 'Topic 2', description: 'Description' }
      ]
    }
  },
  blank: {
    label: 'Blank',
    icon: 'fa-square',
    description: 'Empty slide for freeform content',
    defaults: {
      type: 'blank',
      title: '',
      text: '',
      backgroundColor: ''
    }
  },
  video: {
    label: 'Video',
    icon: 'fa-video',
    description: 'Embedded video with controls and sizing',
    defaults: {
      type: 'video',
      title: '',
      titlePosition: 'top',
      text: '',
      video: { src: '', poster: '', caption: '', autoplay: false, loop: false, muted: true },
      media: { size: 'large', width: '', height: '', fit: 'contain', position: 'center', borderRadius: '8' }
    }
  },
  'image-grid': {
    label: 'Image Grid',
    icon: 'fa-grip',
    description: 'Grid of images with captions',
    defaults: {
      type: 'image-grid',
      title: 'Image Grid',
      text: '',
      columns: 3,
      gap: '12',
      images: [{ src: '', alt: '', caption: '' }]
    }
  },
  table: {
    label: 'Table',
    icon: 'fa-table',
    description: 'Data table with headers, rows, and styling',
    defaults: {
      type: 'table',
      title: 'Table Title',
      titlePosition: 'top',
      text: '',
      table: {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6']
        ],
        highlight: [],
        striped: false,
        compact: false
      }
    }
  },
  stats: {
    label: 'Stats / Metrics',
    icon: 'fa-chart-simple',
    description: 'Big numbers with labels for key metrics',
    defaults: {
      type: 'stats',
      title: 'Key Metrics',
      text: '',
      items: [
        { value: '100+', label: 'Users', icon: 'users' },
        { value: '99.9%', label: 'Uptime', icon: 'server' },
        { value: '< 50ms', label: 'Latency', icon: 'bolt' }
      ]
    }
  },
  code: {
    label: 'Code',
    icon: 'fa-code',
    description: 'Code snippet with syntax highlighting theme',
    defaults: {
      type: 'code',
      title: '',
      titlePosition: 'top',
      language: 'javascript',
      code: '// Your code here\nfunction hello() {\n  console.log("Hello, World!");\n}',
      filename: '',
      highlightLines: ''
    }
  },
  timeline: {
    label: 'Timeline',
    icon: 'fa-timeline',
    description: 'Chronological events or steps',
    defaults: {
      type: 'timeline',
      title: 'Timeline',
      text: '',
      items: [
        { date: '2024', title: 'Event 1', description: 'Description' },
        { date: '2025', title: 'Event 2', description: 'Description' },
        { date: '2026', title: 'Event 3', description: 'Description' }
      ]
    }
  },
  discussion: {
    label: 'Discussion / Q&A',
    icon: 'fa-comments',
    description: 'Discussion prompts or Q&A slide',
    defaults: {
      type: 'discussion',
      title: "Let's Discuss",
      subtitle: '',
      icon: 'comments',
      prompts: [{ icon: 'hand', text: 'Discussion prompt 1' }]
    }
  },
  connect: {
    label: 'Connect / Contact',
    icon: 'fa-address-card',
    description: 'Closing slide with contact info and links',
    defaults: {
      type: 'connect',
      title: "Let's Connect",
      subtitle: '',
      thanks: 'Thank You!',
      contact: { email: '', website: '', github: '', linkedin: '' }
    }
  }
};
