<template>
  <div class="mediaC">
    <div>
      <img
        :src="
          PreviewMode
            ? media.coverDataURI
            : `./media/${getTitle(media.title)}.${media.coverExt}`
        "
        :alt="media.title"
      />
    </div>
    <div class="controls cardColor">
      <p class="title">{{ media.title }}</p>
      <div class="docDl">
        <p class="fileSize sub">PDF - {{ media.filesize }}</p>
        <a
          class="dlBtn"
          @click.prevent="downloadDocument"
          :style="{ backgroundColor: colors.buttonBg.color }"
          :href="PreviewMode ? '' : `./media/${getTitle(media.title)}.${media.ext}`"
          download
          target="_blank"
        >
          <div class="icon iconColor" v-html="getIcon('download')"></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { saveAs } from 'file-saver'

const props = defineProps<{
  media: Record<string, any>
  type: string
  colors: Record<string, { color: string }>
  PreviewMode: boolean
}>()

const { getIcon } = useIcons()

function getTitle(e: string) {
  return e.toLowerCase().split(' ').join('_')
}

function downloadDocument() {
  saveAs(window.URL.createObjectURL(props.media.file), `${props.media.title}.pdf`)
}
</script>
