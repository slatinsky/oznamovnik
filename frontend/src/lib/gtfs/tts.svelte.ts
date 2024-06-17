
export interface TtsStop {
    stop_code: string
    stop_name: string
    slug: string
    text_to_speech: string
}


export interface TtsExtra {
    id: string
    slug: string
    text_to_speech: string
    text_to_speech_en: string
}

class Tts {
    responseStops: TtsStop[]
    responseStopsLookup: Record<string, TtsStop>
    responseExtras: TtsExtra[]
    responseExtrasLookup: Record<string, TtsExtra>
    queue: string[]
    isPlaying: boolean

    constructor() {
        this.responseStops = []
        this.responseStopsLookup = {}  // stop_code -> TtsStop
        this.responseExtras = []
        this.responseExtrasLookup = {}  // slug -> TtsExtra
        this.queue = []
        this.isPlaying = false
    }

    async addToQueue(path: string) {
        this.queue.push(path)

        if (this.isPlaying) {
            return
        }

        this.isPlaying = true
        while (this.queue.length > 0) {
            const path = this.queue.shift()
            const audio = new Audio(path);
            audio.play();
            // await for audio to finish
            await new Promise((resolve) => {
                audio.onended = resolve
            })
        }
        this.isPlaying = false
    }
    
    async init() {
        const responseStopsRespPromise = fetch('/audio/sk-SK-ViktoriaNeural/stops.json')
        const responseExtrasRespPromise = fetch('/audio/sk-SK-ViktoriaNeural/extras.json')
        const responseStopsResp = await responseStopsRespPromise
        const responseExtrasResp = await responseExtrasRespPromise
        this.responseStops = await responseStopsResp.json()
        this.responseExtras = await responseExtrasResp.json()
        this.responseStopsLookup = {}
        for (const stop of this.responseStops) {
            this.responseStopsLookup[stop.stop_code] = stop
        }
        this.responseExtrasLookup = {}
        for (const extra of this.responseExtras) {
            this.responseExtrasLookup[extra.slug] = extra
        }
    }

    playStop(stopCode: string) {
        const stop = this.responseStopsLookup[stopCode]
        if (stop) {
            // play file `/audio/sk-SK-ViktoriaNeural/stops/${stop.slug}.mp3`
            console.log(`Playing stop ${stop.stop_name}`)

            const audioUrl = `/audio/sk-SK-ViktoriaNeural/stops/${stop.slug}.mp3`;
            this.addToQueue(audioUrl)
        }
    }
    playExtra(extraId: string) {
        const extra = this.responseExtrasLookup[extraId]
        if (extra) {
            // play file `/audio/sk-SK-ViktoriaNeural/extras/${extra.slug}.mp3`
            console.log(`Playing extra ${extra.text_to_speech}`)
            const audioUrl = `/audio/sk-SK-ViktoriaNeural/extras/${extra.slug}.mp3`;
            this.addToQueue(audioUrl)
        }
    }
}

const tts = new Tts()
await tts.init()
export default tts


