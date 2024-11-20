const invidious_endpoint = "https://api.invidious.io/instances.json?pretty=1&sort_by=type,users"
const piped_endpoint = "https://raw.githubusercontent.com/TeamPiped/piped-uptime/master/README.md"

const priority = "in" // "in" / "pi"

async function getAllEndpoints(first) {
    let second = "pi"
    let first_endpoint = invidious_endpoint
    let second_endpoint = piped_endpoint
    if (first === "pi") {
        first_endpoint = piped_endpoint
        second = "in"
        second_endpoint = invidious_endpoint
    }
    const first_res = await InstanceGenerator(first_endpoint, first)
    const second_res = await InstanceGenerator(second_endpoint, second)
    return [...first_res, ...second_res]
}

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

async function InstanceGenerator(endpoint, source) {
    try {
        const response = await fetch(endpoint)
        if (!response.ok)
            return

        if (source === "pi") {
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
            return instances.map(e => ({ url: e, source: source }))
        }
        else if (source === "in") {
            const data = await response.json()
            const usable = data.filter(e => e[1].api && e[1].monitor && !e[1].monitor.down)
            const sorted = sort(uptimeUrlSplitter(usable))
            return sorted.map(e => e.url).map(e => ({ url: e, source: source }))
        }
    }
    catch (e) {
        console.log(e)
    }
}

let api = null
export async function LoadApi() {
    let stored_endpoints
    try {
        stored_endpoints = CookieGetItem('endpoint_urls')
    } catch (e) {
        stored_endpoints = []
    }
    stored_endpoints = stored_endpoints === null ? [] : stored_endpoints
    //const res_endpoints = await InstanceGenerator(piped_endpoint, "pi")
    const res_endpoints = await getAllEndpoints(priority)
    console.log(res_endpoints)
    const merged = [...new Set([...stored_endpoints, ...res_endpoints])]

    const days = 7
    if (merged) {
        CookieSetItem('endpoint_urls', merged, (days * 24 * 60 * 60 * 1000))
        api = merged
    }
}

export function GetApi() {
    const endpoint_urls = CookieGetItem('endpoint_urls')
    if (!endpoint_urls) return api
    return endpoint_urls
}

export function pushEndPoint(url) {
    const optimalApi = CookieGetItem('endpoint_urls')
    function removeduplicate(arr) {
        return Array.from(
            new Set(arr.map(obj => JSON.stringify(obj)))
        ).map(str => JSON.parse(str))
    }
    CookieSetItem('endpoint_urls', [...removeduplicate([url, ...optimalApi])], (7 * 24 * 60 * 60 * 1000))
}

export function CookieSetItem(name, value, time) {
    const date = new Date
    date.setTime(date.getTime() + time)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${JSON.stringify(value)}; ${expires}; path=/;`
}

export function CookieGetItem(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2)
        return JSON.parse(parts.pop().split(';').shift())
    else
        return null
}
