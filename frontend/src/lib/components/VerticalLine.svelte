<script lang="ts">
    interface MyProps {
        color: string;
        isEnd: boolean;
        isAlmostEnd: boolean;
        isRequestStop: boolean;
    }
    let { color, isEnd, isAlmostEnd, isRequestStop }: MyProps = $props();
</script>

<div class="vertical-line">
    {#if isEnd}
        <div class="end-overlay-bottom" style={`background-color: ${color}`}></div>
        <div class="end-overlay" style={`background-color: ${color};top: 1svh`}></div>
        <div class="end-overlay" style={`background-color: ${color};top: 3svh`}></div>
        <div class="end-overlay" style={`background-color: ${color};top: 5svh`}></div>
    {/if}
    <div class="vertical-dot-outer"></div>
    <div class="vertical-dot-inner" style={`background-color: ${color}`}></div>
    {#if isEnd}
        <div class="vertical-dot-innerinner"></div>
    {/if}

    {#if !isEnd && !isAlmostEnd}
        <svg class="chevron" style={`color: ${color}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            ><path
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.59 8.590L12 13.17L7.41 8.590L6 10L12 16L18 10L16.59 8.590Z"
            /></svg
        >
    {/if}

    {#if isRequestStop}
        <svg class="request-stop" viewBox="0 0 199 199" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.8337 106.302C29.5025 100.636 37.8469 100.126 43.5157 105.792L59.7183 121.985C63.9361 126.197 69.0192 126.206 71.9863 122.705C73.9518 120.386 73.176 113.232 72.6253 108.694L64.4993 41.9012C63.7737 35.9339 68.0246 30.1691 73.9946 29.4438C79.9638 28.7182 85.3912 33.3068 86.1176 39.273L95.0808 91.7347C95.5491 93.0399 96.5539 93.2653 96.667 91.5085L99.7176 23.3203C99.7176 17.3095 104.592 12.4375 110.606 12.4375C116.62 12.4375 121.495 17.3095 121.495 23.3203L121.709 92.0188C121.652 92.8117 122.333 93.0387 122.455 92.1331L132.142 38.5084C133.211 32.5932 138.875 28.3241 144.793 29.3929C150.711 30.461 154.641 36.4617 153.573 42.3757L144.947 105.129C144.938 106.245 145.313 106.883 145.844 105.452L158.713 71.0477C160.726 65.3839 166.951 62.0829 172.618 64.0947C178.285 66.1069 181.247 72.6692 179.234 78.3322L156.675 152.034C156.557 152.441 156.433 152.844 156.305 153.246L156.258 153.398C156.253 153.41 156.248 153.42 156.244 153.432C149.997 172.661 131.927 186.562 110.606 186.562C96.9569 186.562 82.7801 181.752 71.9882 173.475L71.9871 173.474C60.3308 166.458 22.9868 126.31 22.9868 126.31C17.3173 120.645 18.1642 111.969 23.8337 106.302Z" fill="currentColor"/>
        </svg>
    {/if}
</div>


<style>
    .vertical-line {
        width: 3svh;
        height: 100%;
        background-color: white;

        position: relative;

        .vertical-dot-outer {
            height: 6svh;
            aspect-ratio: 1 / 1;
            border-radius: 50%;
            background-color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .vertical-dot-inner {
            height: 4.7svh;
            aspect-ratio: 1 / 1;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .vertical-dot-innerinner {
            height: 3.5svh;
            aspect-ratio: 1 / 1;
            border-radius: 50%;
            background-color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .request-stop {
            height: 3.9svh;
            aspect-ratio: 1 / 1;
            position: absolute;
            bottom: 50%;
            left: 50%;
            transform: translate(-50%, 50%);
            color: white;
        }

        .chevron {
            height: 7.5svh;
            aspect-ratio: 1 / 1;
            position: absolute;
            bottom: -1.5svh;
            left: 50%;
            transform: translate(-50%, 0);
        }

        .end-overlay {
            width: 5svh;
            height: 1.2svh;
            position: absolute;
            top: .5svh;
            left: 50%;
            transform: translate(-50%, 0);
        }

        .end-overlay-bottom {
            width: 5svh;
            height: 50%;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translate(-50%, 0);
        }


    }
</style>