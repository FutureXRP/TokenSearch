/* Client-side: loads public/news.json and filters in-browser. */
const PAGE_SIZE = 30
let ALL = []
let filtered = []
let page = 1
const $ = (id) => document.getElementById(id)
const list = $('list')
const meta = $('meta')
const pager = $('pager')
const prevBtn = $('prevBtn')
const nextBtn = $('nextBtn')
const pageLabel = $('pageLabel')
const q = $('q')
async function loadData() {
  try {
    const res = await fetch('public/news.json?_=' + Date.now())
    if (!res.ok) throw new Error('Failed to load data')
    const data = await res.json()
    ALL = Array.isArray(data.items) ? data.items : []
    filtered = ALL
    page = 1
    render()
  } catch (e) {
    meta.textContent = 'Error loading articles. Please try refreshing the page.'
    console.error(e)
  }
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
    ? `Showing ${start + 1}–${start + slice.length} of ${total} articles from the past year${q.value ? ` matching "${q.value}"` : ''}.`
    : 'No matching articles found. Try broader terms like BTC, Ethereum, or DeFi.'
  list.innerHTML = slice
    .map((it) => {
      const d = it.isoDate ? new Date(it.isoDate) : null
      const dateStr = d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''
      const host = it.source || (it.link ? new URL(it.link).hostname.replace('www.', '') : '')
      return `<li class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <a href="${it.link}" target="_blank" rel="noopener noreferrer" class="block">
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-lg font-semibold text-blue-700 leading-tight line-clamp-2 hover:text-blue-800 transition">${escapeHtml(it.title)}</h3>
            <span class="shrink-0 text-xs text-gray-500">${dateStr}</span>
          </div>
          ${it.contentSnippet ? `<p class="mt-3 text-sm text-gray-600 line-clamp-3">${escapeHtml(it.contentSnippet)}</p>` : ''}
          <div class="mt-4 text-xs text-gray-500 uppercase tracking-wide">${escapeHtml(host)}</div>
        </a>
      </li>`
    })
    .join('')
  if (totalPages > 1) {
    pager.classList.remove('hidden')
    pageLabel.textContent = `Page ${page} of ${totalPages}`
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
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
function debounce(fn, ms) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), ms)
  }
}
const runSearchDebounced = debounce(() => {
  const needle = q.value
  filtered = ALL.filter((it) => matchesQuery(it, needle))
  page = 1
  render()
}, 300)
// Events
q.addEventListener('input', runSearchDebounced)
q.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearchDebounced() })
prevBtn.addEventListener('click', () => { page = Math.max(1, page - 1); render() })
nextBtn.addEventListener('click', () => { page = page + 1; render() })
// Kickoff
loadData()
