/*
Fetch crypto RSS feeds, merge, filter to last 365 days, and write public/news.json
Run automatically by GitHub Actions on push & nightly. You can run locally: `npm run build`.
*/
const fs = require('fs')
const path = require('path')
const Parser = require('rss-parser')

const CRYPTO_FEEDS = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed',
  'https://bitcoinmagazine.com/feed',
  'https://www.cryptopolitan.com/feed/',
  'https://u.today/rss'
]

const parser = new Parser({ timeout: 30000 }) // Increased timeout for reliability

function withinPastYear(date) {
  const d = new Date(date)
  if (isNaN(d)) return false
  const now = new Date()
  const yearAgo = new Date(now)
  yearAgo.setFullYear(now.getFullYear() - 1)
  return d >= yearAgo && d <= now
}

function normalizeItem(it, sourceTitle) {
  const dateStr = it.isoDate || it.pubDate || ''
  const d = new Date(dateStr)
  return {
    title: it.title || '',
    link: it.link || '',
    isoDate: d.toISOString(),
    contentSnippet: it.contentSnippet || it['content:encodedSnippet'] || '',
    source: sourceTitle || ''
  }
}

async function main() {
  const results = []
  const seenLinks = new Set() // To avoid duplicates

  await Promise.all(
    CRYPTO_FEEDS.map(async (feedUrl) => {
      try {
        const feed = await parser.parseURL(feedUrl)
        const source = feed.title || new URL(feedUrl).hostname.replace('www.', '')
        for (const it of feed.items || []) {
          const date = it.isoDate || it.pubDate
          if (!date) continue
          if (withinPastYear(date)) {
            const normalized = normalizeItem(it, source)
            if (!seenLinks.has(normalized.link)) {
              seenLinks.add(normalized.link)
              results.push(normalized)
            }
          }
        }
      } catch (e) {
        // ignore single feed errors to keep the build green
        console.warn('Feed failed:', feedUrl, e.message)
      }
    })
  )

  // sort newest first
  results.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))

  // Write JSON
  const outDir = path.join(__dirname, '..', 'public')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'news.json')
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), items: results }, null, 2))
  console.log(`Wrote ${results.length} unique items → public/news.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
