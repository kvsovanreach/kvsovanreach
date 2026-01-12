/**
 * Tools Data
 * JSON-based metadata for all tools
 */

const toolsData = [
  {
    id: "calculator",
    name: "Calculator",
    description: "A powerful calculator with scientific functions, unit conversion, and calculation history.",
    category: "general",
    icon: "fa-solid fa-calculator",
    url: "/v2/tools/calculator/",
    tags: ["math", "calculate", "scientific", "convert", "unit", "numbers"],
    status: "active"
  },
  {
    id: "colorpicker",
    name: "Color Picker",
    description: "Create color palettes, extract colors from images, and check color accessibility.",
    category: "general",
    icon: "fa-solid fa-palette",
    url: "/v2/tools/colorpicker/",
    tags: ["color", "palette", "design", "hex", "rgb", "hsl", "accessibility"],
    status: "active"
  },
  {
    id: "qrcode",
    name: "QR Code Tool",
    description: "Generate, scan, and manage QR codes with customization options and batch processing.",
    category: "general",
    icon: "fa-solid fa-qrcode",
    url: "/v2/tools/qrcode/",
    tags: ["qr", "barcode", "scan", "generate", "link"],
    status: "active"
  },
  {
    id: "encoder",
    name: "Encoder & Decoder",
    description: "Encode and decode text with Base64, URL encoding, hash functions, and JWT decoder.",
    category: "developer",
    icon: "fa-solid fa-code",
    url: "/v2/tools/encoder/",
    tags: ["encode", "decode", "base64", "url", "hash", "jwt", "md5", "sha"],
    status: "active"
  },
  {
    id: "luckydraw",
    name: "Lucky Draw",
    description: "Create custom spinning wheels for random selection, giveaways, and decision making.",
    category: "general",
    icon: "fa-solid fa-dharmachakra",
    url: "/v2/tools/luckydraw/",
    tags: ["wheel", "spin", "random", "picker", "lottery", "giveaway"],
    status: "active"
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure, random passwords with customizable length and character options.",
    category: "general",
    icon: "fa-solid fa-key",
    url: "/v2/tools/password/",
    tags: ["password", "security", "generate", "random", "strong"],
    status: "active"
  },
  {
    id: "timer-stopwatch",
    name: "Timer & Stopwatch",
    description: "Track time with countdown timers, stopwatch, and lap recording features.",
    category: "general",
    icon: "fa-solid fa-stopwatch",
    url: "/v2/tools/timer/",
    tags: ["timer", "stopwatch", "countdown", "time", "clock"],
    status: "active"
  },
  {
    id: "notes",
    name: "Quick Notes",
    description: "Take quick notes with markdown support and local storage persistence.",
    category: "general",
    icon: "fa-solid fa-note-sticky",
    url: "#",
    tags: ["notes", "markdown", "text", "write", "memo"],
    status: "active"
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between various units of measurement including length, weight, and temperature.",
    category: "general",
    icon: "fa-solid fa-ruler",
    url: "#",
    tags: ["convert", "unit", "length", "weight", "temperature", "measurement"],
    status: "active"
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress and optimize images while maintaining quality for faster web loading.",
    category: "general",
    icon: "fa-solid fa-file-zipper",
    url: "/v2/tools/image/",
    tags: ["image", "compress", "optimize", "resize", "photo"],
    status: "active"
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting.",
    category: "developer",
    icon: "fa-solid fa-brackets-curly",
    url: "/v2/tools/json/",
    tags: ["json", "format", "validate", "beautify", "data"],
    status: "active"
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions with real-time matching and explanation.",
    category: "developer",
    icon: "fa-solid fa-asterisk",
    url: "/v2/tools/regex/",
    tags: ["regex", "regular", "expression", "pattern", "match", "test"],
    status: "active"
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate unique identifiers in various formats including UUID v1, v4, and v7.",
    category: "developer",
    icon: "fa-solid fa-fingerprint",
    url: "/v2/tools/uuid/",
    tags: ["uuid", "guid", "unique", "identifier", "generate"],
    status: "active"
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts and highlight differences with side-by-side view.",
    category: "developer",
    icon: "fa-solid fa-code-compare",
    url: "/v2/tools/diff/",
    tags: ["diff", "compare", "text", "difference", "merge"],
    status: "active"
  },
  {
    id: "markdown-editor",
    name: "Markdown Editor",
    description: "Write and preview markdown with live rendering and export options.",
    category: "developer",
    icon: "fa-brands fa-markdown",
    url: "/v2/tools/markdown/",
    tags: ["markdown", "editor", "preview", "write", "document"],
    status: "active"
  },
  {
    id: "cron-parser",
    name: "Cron Parser",
    description: "Parse and generate cron expressions with human-readable explanations.",
    category: "developer",
    icon: "fa-solid fa-clock",
    url: "/v2/tools/cron/",
    tags: ["cron", "schedule", "parse", "job", "time"],
    status: "active"
  },
  {
    id: "css-generator",
    name: "CSS Generator",
    description: "Generate CSS for gradients, shadows, borders, flexbox, and grid layouts with live preview.",
    category: "developer",
    icon: "fa-brands fa-css3-alt",
    url: "/v2/tools/css/",
    tags: ["css", "gradient", "shadow", "border", "flexbox", "grid", "generator"],
    status: "active"
  },
  {
    id: "code-formatter",
    name: "Code Formatter",
    description: "Beautify and minify HTML, CSS, JavaScript, and JSON code with syntax options.",
    category: "developer",
    icon: "fa-solid fa-wand-magic-sparkles",
    url: "/v2/tools/formatter/",
    tags: ["format", "beautify", "minify", "html", "css", "javascript", "json", "prettier"],
    status: "active"
  },
  {
    id: "text-cleaner",
    name: "Text Cleaner",
    description: "Clean and transform text with operations like removing duplicates, sorting, and case conversion.",
    category: "general",
    icon: "fa-solid fa-broom",
    url: "/v2/tools/textcleaner/",
    tags: ["text", "clean", "sort", "duplicate", "trim", "case", "transform"],
    status: "active"
  },
  {
    id: "emoji-picker",
    name: "Emoji Picker",
    description: "Search and copy emojis with categories, skin tone variants, and recent history.",
    category: "general",
    icon: "fa-solid fa-face-smile",
    url: "/v2/tools/emoji/",
    tags: ["emoji", "emoticon", "smiley", "copy", "unicode", "symbol"],
    status: "active"
  },
  {
    id: "checklist-maker",
    name: "Checklist Maker",
    description: "Create, manage, and export checklists with drag-and-drop reordering and local storage.",
    category: "general",
    icon: "fa-solid fa-list-check",
    url: "/v2/tools/checklist/",
    tags: ["checklist", "todo", "task", "list", "organize", "productivity"],
    status: "active"
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    description: "Generate favicons from images with multiple sizes, shapes, and download as ICO or PNG package.",
    category: "developer",
    icon: "fa-solid fa-icons",
    url: "/v2/tools/favicon/",
    tags: ["favicon", "icon", "website", "generate", "ico", "png", "apple-touch"],
    status: "active"
  }
];

// Category labels
const categoryLabels = {
  'general': 'General',
  'developer': 'Developer',
  'ai': 'AI & ML'
};
