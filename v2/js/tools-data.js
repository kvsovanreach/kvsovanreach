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
    url: "/v2/tools/quicknote/",
    tags: ["notes", "markdown", "text", "write", "memo"],
    status: "active"
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between various units of measurement including length, weight, and temperature.",
    category: "general",
    icon: "fa-solid fa-arrows-rotate",
    url: "/v2/tools/unitconverter/",
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
  },
  {
    id: "token-counter",
    name: "Token Counter",
    description: "Count tokens for GPT, Claude, and other LLMs with character and word statistics.",
    category: "developer",
    icon: "fa-solid fa-hashtag",
    url: "/v2/tools/tokencount/",
    tags: ["token", "count", "gpt", "claude", "llm", "ai", "openai", "anthropic"],
    status: "active"
  },
  {
    id: "json-to-table",
    name: "JSON to Table",
    description: "Convert JSON data to HTML tables with sorting, filtering, and export to CSV.",
    category: "developer",
    icon: "fa-solid fa-table",
    url: "/v2/tools/jsontable/",
    tags: ["json", "table", "convert", "csv", "data", "export"],
    status: "active"
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Convert text between different cases: uppercase, lowercase, title case, camelCase, and more.",
    category: "general",
    icon: "fa-solid fa-font",
    url: "/v2/tools/caseconverter/",
    tags: ["case", "convert", "uppercase", "lowercase", "camel", "snake", "title"],
    status: "active"
  },
  {
    id: "morse-code",
    name: "Morse Code",
    description: "Encode and decode Morse code with audio playback and visual representation.",
    category: "general",
    icon: "fa-solid fa-signal",
    url: "/v2/tools/morse/",
    tags: ["morse", "code", "encode", "decode", "audio", "signal"],
    status: "active"
  },
  {
    id: "unix-timestamp",
    name: "Unix Timestamp",
    description: "Convert between Unix timestamps and human-readable dates with timezone support.",
    category: "developer",
    icon: "fa-solid fa-clock-rotate-left",
    url: "/v2/tools/timestamp/",
    tags: ["unix", "timestamp", "epoch", "date", "time", "convert", "timezone"],
    status: "active"
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs, sentences, or words with various styles.",
    category: "general",
    icon: "fa-solid fa-paragraph",
    url: "/v2/tools/loremipsum/",
    tags: ["lorem", "ipsum", "placeholder", "text", "generate", "dummy"],
    status: "active"
  },
  {
    id: "binary-text",
    name: "Binary to Text",
    description: "Convert between binary, text, hexadecimal, and other number systems.",
    category: "developer",
    icon: "fa-solid fa-binary",
    url: "/v2/tools/binarytext/",
    tags: ["binary", "text", "hex", "convert", "decimal", "octal", "ascii"],
    status: "active"
  },
  {
    id: "browser-info",
    name: "Browser Info",
    description: "View detailed information about your browser, device, screen, and network.",
    category: "general",
    icon: "fa-solid fa-globe",
    url: "/v2/tools/browserinfo/",
    tags: ["browser", "info", "device", "screen", "network", "user-agent"],
    status: "active"
  },
  {
    id: "whitespace-stripper",
    name: "Whitespace Stripper",
    description: "Remove extra whitespace, trim lines, and clean up text formatting.",
    category: "general",
    icon: "fa-solid fa-eraser",
    url: "/v2/tools/whitespace/",
    tags: ["whitespace", "strip", "trim", "clean", "space", "text"],
    status: "active"
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate Body Mass Index with health recommendations and weight categories.",
    category: "general",
    icon: "fa-solid fa-weight-scale",
    url: "/v2/tools/bmi/",
    tags: ["bmi", "body", "mass", "index", "health", "weight", "calculator"],
    status: "active"
  },
  {
    id: "days-between",
    name: "Days Between Dates",
    description: "Calculate the number of days, weeks, months, and years between two dates.",
    category: "general",
    icon: "fa-solid fa-calendar-days",
    url: "/v2/tools/datesbetween/",
    tags: ["days", "between", "dates", "calendar", "difference", "calculate"],
    status: "active"
  },
  {
    id: "http-status",
    name: "HTTP Status Reference",
    description: "Complete reference for HTTP status codes with descriptions and examples.",
    category: "developer",
    icon: "fa-solid fa-server",
    url: "/v2/tools/httpstatus/",
    tags: ["http", "status", "code", "reference", "api", "web", "error"],
    status: "active"
  },
  {
    id: "time-since",
    name: "Time Since Calculator",
    description: "Calculate how much time has passed since or until a specific date with live updates.",
    category: "general",
    icon: "fa-solid fa-hourglass-half",
    url: "/v2/tools/timesince/",
    tags: ["time", "since", "until", "countdown", "elapsed", "date", "calculator"],
    status: "active"
  },
  {
    id: "word-cloud",
    name: "Word Cloud Generator",
    description: "Generate beautiful word clouds from text with customizable colors and layouts.",
    category: "general",
    icon: "fa-solid fa-cloud",
    url: "/v2/tools/wordcloud/",
    tags: ["word", "cloud", "generate", "visualize", "frequency", "text"],
    status: "active"
  },
  {
    id: "meta-tag",
    name: "Meta Tag Previewer",
    description: "Preview and generate meta tags for SEO with Google, Facebook, Twitter, and LinkedIn previews.",
    category: "developer",
    icon: "fa-solid fa-tags",
    url: "/v2/tools/metatag/",
    tags: ["meta", "tag", "seo", "preview", "og", "twitter", "social"],
    status: "active"
  },
  {
    id: "alphabetizer",
    name: "Alphabetizer",
    description: "Sort lists alphabetically A-Z, Z-A, by length, remove duplicates, and customize separators.",
    category: "general",
    icon: "fa-solid fa-arrow-down-a-z",
    url: "/v2/tools/alphabetizer/",
    tags: ["sort", "alphabetize", "list", "order", "organize", "text"],
    status: "active"
  },
  {
    id: "reverse-text",
    name: "Reverse Text",
    description: "Reverse text by characters, words, or lines. Create mirror text and upside-down text.",
    category: "general",
    icon: "fa-solid fa-repeat",
    url: "/v2/tools/reversetext/",
    tags: ["reverse", "text", "mirror", "flip", "backwards", "upside-down"],
    status: "active"
  },
  {
    id: "smart-quote",
    name: "Smart Quote Fixer",
    description: "Convert straight quotes to curly quotes, fix apostrophes, em dashes, and ellipsis.",
    category: "general",
    icon: "fa-solid fa-quote-left",
    url: "/v2/tools/smartquote/",
    tags: ["quote", "typography", "curly", "apostrophe", "dash", "ellipsis"],
    status: "active"
  },
  {
    id: "placeholder-image",
    name: "Placeholder Image",
    description: "Generate SVG placeholder images with custom dimensions, colors, and text.",
    category: "developer",
    icon: "fa-solid fa-image",
    url: "/v2/tools/placeholder/",
    tags: ["placeholder", "image", "svg", "dummy", "mockup", "generate"],
    status: "active"
  },
  {
    id: "aspect-ratio",
    name: "Aspect Ratio Visualizer",
    description: "Calculate and visualize aspect ratios. Compare common ratios like 16:9, 4:3, and 1:1.",
    category: "general",
    icon: "fa-solid fa-crop",
    url: "/v2/tools/aspectratio/",
    tags: ["aspect", "ratio", "dimension", "width", "height", "video", "image"],
    status: "active"
  },
  {
    id: "font-pairing",
    name: "Font Pairing Playground",
    description: "Test Google Font combinations for headings and body text with live preview.",
    category: "developer",
    icon: "fa-solid fa-font",
    url: "/v2/tools/fontpair/",
    tags: ["font", "pairing", "typography", "google", "heading", "body", "design"],
    status: "active"
  },
  {
    id: "grayscale-tester",
    name: "Grayscale Tester",
    description: "Test images in grayscale to check contrast and accessibility.",
    category: "general",
    icon: "fa-solid fa-circle-half-stroke",
    url: "/v2/tools/grayscale/",
    tags: ["grayscale", "image", "contrast", "accessibility", "black", "white"],
    status: "active"
  },
  {
    id: "discount-calculator",
    name: "Discount Calculator",
    description: "Calculate discounted prices, savings, and final amounts with optional tax.",
    category: "general",
    icon: "fa-solid fa-percent",
    url: "/v2/tools/discount/",
    tags: ["discount", "price", "sale", "percent", "savings", "calculator"],
    status: "active"
  },
  {
    id: "duration-adder",
    name: "Time Duration Adder",
    description: "Add and subtract time durations in hours, minutes, and seconds format.",
    category: "general",
    icon: "fa-solid fa-hourglass",
    url: "/v2/tools/duration/",
    tags: ["time", "duration", "add", "subtract", "hours", "minutes", "seconds"],
    status: "active"
  },
  {
    id: "percent-change",
    name: "Percentage Change",
    description: "Calculate percentage increase or decrease between two values.",
    category: "general",
    icon: "fa-solid fa-chart-line",
    url: "/v2/tools/percentchange/",
    tags: ["percent", "change", "increase", "decrease", "difference", "calculator"],
    status: "active"
  },
  {
    id: "interest-calculator",
    name: "Interest Calculator",
    description: "Calculate simple interest on principal amount over time.",
    category: "general",
    icon: "fa-solid fa-coins",
    url: "/v2/tools/interest/",
    tags: ["interest", "simple", "principal", "rate", "time", "finance", "calculator"],
    status: "active"
  },
  {
    id: "roman-numeral",
    name: "Roman Numeral Converter",
    description: "Convert between Roman numerals and Arabic numbers (1-3999).",
    category: "general",
    icon: "fa-solid fa-landmark",
    url: "/v2/tools/romannumeral/",
    tags: ["roman", "numeral", "convert", "number", "arabic", "ancient"],
    status: "active"
  },
  {
    id: "hydration-log",
    name: "Hydration Log",
    description: "Track daily water intake with visual progress and customizable goals.",
    category: "general",
    icon: "fa-solid fa-droplet",
    url: "/v2/tools/hydration/",
    tags: ["water", "hydration", "drink", "health", "tracker", "daily"],
    status: "active"
  },
  {
    id: "dead-pixel-test",
    name: "Dead Pixel Test",
    description: "Test your monitor for dead or stuck pixels with fullscreen color cycling.",
    category: "general",
    icon: "fa-solid fa-display",
    url: "/v2/tools/deadpixel/",
    tags: ["pixel", "dead", "stuck", "monitor", "screen", "test", "display"],
    status: "active"
  },
  {
    id: "coin-toss",
    name: "Coin Toss",
    description: "Virtual coin flip with 3D animation, statistics, and history tracking.",
    category: "general",
    icon: "fa-solid fa-coins",
    url: "/v2/tools/cointoss/",
    tags: ["coin", "flip", "toss", "random", "heads", "tails", "decision"],
    status: "active"
  },
  {
    id: "pali-glossary",
    name: "Pali Glossary",
    description: "Buddhist terminology reference with Pali-English translations and definitions.",
    category: "general",
    icon: "fa-solid fa-om",
    url: "/v2/tools/paliglossary/",
    tags: ["pali", "buddhist", "glossary", "terminology", "dharma", "meditation"],
    status: "active"
  }
];

// Category labels
const categoryLabels = {
  'general': 'General',
  'developer': 'Developer',
  'ai': 'AI & ML'
};
