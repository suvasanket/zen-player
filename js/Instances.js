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
export async function LoadApi() {
    if (!sessionStorage.getItem('hasRun')) {
        let stored_endpoints
        try {
            stored_endpoints = JSON.parse(localStorage.getItem("local_endpoint"))
        } catch (e) {
            stored_endpoints = []
        }
        stored_endpoints = stored_endpoints === null ? [] : stored_endpoints
        const res_endpoints = await InstanceGenerator(endpoint)
        const merged = [...new Set([...stored_endpoints, ...res_endpoints])]

        if (merged) {
            localStorage.setItem("local_endpoint", JSON.stringify(merged))
        }
    }
    sessionStorage.setItem("hasRun", true)
}

let api = null
export function GetApi() {
    if (!api) {
        const storedApi = localStorage.getItem("local_endpoint")
        if (storedApi)
            api = JSON.parse(storedApi)
    }
    return api
}

export function pushEndPoint(url) {
    const optimalApi = JSON.parse(localStorage.getItem("local_endpoint"))
    localStorage.setItem(
        "local_endpoint",
        JSON.stringify([...new Set([url, ...optimalApi])])
    )
}

export function removeEndPoint(url) {
    const optimalApi = JSON.parse(localStorage.getItem("local_endpoint"))
    optimalApi.splice(optimalApi.indexOf(url), 1)
    localStorage.setItem(
        "local_endpoint",
        optimalApi
    )
}
