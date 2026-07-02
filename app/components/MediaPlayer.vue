<template>
  <div class="mediaC">
    <video
      v-show="type === 'video'"
      controlsList="nodownload nofullscreen noremoteplayback"
      @timeupdate="updateSeek"
      disablePictureInPicture
      ref="mediaSource"
      class="source"
      :style="{ pointerEvents: PreviewMode ? 'none' : 'auto' }"
      :controls="!PreviewMode"
      preload="metadata"
    >
      <source
        :src="
          PreviewMode
            ? media.dataURI + '#t=0.2'
            : `./media/${getTitle(media.title)}.${media.ext}`
        "
      />
    </video>
    <img
      v-if="type === 'music' && media.coverDataURI"
      :src="
        PreviewMode
          ? media.coverDataURI
          : `./media/${getTitle(media.title)}.${media.coverExt}`
      "
      alt="cover"
    />
    <div class="controls cardColor">
      <p class="title">{{ media.title }}</p>
      <p class="sub" v-if="media.artist">
        <span>{{ media.artist }}</span>
        <span v-if="media.album"> - {{ media.album }}</span>
      </p>
      <div
        class="pCtrl"
        ref="pCtrl"
        :style="{ display: PreviewMode ? 'flex' : 'none' }"
      >
        <output class="currentTime sub" ref="bubble">00:00</output>
        <a
          class="playPause"
          :style="{ backgroundColor: colors.buttonBg.color }"
          @click="togglePlay(mediaSource)"
        >
          <div class="icon play iconColor" ref="play" v-html="getIcon('play')"></div>
          <div class="icon pause iconColor" ref="pause" v-html="getIcon('pause')"></div>
        </a>
        <input
          class="seekBar seekbarColor"
          @change="setProgress"
          ref="seekbar"
          type="range"
          value="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  media: Record<string, any>
  type: string
  colors: Record<string, { color: string }>
  PreviewMode: boolean
  togglePlay: (ref: HTMLVideoElement) => void
}>()

const { getIcon } = useIcons()

const mediaSource = ref<HTMLVideoElement | null>(null)
const pCtrl = ref<HTMLElement | null>(null)
const bubble = ref<HTMLOutputElement | null>(null)
const seekbar = ref<HTMLInputElement | null>(null)
const play = ref<HTMLElement | null>(null)
const pause = ref<HTMLElement | null>(null)

defineExpose({ mediaSource, play, pause })

function getTitle(e: string) {
  return e.toLowerCase().split(' ').join('_')
}

function setProgress(e: Event) {
  const src = mediaSource.value
  if (!src) return
  src.currentTime = src.duration * (Number((e.target as HTMLInputElement).value) / 100)
}

function updateSeek() {
  const src = mediaSource.value
  if (!src || !seekbar.value || !bubble.value) return
  const timenow = src.currentTime
  const value = (100 / src.duration) * timenow
  seekbar.value.value = String(value)

  let m = Math.floor(timenow / 60)
  let s = Math.floor(timenow % 60)
  bubble.value.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  if (value >= 100) {
    seekbar.value.value = '0'
    if (play.value) play.value.style.display = 'block'
    if (pause.value) pause.value.style.display = 'none'
  }
}

onMounted(() => {
  if (pCtrl.value) pCtrl.value.style.display = 'flex'
})
</script>
