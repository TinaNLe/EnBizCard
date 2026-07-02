<template>
  <div class="flex mt-6">
    <transition name="list">
      <Cropper
        v-if="showCropper"
        :src="tempURL!"
        @closeCropper="closeCropper"
        :content="content"
        :mime="mime!"
        :type="filetype!"
        :resizeImage="resizeImage"
      />
    </transition>
    <div class="flex flex-wrap items-center">
      <img
        class="w-12 h-12 rounded object-contain"
        v-if="imageAttached"
        :src="content[type].url"
        :title="
          type === 'logo'
            ? 'Brand logo'
            : type === 'photo'
            ? `Card holder's photo`
            : 'Cover image'
        "
      />
      <button
        v-if="!imageAttached"
        class="p-3 rounded bg-gray-700 cursor-pointer hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="attachFile(null, type, false)"
        :class="dragOver ? 'bg-gray-900 outline-white' : 'bg-gray-700 border-none'"
        :aria-label="label"
        @drop.prevent="attachFile($event as DragEvent, type, true)"
        @dragleave.prevent.self="dragOver = false"
        @dragover.prevent.self="dragOver = true"
      >
        <input
          :ref="(el) => (importRef = el as HTMLInputElement)"
          type="file"
          :accept="`.png,.jpg,.jpeg,.gif,.webp${type === 'logo' || type === 'cover' ? ',.svg' : ''}`"
          v-show="false"
          @change="fileLoaded($event as Event, type, false)"
          @click="($event.target as HTMLInputElement).files && (($event.target as HTMLInputElement).value = '')"
        />
        <div
          class="w-6 h-6 pointer-events-none"
          v-html="getIcon('add')"
        ></div>
      </button>
      <p v-if="!imageAttached" class="ml-3 leading-none">
        {{ label }}<span class="text-sm text-gray-400"><br />{{ description }}</span>
      </p>
      <button
        v-else
        class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="content[type].url = null"
        :aria-label="`Remove ${type}`"
        :title="`Remove ${type}`"
      >
        <div class="w-6 h-6" v-html="getIcon('x')"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  type: string
  label: string
  description?: string
  resizeImage: (type: string, mime: string) => void
  showAlert: (msg: string) => void
}>()

const { getIcon } = useIcons()

const dragOver = ref(false)
const showCropper = ref(false)
const tempURL = ref<string | null>(null)
const mime = ref<string | null>(null)
const filetype = ref<string | null>(null)
let importRef: HTMLInputElement | null = null

const imageAttached = computed(() => !!props.content[props.type].url)

function closeCropper() {
  showCropper.value = false
}

function attachFile(e: DragEvent | null, type: string, dropped: boolean) {
  if (dropped && e) {
    fileLoaded(e, type, true)
    dragOver.value = false
  } else {
    importRef?.click()
  }
}

function fileLoaded(e: Event | DragEvent, type: string, dropped: boolean) {
  const files = dropped
    ? (e as DragEvent).dataTransfer?.files
    : (e as Event & { target: HTMLInputElement }).target.files

  if (!files?.length) return

  const file = files[0]
  const fileMime = file.type

  if (
    (type === 'logo' || type === 'cover') &&
    fileMime.match(/image\/(svg\+xml|png|jpeg|gif|webp)/)
  ) {
    imageLoaded(file, type, fileMime)
  } else if (fileMime.match(/image\/(png|jpeg|gif|webp)/)) {
    imageLoaded(file, type, fileMime)
  } else {
    props.showAlert(
      type === 'logo' || type === 'cover'
        ? 'Unsupported file format.\nOnly jpeg, png, webp, gif and svg file can be attached.'
        : 'Unsupported file format.\nOnly jpeg, png, webp and gif file can be attached.',
    )
  }
}

function imageLoaded(file: File, type: string, fileMime: string) {
  const reader = new FileReader()
  reader.onload = (f) => {
    const dataURI = f.target!.result as string
    const ext = dataURI.split(',')[0].split(':')[1].split('/')[1].match(/^\w+/g)![0]
    if (type === 'logo' || fileMime.match(/svg|gif|webp/)) {
      props.content[type] = { url: dataURI, blob: file, ext, mime: fileMime, resized: file }
      if (!fileMime.match(/svg|gif|webp/)) props.resizeImage(type, fileMime)
    } else {
      props.content[type].ext = ext
      filetype.value = type
      mime.value = fileMime
      tempURL.value = dataURI
      showCropper.value = true
    }
  }
  reader.readAsDataURL(file)
}
</script>
