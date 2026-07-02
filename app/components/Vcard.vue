<template>
  <pre v-show="false" ref="elRef">
BEGIN:VCARD
VERSION:3.0
N:{{ getSplitName }}
FN:{{ getFullname }}
ORG:{{ props.vCard.org }}
ADR;TYPE=WORK:{{ props.vCard.addr }}
TITLE:{{ props.vCard.title }}
TEL;TYPE=CELL:{{ props.vCard.cell }}
TEL;TYPE=WORK:{{ props.vCard.work }}
TEL;TYPE=HOME:{{ props.vCard.home }}
TEL;TYPE=MSG:{{ props.vCard.sms }}
EMAIL;TYPE=WORK:{{ props.vCard.email }}
URL;TYPE=Digital Business Card:{{ props.vCard.hostedURL }}
URL:{{ props.vCard.website }}
{{ getURLs }}
KEY;TYPE=PGP;ENCODING=b:{{ props.vCard.key }}
NOTE:{{ props.vCard.note }}
{{ getPhoto }}
UID:{{ props.vCard.uid }}
END:VCARD</pre>
</template>

<script setup lang="ts">
interface VCardData {
  fn: string | null
  ln: string | null
  title: string | null
  org: string | null
  addr: string | null
  cell: string | null
  work: string | null
  home: string | null
  sms: string | null
  email: string | null
  hostedURL: string | null
  website: string | null
  urls: Array<{ title: string; url: string }>
  key: string | null
  note: string | null
  photo: { type: string; b64: string } | null
  uid: string
}

const props = defineProps<{ vCard: VCardData }>()
const elRef = ref<HTMLElement | null>(null)

// Expose as 'vCard' so index.vue can access it as vCardRef.value.vCard.innerText
defineExpose({ vCard: elRef })

const getURLs = computed(() =>
  props.vCard.urls.map((e) => `URL;TYPE=${e.title}:${e.url}`).join('\n'),
)
const getPhoto = computed(() => {
  if (!props.vCard.photo) return ''
  return `PHOTO;ENCODING=b;TYPE=${props.vCard.photo.type}:${props.vCard.photo.b64}`
})
const getSplitName = computed(() => {
  const fn = props.vCard.fn
  const ln = props.vCard.ln
  return `${ln ? ln : ''};${fn ? fn : ''};;;`
})
const getFullname = computed(() => {
  const fn = props.vCard.fn
  const ln = props.vCard.ln
  return (fn || '') + (ln || '') ? `${fn || ''}${ln ? ' ' + ln : ''}` : null
})
</script>
