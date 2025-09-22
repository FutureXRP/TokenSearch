<script type="text/plain" data-filename="assets/main.js">/* Client-side: loads public/news.json and filters in-browser. */
const res = await fetch('public/news.json?_=' + Date.now())
const data = await res.json()
ALL = Array.isArray(data.items) ? data.items : []
filtered = ALL
page = 1
render()
}

function matchesQuery(it, needle) {
if (!needle) return true
const n = needle.trim().toLowerCase()
const hay = [it.title, it.contentSnippet].join(' ').toLowerCase()
return hay.includes(n) || hay.includes('$' + n) || hay.includes('(' + n + ')')
}

function render() {
const total = filtered.length
const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
page = Math.max(1, Math.min(page, totalPages))
const start = (page - 1) * PAGE_SIZE
const slice = filtered.slice(start, start + PAGE_SIZE)

meta.textContent = total
? `Showing ${slice.length} of ${total} articles from the past 12 months${q.value ? ` for “${q.value}”` : ''}.`
: 'No results. Try BTC, Ethereum, DeFi, NFTs, etc.'

list.innerHTML = slice
.map((it) => {
const d = it.isoDate ? new Date(it.isoDate) : null
const dateStr = d ? d.toLocaleDateString() : ''
const host = it.source || (it.link ? new URL(it.link).hostname.replace('www.', '') : '')
return `<li class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
<a href="${it.link}" target="_blank" rel="noopener noreferrer" class="block">
<div class="flex items-start justify-between gap-4">
<h3 class="text-lg font-medium leading-snug line-clamp-2">${escapeHtml(it.title)}</h3>
<span class="shrink-0 text-xs text-neutral-500">${dateStr}</span>
</div>
${it.contentSnippet ? `<p class="mt-2 text-sm text-neutral-700 line-clamp-3">${escapeHtml(it.contentSnippet)}</p>` : ''}
<div class="mt-3 text-xs text-neutral-500">${escapeHtml(host)}</div>
</a>
</li>`
})
.join('')

if (totalPages > 1) {
pager.classList.remove('hidden')
pageLabel.textContent = `Page ${page} / ${totalPages}`
prevBtn.disabled = page === 1
nextBtn.disabled = page === totalPages
} else {
pager.classList.add('hidden')
}
}

function escapeHtml(str = '') {
return str
.replaceAll('&', '&amp;')
.replaceAll('<', '&lt;')
.replaceAll('>', '&gt;')
}

function runSearch() {
const needle = q.value
filtered = ALL.filter((it) => matchesQuery(it, needle))
page = 1
render()
}

// Events
searchBtn.addEventListener('click', runSearch)
q.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch() })
prevBtn.addEventListener('click', () => { page = Math.max(1, page - 1); render() })
nextBtn.addEventListener('click', () => { page = page + 1; render() })

// Kickoff
loadData()
</script>
