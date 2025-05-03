import { describe, it, expect } from 'vitest';
import { renderMarkdown, estimateReadTime, truncateText } from '../utils/markdown';

describe('Markdown Utils', () => {
  describe('renderMarkdown', () => {
    it('should render basic markdown', () => {
      const input = '# Hello\n\nThis is a test';
      const output = renderMarkdown(input);
      expect(output).toContain('<h1>Hello</h1>');
      expect(output).toContain('<p>This is a test</p>');
    });

    it('should sanitize dangerous HTML', () => {
      const input = '<script>alert("xss")</script>';
      const output = renderMarkdown(input);
      expect(output).not.toContain('<script>');
    });
  });

  describe('estimateReadTime', () => {
    it('should calculate read time correctly', () => {
      const words = Array(400).fill('word').join(' ');
      const readTime = estimateReadTime(words);
      expect(readTime).toBe(2);
    });
  });

  describe('truncateText', () => {
    it('should truncate text to specified length', () => {
      const text = 'This is a long text that needs to be truncated';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe('This is a long text...');
    });

    it('should not truncate text shorter than max length', () => {
      const text = 'Short text';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe(text);
    });
  });
});