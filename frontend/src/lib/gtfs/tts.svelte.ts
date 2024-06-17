
export interface TtsStop {
    stop_code: string
    stop_name: string
    slug: string
    text_to_speech: string
}

class Tts {
    responseStops: TtsStop[]
    responseStopsLookup: Record<string, TtsStop>

    constructor() {
        this.responseStops = []
        this.responseStopsLookup = {}  // stop_code -> TtsStop
    }
    
    async init() {
        const responseStopsResp = await fetch('/audio/sk-SK-ViktoriaNeural/stops.json')
        this.responseStops = await responseStopsResp.json()
        this.responseStopsLookup = {}
        for (const stop of this.responseStops) {
            this.responseStopsLookup[stop.stop_code] = stop
        }
    }

    playStop(stopCode: string) {
        const stop = this.responseStopsLookup[stopCode]
        if (stop) {
            // play file `/audio/sk-SK-ViktoriaNeural/stops/${stop.slug}.mp3`
            console.log(`Playing stop ${stop.stop_name}`)

            const audioUrl = `/audio/sk-SK-ViktoriaNeural/stops/${stop.slug}.mp3`;
            const audio = new Audio(audioUrl);
            audio.play();
        }
    }
}

const tts = new Tts()
await tts.init()
export default tts


