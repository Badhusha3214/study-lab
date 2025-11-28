import { Innertube } from 'youtubei.js';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export const fetchBlogContent = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Fetching blog content from:', url);

    // Fetch the blog page
    const response = await fetch(url);
    const html = await response.text();

    // Parse and extract readable content
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove script and style tags
    document.querySelectorAll('script, style, noscript').forEach(el => el.remove());

    // Try to find main content
    const main = document.querySelector('article, main, .post, #post, .content, #content, .entry-content, .post-content') || document.body;
    
    let text = main.textContent.replace(/\s+/g, ' ').trim();
    
    // Limit to 15000 characters
    text = text.slice(0, 15000);

    console.log('Blog content extracted, length:', text.length);

    res.json({
      success: true,
      url,
      content: text,
      length: text.length
    });
  } catch (error) {
    console.error('Blog fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch blog content',
      details: error.message
    });
  }
};

export const fetchYouTubeTranscript = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Fetching YouTube transcript for:', videoId);

    // Initialize Innertube
    const youtube = await Innertube.create();
    
    // Get video info
    const info = await youtube.getInfo(videoId);
    
    // Get transcript
    const transcriptData = await info.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video');
    }
    
    // Extract text from transcript segments
    const segments = transcriptData.transcript.content.body.initial_segments;
    const transcriptText = segments.map(segment => segment.snippet.text).join(' ');
    
    console.log('Transcript extracted, length:', transcriptText.length);

    res.json({
      success: true,
      videoId,
      transcript: transcriptText,
      length: transcriptText.length
    });
  } catch (error) {
    console.error('YouTube transcript error:', error);
    res.status(500).json({
      error: 'Failed to fetch YouTube transcript',
      details: error.message
    });
  }
};
