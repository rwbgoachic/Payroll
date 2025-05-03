import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlogEditor from '../components/blog/BlogEditor';
import { BlogService } from '../services/blogService';

vi.mock('../services/blogService');

describe('BlogEditor', () => {
  it('renders editor form', () => {
    render(<BlogEditor />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockCreate = vi.spyOn(BlogService, 'createPost');
    render(<BlogEditor />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Post' }
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test Content' }
    });
    fireEvent.click(screen.getByText(/save/i));

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Post',
      content: 'Test Content'
    }));
  });

  it('shows preview mode', () => {
    render(<BlogEditor />);
    fireEvent.click(screen.getByText(/preview/i));
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });
});