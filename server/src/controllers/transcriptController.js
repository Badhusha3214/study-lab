import { Innertube } from 'youtubei.js';

export const getTranscript = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    
    console.log('Fetching transcript for video ID:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Initialize Innertube
    const youtube = await Innertube.create();
    
    // Get video info
    const info = await youtube.getInfo(videoId);
    
    // Get transcript
    const transcriptData = await info.getTranscript();
    
    console.log('Transcript fetched successfully');
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video');
    }
    
    // Extract text from transcript segments
    const segments = transcriptData.transcript.content.body.initial_segments;
    const transcriptText = segments.map(segment => segment.snippet.text).join(' ');
    
    console.log('Combined transcript length:', transcriptText.length);
    
    res.json({ 
      success: true,
      videoId,
      transcript: transcriptText,
      segments: segments.map(s => ({
        text: s.snippet.text,
        start: s.start_ms,
        duration: s.end_ms - s.start_ms
      }))
    });
  } catch (error) {
    console.error('Transcript fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transcript. The video may not have captions available.',
      details: error.message 
    });
  }
};
