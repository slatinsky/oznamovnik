import type { GtfsTrip } from "./gtfs/gtfs.svelte";

let resolvedTrip: GtfsTrip | null = $state(null)


function getState() {
    return {
		get resolvedTrip() {
			return resolvedTrip;
		},
        set resolvedTrip(value: GtfsTrip | null) {
            resolvedTrip = value;
            if (value == null) {
                window.history.pushState({}, '', '/');
            } else {
                window.history.pushState({}, '', `?tripId=${value.tripId}`);
            }
        }
    }
}

const sstate = getState()
export default sstate