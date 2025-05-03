import React from 'react';
import { Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';
import { trackBlogShare } from '../../utils/analytics';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };

  const handleShare = (platform: string) => {
    trackBlogShare(url, platform);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-primary"
        title="Share on Twitter"
        onClick={() => handleShare('twitter')}
      >
        <Twitter size={20} />
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-primary"
        title="Share on LinkedIn"
        onClick={() => handleShare('linkedin')}
      >
        <Linkedin size={20} />
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-primary"
        title="Share on Facebook"
        onClick={() => handleShare('facebook')}
      >
        <Facebook size={20} />
      </a>
      <button
        onClick={copyToClipboard}
        className="text-gray-500 hover:text-primary"
        title="Copy link"
      >
        <LinkIcon size={20} />
      </button>
    </div>
  );
};

export default ShareButtons;