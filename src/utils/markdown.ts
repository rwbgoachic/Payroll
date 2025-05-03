import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(content: string): string {
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
    headerIds: true, // Add IDs to headers
    mangle: false, // Don't escape HTML
    sanitize: false, // Let DOMPurify handle sanitization
  });

  // Render markdown to HTML
  const html = marked(content);

  // Configure DOMPurify options
  const purifyConfig = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'del',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ADD_TAGS: ['iframe'], // Allow embedded content
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'target'], // Additional attributes for iframes and links
  };

  // Sanitize the HTML
  return DOMPurify.sanitize(html, purifyConfig);
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

