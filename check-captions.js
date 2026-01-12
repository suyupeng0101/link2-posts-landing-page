const puppeteer = require('puppeteer');

async function checkVideoCaptions(videoId) {
  console.log(`\n=== Checking captions for: ${videoId} ===\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const videoInfo = await page.evaluate(() => {
      const title = document.querySelector('h1.title')?.innerText || document.querySelector('h1 yt-formatted-string')?.innerText;
      return { title };
    });
    
    console.log(`Video title: ${videoInfo.title}`);
    
    const captionsData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      
      for (const script of scripts) {
        const text = script.textContent;
        if (text && text.includes('captionTracks')) {
          try {
            const match = text.match(/var ytInitialPlayerResponse = ({.+?});/);
            if (match) {
              const playerResponse = JSON.parse(match[1]);
              if (playerResponse.captions && playerResponse.captions.playerCaptionsTracklistRenderer) {
                return playerResponse.captions.playerCaptionsTracklistRenderer;
              }
            }
          } catch (e) {
            console.error('Error parsing script:', e);
          }
        }
      }
      
      return null;
    });
    
    if (captionsData) {
      console.log(`\n✓ Captions data found!`);
      
      if (captionsData.captionTracks && captionsData.captionTracks.length > 0) {
        console.log(`\nFound ${captionsData.captionTracks.length} caption tracks:`);
        captionsData.captionTracks.forEach((track, index) => {
          console.log(`  ${index + 1}. Language: ${track.languageCode}, Name: ${track.name.simpleText || 'N/A'}`);
        });
        
        return { hasCaptions: true, tracks: captionsData.captionTracks };
      } else {
        console.log(`\n✗ No caption tracks found`);
        return { hasCaptions: false };
      }
    } else {
      console.log(`\n✗ No captions data found in page`);
      return { hasCaptions: false };
    }
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    return { hasCaptions: false };
  } finally {
    await browser.close();
  }
}

const videoId = 'mA3jhbcKjRI';
checkVideoCaptions(videoId);