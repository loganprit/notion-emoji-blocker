// Block Twitter emoji spritesheet requests in Notion and restore native emoji
(function() {
  'use strict';

  // Cache to track processed elements and avoid re-processing
  const processedElements = new WeakSet();
  let processedCount = 0;

  // Function to extract only emoji characters from text
  function extractEmoji(text) {
    // This regex matches most emoji characters including compound emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{200D}]/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.join('') : null;
  }

  // Function to detect if a string contains actual emoji characters
  function isActualEmoji(text) {
    return extractEmoji(text) !== null;
  }

  // Function to convert sprite emoji back to native emoji
  function restoreNativeEmoji() {
    const emojiElements = document.querySelectorAll('img.notion-emoji');
    let convertedCount = 0;
    
    emojiElements.forEach(img => {
      // Skip if we've already processed this element
      if (processedElements.has(img)) {
        return;
      }
      
      const altText = img.alt;
      const emojiOnly = extractEmoji(altText);
      
      // Only convert if it contains emoji and has the blocked emoji background
      if (emojiOnly && img.style.background && 
          (img.style.background.includes('twitter-emoji-spritesheet') || 
           img.style.background.includes('notion-emojis.s3'))) {
        
        // Mark as processed before replacement to avoid processing the same element twice
        processedElements.add(img);
        
        // Get original computed styles
        const originalStyles = getComputedStyle(img);
        
        // Create a span element with only the emoji part (no descriptive text)
        const span = document.createElement('span');
        span.textContent = emojiOnly;
        
        // Copy relevant styles from the original img
        span.style.fontSize = originalStyles.fontSize || '1em';
        span.style.lineHeight = originalStyles.lineHeight || 'normal';
        span.style.display = originalStyles.display || 'inline-block';
        span.style.width = originalStyles.width || 'auto';
        span.style.height = originalStyles.height || 'auto';
        span.style.verticalAlign = originalStyles.verticalAlign || 'baseline';
        span.style.marginRight = originalStyles.marginRight || '0.1em';
        span.style.marginLeft = originalStyles.marginLeft || '0';
        
        span.className = 'notion-emoji-native';
        span.setAttribute('data-emoji-converted', 'true');
        
        // Replace the img element with the span
        img.parentNode.replaceChild(span, img);
        
        convertedCount++;
        processedCount++;
        console.log('Restored native emoji:', emojiOnly, 'from alt text:', altText);
      } else {
        // Mark non-emoji images as processed to avoid checking them again
        processedElements.add(img);
        
        // Debug logging for skipped elements
        if (altText && !isActualEmoji(altText)) {
          console.log('Skipped non-emoji element with alt:', altText);
        }
      }
    });
    
    if (convertedCount > 0) {
      console.log(`Converted ${convertedCount} emoji (total: ${processedCount})`);
    }
  }

  // Function to observe for new emoji elements being added
  function observeEmojiChanges() {
    const observer = new MutationObserver((mutations) => {
      let hasNewEmoji = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node itself is an emoji
            if (node.matches && node.matches('img.notion-emoji')) {
              hasNewEmoji = true;
            }
            // Check if the added node contains emoji elements
            if (node.querySelectorAll && node.querySelectorAll('img.notion-emoji').length > 0) {
              hasNewEmoji = true;
            }
          }
        });
        
        // Also check for attribute changes on existing emoji elements
        if (mutation.type === 'attributes' && 
            mutation.target.matches && 
            mutation.target.matches('img.notion-emoji') &&
            (mutation.attributeName === 'style' || mutation.attributeName === 'src')) {
          hasNewEmoji = true;
        }
      });
      
      if (hasNewEmoji) {
        // Use a small delay to ensure the emoji styling is fully applied
        setTimeout(restoreNativeEmoji, 10);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'src']
    });
    
    return observer;
  }

  // Override fetch to block emoji requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    // Check if this is a request for emoji resources
    if (typeof url === 'string') {
      if (url.includes('twitter-emoji-spritesheet')) {
        console.log('Blocked Twitter emoji spritesheet request:', url);
        return Promise.reject(new Error('Blocked by Notion Emoji Blocker extension'));
      }
      if (url.includes('notion-emojis.s3-us-west-2.amazonaws.com')) {
        console.log('Blocked individual emoji SVG request:', url);
        return Promise.reject(new Error('Blocked by Notion Emoji Blocker extension'));
      }
    }
    
    // For all other requests, proceed normally
    return originalFetch.apply(this, args);
  };

  // Also override XMLHttpRequest as a fallback
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string') {
      if (url.includes('twitter-emoji-spritesheet')) {
        console.log('Blocked Twitter emoji spritesheet XHR request:', url);
        url = 'about:blank';
      }
      if (url.includes('notion-emojis.s3-us-west-2.amazonaws.com')) {
        console.log('Blocked individual emoji SVG XHR request:', url);
        url = 'about:blank';
      }
    }
    return originalXHROpen.call(this, method, url, ...args);
  };

  // Initialize the extension
  console.log('Notion Emoji Blocker: Content script loaded');
  
  // Wait for the page to load, then start observing and restore existing emoji
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        restoreNativeEmoji();
        observeEmojiChanges();
      }, 100);
    });
  } else {
    setTimeout(() => {
      restoreNativeEmoji();
      observeEmojiChanges();
    }, 100);
  }
})();