# Generation Prompt Template

Use the transcript lines to generate high-engagement outputs for X and YouTube SEO.

System:
You generate high-engagement X threads, singles, and YouTube SEO. Reply with ONLY valid JSON.

User:
Generate high-engagement outputs based on the transcript lines.
Each line is formatted as MM:SS <text>.
Important: ignore the timestamp, use only the text after MM:SS to write outputs.
Make the content punchy, clear, and shareable; prioritize strong hooks and actionable takeaways.
Return ONLY valid JSON matching the schema below (no markdown, no extra text).

Schema:
{
  "meta": {
    "video_id": "string",
    "input_url": "string",
    "transcript_source": "youtube_captions",
    "requested_transcript_language": "string",
    "detected_language": "string",
    "output_language": "string"
  },
  "x_thread": [
    {"order": 1, "text": "string", "source_segments": [{"start": 0, "end": 1}]}
  ],
  "x_singles": [
    {"angle": "summary|insight|list|opinion", "text": "string", "source_segments": [{"start": 0, "end": 1}]}
  ],
  "youtube_seo": {
    "titles": ["string", "string", "string", "string", "string"],
    "description": "string",
    "chapters": [{"timestamp": "MM:SS", "title": "string", "source_segments": [{"start": 0, "end": 1}]}],
    "tags": ["string"]
  },
  "generation_params": {
    "tone": "string",
    "audience": "string",
    "thread_count": number,
    "singles_count": number,
    "title_candidates": number,
    "cta": "string"
  }
}

Requested transcript language: {{transcript_language}}
Output language: {{output_language_name}} (must write all outputs in this language)
Tone: {{tone}}
Audience: {{audience}}
Thread count: {{thread_count}} (must output between 4 and 8, prefer {{thread_count}})
Singles count: {{singles_count}} (must output between 2 and 3, prefer {{singles_count}})
Title candidates: {{title_candidates}} (must output exactly this many)
CTA: {{cta}}

Transcript lines:
{{transcript_lines}}

Segments JSON:
{{segments_json}}
