import React from 'react';

/**
 * Link detection and preview utilities
 */

/**
 * Detect URLs in text
 * @param {string} text - Text to check for URLs
 * @returns {Array} Array of URL objects with {url, start, end}
 */
export function detectLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = [];
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({
      url: match[0],
      start: match.index,
      end: match.index + match[0].length,
      text: match[0]
    });
  }

  return matches;
}

/**
 * Check if text contains URLs
 * @param {string} text - Text to check
 * @returns {boolean} True if contains URLs
 */
export function hasLinks(text) {
  return /(https?:\/\/[^\s]+)/.test(text);
}

/**
 * Replace URLs in text with clickable links
 * @param {string} text - Text with URLs
 * @returns {JSX.Element} Text with clickable links
 */
export function renderTextWithLinks(text) {
  if (!text || typeof text !== 'string') {
    return <span>{text || ''}</span>;
  }

  const links = detectLinks(text);
  
  if (links.length === 0) {
    return <span>{text}</span>;
  }

  const parts = [];
  let lastIndex = 0;

  links.forEach((link, index) => {
    // Add text before link
    if (link.start > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, link.start)}
        </span>
      );
    }

    // Add clickable link
    parts.push(
      <a
        key={`link-${index}`}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="message-link"
        onClick={(e) => e.stopPropagation()}
      >
        {link.url}
      </a>
    );

    lastIndex = link.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <span>{parts}</span>;
}

