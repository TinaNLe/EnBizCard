<template>
  <div class="flex flex-col w-full mt-6 bg-gray-800 rounded">
    <div class="flex justify-between">
      <div class="flex items-center w-full">
        <div class="p-1 shrink-0 focus:outline-none drag cursor-move" tabindex="-1">
          <div class="w-6 h-6" v-html="getIcon('drag')"></div>
        </div>
        <div class="w-full">
          <input
            class="px-4 w-full h-12 bg-transparent placeholder-gray-600 transition-colors duration-200 border-b border-black focus:outline-none focus:border-gray-500 hover:border-gray-500"
            type="text"
            name="section title"
            placeholder="Section title"
            v-model="featured[index].title"
            autocapitalize="words"
            title="Type your own section title"
          />
        </div>
      </div>
      <button
        class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="featured.splice(index, 1)"
        aria-label="Remove section"
        title="Remove section"
      >
        <div class="w-6 h-6" v-html="getIcon('x')"></div>
      </button>
    </div>

    <draggable
      group="featured"
      :list="featured[index].content"
      class="mt-4"
      handle=".drag"
      :animation="1"
      ghost-class="ghost"
      item-key="name"
    >
      <template #item="{ element: item, index: i }">
        <div>
          <div class="flex items-center mt-2" v-if="item.contentType === 'media'">
            <button class="p-1 shrink-0 focus:outline-none drag cursor-move" tabindex="-1">
              <div class="w-6 h-6" v-html="getIcon('drag')"></div>
            </button>
            <img
              class="w-12 h-12 rounded-l object-contain shrink-0 bg-gray-700"
              v-if="item.type === 'image' ? item.dataURI : item.coverDataURI ? item.coverDataURI : false"
              :src="item.type === 'image' ? item.dataURI : item.coverDataURI"
              :alt="item.title"
            />
            <a
              v-else
              class="w-12 h-12 bg-gray-900 flex items-center justify-center text-center text-xs rounded-l shrink-0 leading-none select-none cursor-pointer"
              target="_blank"
              href="https://duckduckgo.com/?q=Add+ID3+tags+to+mp3+file"
            >
              {{ item.info }}
            </a>
            <div class="w-full">
              <input
                class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded-r border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
                type="text"
                aria-label="Media title"
                autocapitalize="words"
                title="Media title"
                v-model="featured[index].content[i].title"
                placeholder="Media title"
              />
            </div>
            <button
              class="p-1 m-2 self-end shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
              @click="removeItem(i)"
              aria-label="Remove media"
              title="Remove media"
            >
              <div class="w-6 h-6" v-html="getIcon('x')"></div>
            </button>
          </div>
          <ProductCard
            v-else-if="item.contentType === 'product'"
            :featured="featured"
            :item="item"
            :index="index"
            :i="i"
            :resizeImage="resizeImage"
            :showAlert="showAlert"
          />
          <div class="flex items-center mt-2" v-else-if="item.contentType === 'text'">
            <button class="p-1 shrink-0 focus:outline-none drag cursor-move" tabindex="-1">
              <div class="w-6 h-6" v-html="getIcon('drag')"></div>
            </button>
            <div class="w-full">
              <textarea
                class="block px-4 py-3 w-full bg-black rounded border border-transparent placeholder-gray-600 transition-colors duration-200 focus:outline-none focus:border-gray-500 resize-none hover:border-gray-500"
                ref="textRef"
                aria-label="Enter text here"
                title="Enter text here"
                v-model="featured[index].content[i].value"
                placeholder="Enter text here"
                rows="5"
              ></textarea>
            </div>
            <button
              class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
              @click="removeItem(i)"
              aria-label="Remove text"
              title="Remove text"
            >
              <div class="w-6 h-6" v-html="getIcon('x')"></div>
            </button>
          </div>
          <div class="flex items-center mt-2" v-else>
            <button class="p-1 shrink-0 focus:outline-none drag cursor-move" tabindex="-1">
              <div class="w-6 h-6" v-html="getIcon('drag')"></div>
            </button>
            <div class="w-full">
              <input
                class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
                ref="linkRef"
                type="text"
                aria-label="Paste embed code here"
                title="Paste embed code here"
                v-model="featured[index].content[i]"
                placeholder="Paste embed code here"
              />
            </div>
            <button
              class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
              @click="removeItem(i)"
              aria-label="Remove field"
              title="Remove field"
            >
              <div class="w-6 h-6" v-html="getIcon('x')"></div>
            </button>
          </div>
        </div>
      </template>
    </draggable>

    <div
      class="grid grid-flow-row grid-cols-1 xs:grid-cols-2 gap-2 w-full p-2"
      :class="{ 'mt-4': hasContent }"
    >
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="attachMedia"
        aria-label="Add media"
        :class="dragOver ? 'bg-gray-900 outline-white' : 'bg-gray-700 border-none'"
        @drop.prevent="fileLoaded($event as DragEvent, true)"
        @dragleave.prevent.self="dragOver = false"
        @dragover.prevent.self="dragOver = true"
      >
        <input
          ref="importRef"
          type="file"
          :accept="mimetypes"
          v-show="false"
          @change="fileLoaded($event as Event, false)"
          @click="($event.target as HTMLInputElement).value = ''"
        />
        <div class="w-6 h-6 mr-3" v-html="getIcon('file')"></div>
        <p class="leading-none">Add media</p>
      </button>
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="addLink"
        aria-label="Embed media"
      >
        <div class="w-6 h-6 mr-3" v-html="getIcon('code')"></div>
        <p class="leading-none">Embed media</p>
      </button>
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="addProduct"
        aria-label="Add product"
      >
        <div class="w-6 h-6 mr-3" v-html="getIcon('product')"></div>
        <p class="leading-none">Add product</p>
      </button>
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="addText"
        aria-label="Add text"
      >
        <div class="w-6 h-6 mr-3" v-html="getIcon('text')"></div>
        <p class="leading-none text-left">Add text</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { convertFileToBuffer } from 'id3-parser/lib/universal/helpers'
import { parse } from 'id3-parser'

const props = defineProps<{
  featured: Array<Record<string, any>>
  mimetypes: string
  index: number
  resizeImage: (type: string, mime: string, idx1: number, idx2: number) => void
  showAlert: (msg: string) => void
}>()

const { getIcon } = useIcons()
const dragOver = ref(false)
const importRef = ref<HTMLInputElement | null>(null)
const linkRef = ref<HTMLInputElement | null>(null)
const textRef = ref<HTMLTextAreaElement | null>(null)

// pdfjs loaded lazily on client only — uses build/pdf.js (the CJS bundle entry)
let pdfjs: any = null
onMounted(async () => {
  const mod = await import('~/assets/scripts/pdfjs-dist/build/pdf.js' as any)
  pdfjs = mod.default || mod
  // Disable the worker entirely so we run in single-threaded mode
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = ''
  }
  pdfjs.disableWorker = true
  pdfjs.workerSrc = false
})

const hasContent = computed(() => props.featured[props.index].content.length > 0)

function mediaType(t: string) {
  if (t === 'image/jpeg' || t === 'image/png') return 'image'
  if (t === 'audio/mpeg') return 'music'
  if (t === 'video/mp4' || t === 'video/webm') return 'video'
  if (t === 'application/pdf') return 'document'
  return null
}

function attachMedia() {
  importRef.value?.click()
}

function addLink() {
  props.featured[props.index].content.push('')
  nextTick(() => linkRef.value?.focus())
}

function addProduct() {
  props.featured[props.index].content.push({
    image: null, title: null, description: null, price: null, label: null, link: null, contentType: 'product',
  })
}

function addText() {
  props.featured[props.index].content.push({ contentType: 'text', value: null })
  nextTick(() => textRef.value?.focus())
}

function fileLoaded(e: Event | DragEvent, dropped: boolean) {
  const files = dropped
    ? (e as DragEvent).dataTransfer?.files
    : (e as Event & { target: HTMLInputElement }).target.files

  if (!files?.length) { dragOver.value = false; return }

  const file = files[0]
  dragOver.value = false
  const mimetype = file.type
  const type = mediaType(mimetype)

  switch (type) {
    case 'image': imageLoaded(file, type, mimetype); break
    case 'music': musicLoaded(file, type); break
    case 'video': videoLoaded(file, type); break
    case 'document': documentLoaded(file, type); break
    default:
      props.showAlert('Unsupported file format.\n\nOnly jpeg, png, mp3, mp4, webm and pdf files can be attached.')
  }
}

function getFileName(file: File) {
  return file.name.replace(/(?:\.([^.]+))?$/, '')
}

function removeItem(i: number) {
  props.featured[props.index].content.splice(i, 1)
}

function imageLoaded(file: File, type: string, mime: string) {
  const title = getFileName(file)
  const reader = new FileReader()
  reader.onload = (f) => {
    const dataURI = f.target!.result as string
    const ext = dataURI.split(',')[0].split(':')[1].split('/')[1].match(/^\w+/g)![0]
    props.featured[props.index].content.push({ name: file.name, title, dataURI, file, type, contentType: 'media', ext, mime })
    props.resizeImage(type, mime, props.index, props.featured[props.index].content.length - 1)
  }
  reader.readAsDataURL(file)
}

function musicLoaded(file: File, type: string) {
  extractTags(file, type).catch(() => {})
}

async function extractTags(file: File, type: string) {
  const buffer = await convertFileToBuffer(file)
  const tag = await parse(buffer as any)
  if (tag && tag.image) {
    const cover = new Blob([new Uint8Array((tag.image as any).data)])
    const coverDataURI = URL.createObjectURL(cover)
    props.featured[props.index].content.push({
      name: file.name, cover, coverDataURI, coverExt: 'jpeg',
      title: tag.title, artist: tag.artist, album: tag.album,
      dataURI: URL.createObjectURL(file), type, contentType: 'media', file, ext: 'mp3',
    })
    props.resizeImage(type, 'image/jpeg', props.index, props.featured[props.index].content.length - 1)
  } else {
    props.featured[props.index].content.push({
      name: file.name,
      title: tag?.title || getFileName(file),
      artist: (tag as any)?.artist, album: (tag as any)?.album,
      dataURI: URL.createObjectURL(file), type, contentType: 'media', file, ext: 'mp3',
      info: tag ? 'No Thumb' : 'No ID3 Tag',
    })
  }
}

function videoLoaded(file: File, type: string) {
  const title = getFileName(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const video = document.createElement('video')
  let dataURI = ''
  const maxSize = 80
  const reader = new FileReader()

  const videoProcessor = () => {
    let { videoWidth: w, videoHeight: h } = video
    if (w > maxSize) { h *= maxSize / w; w = maxSize }
    if (h > maxSize) { w *= maxSize / h; h = maxSize }
    canvas.width = w; canvas.height = h
    ctx.drawImage(video, 0, 0, w, h)
    const coverDataURI = canvas.toDataURL('image/jpeg', 0.8)
    props.featured[props.index].content.push({
      name: file.name, coverDataURI, coverExt: 'jpeg', dataURI, file, title, type, contentType: 'media', ext: 'mp4',
    })
  }

  const uA = navigator.userAgent.match(/firefox|android/gi)
  if (uA && uA.length === 2) video.addEventListener('loadstart', videoProcessor)
  else video.addEventListener('seeked', videoProcessor)

  reader.onload = (f) => {
    const blob = new Blob([f.target!.result as ArrayBuffer], { type: 'video/mp4' })
    dataURI = URL.createObjectURL(blob)
    video.src = dataURI + '#t=0.2'
  }
  reader.readAsArrayBuffer(file)
}

function dataURIToBinary(dataURI: string) {
  const base64 = dataURI.substring(dataURI.indexOf(';base64,') + 8)
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function formatBytes(a: number, b = 2) {
  if (a === 0) return '0 Bytes'
  const d = Math.floor(Math.log(a) / Math.log(1024))
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(b < 0 ? 0 : b))} ${['Bytes','KB','MB','GB','TB'][d]}`
}

function documentLoaded(file: File, type: string) {
  if (!pdfjs) { props.showAlert('PDF support not ready yet, try again.'); return }
  const filesize = formatBytes(file.size)
  const title = getFileName(file)
  const reader = new FileReader()
  reader.onload = (f) => {
    const data = dataURIToBinary(f.target!.result as string)
    pdfjs.getDocument(data).promise.then((pdf: any) => {
      pdf.getPage(1).then((page: any) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        let scale = 1
        const vp = page.getViewport({ scale })
        let { width: w, height: h } = vp
        const maxSize = 1296
        if (w > maxSize) { h *= maxSize / w; w = maxSize }
        if (h > maxSize) { w *= maxSize / h; h = maxSize }
        canvas.width = w; canvas.height = h
        page.render({ canvasContext: ctx, viewport: vp }).promise.then(() => {
          const coverDataURI = canvas.toDataURL('image/jpeg', 0.8)
          const cover = new Blob([dataURIToBinary(coverDataURI)], { type: 'image/jpeg' })
          props.featured[props.index].content.push({
            name: file.name, cover, coverDataURI, coverExt: 'jpeg', file, filesize, title, type, contentType: 'media', ext: 'pdf',
          })
        })
      })
    })
  }
  reader.readAsDataURL(file)
}
</script>
