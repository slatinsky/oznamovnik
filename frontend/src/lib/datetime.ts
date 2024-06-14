import gtfs from "./gtfs/gtfs.svelte";

export function HHMMSSToSeconds(hhmmss: string) {
    const [hours, minutes, seconds] = hhmmss.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToHHMMSS(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${sec < 10 ? "0" : ""}${sec}`;
}

export function nowSeconds() {
    const now = gtfs.now();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}