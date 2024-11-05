const invidious_endpoint = "https://api.invidious.io/instances.json?pretty=1&sort_by=type,users"
const piped_endpoint = "https://raw.githubusercontent.com/TeamPiped/piped-uptime/master/README.md"

const source = "piped"

let endpoint
if (source === "piped")
    endpoint = piped_endpoint
else
    endpoint = invidious_endpoint


function uptimeUrlSplitter(usable) {
    let res = []
    usable.forEach(e => {
        if (e[1].type !== "https") return
        const total = e[1].stats.usage.users.total
        //const total = e[1].stats.playback.ratio
        if (total < 1000) return
        const url = e[1].uri
        res.push({
            factor: total,
            url: url
        })
    })
    return res
}

function sort(arr) {
    if (arr.length <= 1) return arr
    let pivot = arr[0]

    let leftArr = []
    let rightArr = []
    for (let i = 1; i < arr.length; i++) {
        if (pivot.factor < arr[i].factor)
            rightArr.push(arr[i])
        else
            leftArr.push(arr[i])
    }
    const leftSort = sort(leftArr)
    const rightSort = sort(rightArr)
    return [...leftSort, pivot, ...rightSort]
}

async function InstanceGenerator(endpoint) {
    try {
        const response = await fetch(endpoint)
        if (!response.ok)
            return

        if (source === "piped") {
            const data = await response.text()
            const only_yes = /.*\bUp\b.*/gm;
            const match = data.match(only_yes)
            let instances = []
            match.forEach(e => {
                const pattern = /\((https?:\/\/[^/]+)/
                let match = e.match(pattern)
                match = match.slice(1)
                instances.push(match[0])
            })
            return instances
        }
        else {
            const data = await response.json()
            const usable = data.filter(e => e[1].api && e[1].monitor && !e[1].monitor.down)
            const sorted = sort(uptimeUrlSplitter(usable))
            return sorted.map(e => e.url)
        }
    }
    catch (e) {
        console.log(e)
    }
}

let api = null
export async function LoadApi() {
    if (!sessionStorage.getItem('hasRun')) {
        let stored_endpoints
        try {
            stored_endpoints = CookieGetItem('endpoint_urls')
        } catch (e) {
            stored_endpoints = []
        }
        stored_endpoints = stored_endpoints === null ? [] : stored_endpoints
        const res_endpoints = await InstanceGenerator(endpoint)
        const merged = [...new Set([...stored_endpoints, ...res_endpoints])]

        const days = 7
        if (merged) {
            CookieSetItem('endpoint_urls', merged, (days * 24 * 60 * 60 * 1000))
            api = merged
        }
    }
    sessionStorage.setItem("hasRun", true)
}

export function GetApi() {
    const endpoint_urls = CookieGetItem('endpoint_urls')
    if (!endpoint_urls) return api
    return endpoint_urls
}

export function pushEndPoint(url) {
    const optimalApi = CookieGetItem('endpoint_urls')
    CookieSetItem('endpoint_urls', [...new Set([url, ...optimalApi])], (7 * 24 * 60 * 60 * 1000))
}

function CookieSetItem(name, value, time) {
    const date = new Date
    date.setTime(date.getTime() + time)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${JSON.stringify(value)}; ${expires}; path=/;`
}

function CookieGetItem(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2)
        return JSON.parse(parts.pop().split(';').shift())
    else
        return null
}
