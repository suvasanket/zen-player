function uptimeUrlSplitter(usable) {
    let res = []
    usable.forEach(e => {
        const total = e[1].stats.usage.users.total
        const url = e[1].uri
        res.push({
            users: total,
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
        if (pivot.users < arr[i].users)
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
        const data = await response.json()
        const usable = data.filter(e => e[1].api && !e[1].monitor.down)

        const sorted = sort(uptimeUrlSplitter(usable))
        return sorted.map(e => e.url)
    }
    catch (e) {
        console.log(e)
    }
}
let api = null
export async function LoadApi() {
    if (!api) {
        api = await InstanceGenerator("https://api.invidious.io/instances.json?pretty=1&sort_by=type,users")
        localStorage.setItem("api", JSON.stringify(api))
    }
    return api
}

export function GetApi() {
    if (!api){
        const storedApi = localStorage.getItem("api")
        if (storedApi)
            api = JSON.parse(storedApi)
    }
    return api
}