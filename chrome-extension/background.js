// Life Dashboard Time Tracker — background service worker
// Tracks active time per site per day. No session counts, no popup UI.
// Syncs to localhost:3001 every 30s. Fires notifications at 80% and 100% of daily budgets.

const DASHBOARD_URL = 'http://localhost:5173'
const SERVER_URL = 'http://localhost:3001'
const ALARM_NAME = 'flush-and-sync'

// State
let activeSite = null
let startTime = null
let isBrowserFocused = true
let isUserIdle = false

// Sites to track: normalized hostname → display name
const TRACKED_SITES = {
  'www.instagram.com': 'Instagram',
  'instagram.com': 'Instagram',
  'www.linkedin.com': 'LinkedIn',
  'linkedin.com': 'LinkedIn',
  'www.youtube.com': 'YouTube',
  'youtube.com': 'YouTube',
  'mail.google.com': 'Gmail',
  'www.deeplearning.ai': 'Deeplearning.ai',
  'deeplearning.ai': 'Deeplearning.ai',
  'www.udemy.com': 'Udemy',
  'udemy.com': 'Udemy',
  'github.com': 'GitHub',
  'www.github.com': 'GitHub',
  'news.ycombinator.com': 'Hacker News',
  'www.reddit.com': 'Reddit',
  'reddit.com': 'Reddit',
  'twitter.com': 'Twitter/X',
  'x.com': 'Twitter/X',
  'www.notion.so': 'Notion',
  'notion.so': 'Notion',
  'www.figma.com': 'Figma',
  'figma.com': 'Figma',
  'chatgpt.com': 'ChatGPT',
  'claude.ai': 'Claude',
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getSiteName(url) {
  if (!url) return null
  try {
    const host = new URL(url).hostname
    return TRACKED_SITES[host] ?? null
  } catch {
    return null
  }
}

function saveData(date, siteName, secondsToAdd, callback) {
  chrome.storage.local.get(['trackerData'], result => {
    const data = result.trackerData ?? {}
    if (!data[date]) data[date] = { usage: {} }
    if (!data[date].usage) data[date].usage = {}
    data[date].usage[siteName] = (data[date].usage[siteName] ?? 0) + secondsToAdd
    chrome.storage.local.set({ trackerData: data }, () => {
      if (callback) callback(data[date])
    })
  })
}

function saveUsageTime() {
  if (!activeSite || !startTime || !isBrowserFocused || isUserIdle) return
  const now = Date.now()
  const elapsed = Math.round((now - startTime) / 1000)
  if (elapsed <= 0) return
  startTime = now
  const date = getToday()
  saveData(date, activeSite, elapsed, dayData => {
    syncToServer(date, dayData)
  })
}

async function syncToServer(date, dayData) {
  try {
    await fetch(`${SERVER_URL}/api/productivity/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, data: dayData }),
    })
  } catch {
    // silent — server may not be running
  }
}

function switchActiveSite(newSite) {
  saveUsageTime()
  activeSite = newSite
  startTime = newSite ? Date.now() : null
}

// Tab activated
chrome.tabs.onActivated.addListener(info => {
  chrome.tabs.get(info.tabId, tab => {
    if (chrome.runtime.lastError) return
    switchActiveSite(getSiteName(tab.url))
  })
})

// URL changed in current tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]?.id !== tabId) return
    switchActiveSite(getSiteName(tab.url))
  })
})

// Browser focus
chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    saveUsageTime()
    isBrowserFocused = false
    activeSite = null
    startTime = null
  } else {
    isBrowserFocused = true
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) switchActiveSite(getSiteName(tabs[0].url))
    })
  }
})

// Idle detection
chrome.idle.setDetectionInterval(60)
chrome.idle.onStateChanged.addListener(state => {
  if (state === 'active') {
    isUserIdle = false
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) switchActiveSite(getSiteName(tabs[0].url))
    })
  } else {
    saveUsageTime()
    isUserIdle = true
    activeSite = null
    startTime = null
  }
})

// 30-second alarm flush + sync
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 })
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name !== ALARM_NAME) return
  saveUsageTime()
})

// On startup: restore active tab
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) switchActiveSite(getSiteName(tabs[0].url))
  })
})
