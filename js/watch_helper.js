export function video_audioSeparator(arr) {
    let video_adaptiveFormats = []
    let audio_adaptiveFormats = []
    const regex = /(audio\/|video\/)/;

    arr.forEach(e => {
        const type = (e.type).match(regex)
        if (type[0] === "audio/")
            audio_adaptiveFormats.push(e)
        if (type[0] === "video/")
            video_adaptiveFormats.push(e)
    })
    return [audio_adaptiveFormats, video_adaptiveFormats]
}
export function webm_mp4Separator(arr) {
    let webm = []
    let mp4 = []
    const regex = /(audio|video)\/([^;]+)/;
    arr.forEach(e => {
        const type = (e.type).match(regex)
        if (type[2] === "webm")
            webm.push(e)
        if (type[2] === "mp4")
            mp4.push(e)
    })
    return [webm, mp4]
}

export function qualityExtract(arr, def, dash) {
    let res = []
    if (dash) res.push({
        src: dash,
        type: "application/dash+xml",
        label: "DASH"
    })
    arr.forEach(e => {
        const obj = {}
        const qualityLabel = e.qualityLabel
        const url = e.url

        if (def === qualityLabel) obj.selected = true
        if (url) obj.src = url
        if (qualityLabel) obj.label = qualityLabel
        obj.type = "video/webm"
        res.push(obj)
    })
    return res
}

export function FormatDescription(text) {
    // Regular expression to match URLs
    const urlPattern = /(https?:\/\/\S+)/g;

    // First, replace newlines with a placeholder
    const placeholder = '###NEWLINE###';
    text = text.replace(/\n/g, placeholder);

    // Process URLs
    text = text.replace(urlPattern, (url) => {
        let domain = url.replace(/https?:\/\//, '').split('/')[0];
            // Remove 'www.' if it exists
            domain = domain.replace(/^www\./, '');
            const path = url.split('/').slice(1).join('/');
            return `<a href="${url}">${domain}/${path}</a>`;
        });

        // Replace placeholders with <br> tags
        return text.replace(new RegExp(placeholder, 'g'), '<br>');
}
