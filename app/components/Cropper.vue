<template>
  <div
    id="notificationContainer"
    class="flex justify-center fixed top-0 left-0 right-0 bottom-0 items-center z-30 bg-black bg-opacity-80"
  >
    <div
      class="flex flex-col items-center notification content bg-gray-800 text-gray-100 rounded relative z-50 max-w-sm mx-4 p-2"
    >
      <div class="mb-2 max-w-sm max-h-80">
        <img ref="imageRef" :src="src" />
      </div>
      <div class="flex">
        <button
          class="p-3 font-extrabold rounded tracking-wide focus:outline-none select-none bg-gray-700 mr-2 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200"
          @click="emit('closeCropper')"
        >
          Cancel
        </button>
        <button
          class="font-extrabold leading-none tracking-wide select-none shrink-0 p-3 text-white bg-emerald-600 rounded hover:bg-emerald-500 focus:bg-emerald-500 transition-colors duration-200 focus:outline-none"
          @click="cropPhoto"
        >
          Crop photo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CropperJS from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps<{
  src: string
  mime: string
  content: Record<string, any>
  resizeImage: (type: string, mime: string) => void
  type: string
}>()

const emit = defineEmits<{ (e: 'closeCropper'): void }>()

const imageRef = ref<HTMLImageElement | null>(null)
let cropper: CropperJS | null = null

function cropPhoto() {
  if (!cropper) return
  const canvas = cropper.getCroppedCanvas()
  const url = canvas.toDataURL(props.mime)
  props.content[props.type].url = url
  props.content[props.type].mime = props.mime
  canvas.toBlob(
    (blob) => {
      if (!blob) return
      props.content[props.type].blob = new File([blob], 'photo', {
        type: props.mime,
      })
      props.resizeImage(props.type, props.mime)
      emit('closeCropper')
    },
    props.mime,
    0.8,
  )
}

onMounted(() => {
  if (!imageRef.value) return
  cropper = new CropperJS(imageRef.value, {
    zoomable: false,
    scalable: false,
    aspectRatio: props.type === 'photo' ? 1 : 3 / 2,
    autoCropArea: 1,
    responsive: true,
    viewMode: 2,
    highlight: false,
    rotatable: true,
  })
})

onBeforeUnmount(() => {
  cropper?.destroy()
})
</script>
