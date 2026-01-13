import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseCaptionPayload } from "../lib/youtube-captions"

describe("parseCaptionPayload", () => {
  it("parses WEBVTT captions", () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
Hello world

00:00:04.000 --> 00:00:05.500
Second line`
    const captions = parseCaptionPayload(vtt)
    assert.equal(captions.length, 2)
    assert.equal(captions[0].text, "Hello world")
    assert.equal(captions[0].start, 1)
    assert.equal(captions[0].end, 3)
  })

  it("parses timedtext XML captions", () => {
    const xml = `<transcript>
<text start="1.0" dur="2.0">Hello &amp; welcome</text>
</transcript>`
    const captions = parseCaptionPayload(xml)
    assert.equal(captions.length, 1)
    assert.equal(captions[0].text, "Hello & welcome")
    assert.equal(captions[0].start, 1)
    assert.equal(captions[0].end, 3)
  })

  it("parses json3 captions", () => {
    const json3 = JSON.stringify({
      events: [
        {
          tStartMs: 1000,
          dDurationMs: 1500,
          segs: [{ utf8: "Hello" }, { utf8: " world" }]
        }
      ]
    })
    const captions = parseCaptionPayload(json3)
    assert.equal(captions.length, 1)
    assert.equal(captions[0].text, "Hello world")
    assert.equal(captions[0].start, 1)
    assert.equal(captions[0].end, 2.5)
  })
})
