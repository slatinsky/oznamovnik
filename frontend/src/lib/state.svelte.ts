let resolvedTrip = $state(null)


function getState() {
    return {
		get resolvedTrip() {
			return resolvedTrip;
		},
        set resolvedTrip(value) {
            resolvedTrip = value;
        }
    }
}

const sstate = getState()
export default sstate