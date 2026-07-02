<template>
  <div class="overflow-y-scroll max-hd border-t-0 border-4 border-black bg-gray-900">
    <div :id="`Theme${theme}`">
      <html
        ref="htmlRef"
        lang="en"
        :style="{ backgroundColor: colors.logoBg.color }"
      >
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta v-if="!PreviewMode" name="robots" content="noindex, nofollow" />
          <meta name="author" content="EnBizCard - An Open-Source Digital Business Card Generator" />
          <meta name="url" content="https://enbizcard.vishnuraghav.com/" />
          <meta name="designer" content="Vishnu Raghav" />
          <meta property="og:title" :content="`${getFullname}'s Digital Business Card`" />
          <meta property="twitter:title" :content="`${getFullname}'s Digital Business Card`" />
          <!-- prettier-ignore -->
          <script>
            "http"==window.location.href.substr(0,4)&&"/"!=window.location.href.slice(-1)&&window.location.replace(window.location.href+"/");
          </script>

          <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;800&display=swap" rel="stylesheet" />
          <link v-if="getCssHref" :href="getCssHref" rel="stylesheet" />
          <title>{{ getFullname }}'s Digital Business Card</title>
          <style>
            #body{ font-family: 'Nunito', sans-serif; } input[type='range']::-moz-range-track { background: none; } input[type='range']::-moz-range-thumb { -moz-appearance: none; width: 1.5rem; height: 1.5rem; border-radius: {{theme === 1? '100%': '0.25rem'}}; border: none; background: {{colors.buttonBg.color}}; z-index: 3; cursor: pointer; } input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 1.5rem; height: 1.5rem; border-radius: {{theme === 1? '100%': '0.25rem'}}; border: none; background: {{colors.buttonBg.color}}; z-index: 3; cursor: pointer; } .closeColor{ {{hasLightBG('mainBg') ? 'filter:invert(1) ':''}} } .topAction { {{ hasLightBG('logoBg') ? 'filter:invert(1) ':''}}} .iconColor{ color:#eee; {{hasLightBG('buttonBg') ? 'filter:invert(1)' : null}} } .cardColor{ {{hasLightBG('cardBg') && 'color:#222 !important'}} } .textColor{ {{hasLightBG('mainBg') ? 'color:#222 !important' : 'color:#eee !important'}} } .seekbarColor{  {{`background:${colors.buttonBg.color}80 !important`}} }
          </style>
          <style v-if="theme === 3">
            #info{ border-left: 0.25rem dashed {{colors.buttonBg.color}} } .section{border-left: 0.25rem solid {{colors.buttonBg.color}}}
          </style>
          <style v-if="getCssHref">
            #body{
            {{genInfo.fontCss && getFontFamily}}
            }
          </style>
        </head>
        <body id="body">
          <div
            id="modal"
            ref="modalRef"
            :style="`backgroundColor: ${colors.mainBg.color}; visibility: hidden; top: 2rem; opacity: 0;`"
          >
            <a id="close" @click="closePublicKey()" class="closeColor">
              <div class="icon" v-html="getIcon('close')"></div>
            </a>
            <div id="keyView">
              <p class="textColor">Use my public key to send me encrypted messages</p>
              <a
                :href="!PreviewMode && `./${getFullname}'s public key.asc`"
                download
                target="_blank"
                id="dlKey"
                rel="noreferrer"
                @click.prevent.capture="downloadKey()"
                :style="{ backgroundColor: colors.buttonBg.color }"
                tabindex="-1"
              >
                <div class="icon iconColor" v-html="getIcon('download')"></div>
                <span class="iconColor">Download Key</span>
              </a>
            </div>
            <div id="copyView" ref="copyViewRef">
              <p class="textColor">Copy and send the URL to share my Business Card</p>
              <button id="copyURL" :style="{ backgroundColor: colors.buttonBg.color }">
                <div class="icon iconColor" v-html="getIcon('copy')"></div>
                <span class="iconColor">Copy URL</span>
              </button>
            </div>
            <div id="qrView" ref="qrViewRef" class="textColor">
              <div id="qr"></div>
              <h3>Scan the QR Code</h3>
              <p>to view my Business Card on another device</p>
            </div>
          </div>
          <header>
            <div id="topActions" :style="{ display: PreviewMode ? 'flex' : 'none' }">
              <div>
                <a id="share" @click.prevent.capture="sharingAlert()">
                  <div class="icon topAction" v-html="getIcon('share')"></div>
                </a>
                <a id="showQR" @click.prevent.capture="sharingAlert()">
                  <div class="icon topAction" v-html="getIcon('qrcode')"></div>
                </a>
              </div>
              <a v-if="pubKeyIsValid" id="showKey" @click.prevent.capture="showKey()">
                <div class="icon topAction" v-html="getIcon('key')"></div>
              </a>
            </div>
            <div class="headerImgC">
              <img
                id="cover"
                v-if="images.cover.url"
                :src="PreviewMode ? images.cover.url : `./cover.${images.cover.ext}`"
                alt="Background Pattern"
              />
              <img
                id="logo"
                v-if="images.logo.url"
                :src="PreviewMode ? images.logo.url : `./logo.${images.logo.ext}`"
                :style="{
                  margin: images.photo.url
                    ? images.cover.url ? '3rem 0 6rem' : '3rem 0 8rem'
                    : '3rem 0',
                }"
                alt="Logo"
              />
            </div>
          </header>
          <main
            :style="{
              backgroundColor: colors.mainBg.color,
              marginTop: hasOnlyProfilePic ? '5rem' : '0',
            }"
          >
            <img
              id="profilePhoto"
              v-if="images.photo.url"
              :src="PreviewMode ? images.photo.url : `./photo.${images.photo.ext}`"
              alt="Photo"
            />
            <div id="info" class="textColor">
              <p class="name">{{ getFullname }}</p>
              <p v-if="genInfo.pronouns" class="pronouns">({{ genInfo.pronouns }})</p>
              <p class="jobtitle">{{ genInfo.title }}</p>
              <p class="bizname">{{ genInfo.biz }}</p>
              <p class="bizaddr" v-if="genInfo.addr">{{ genInfo.addr }}</p>
            </div>
            <p class="sub textColor" v-if="genInfo.desc">{{ genInfo.desc }}</p>
            <a
              id="cta"
              rel="noreferrer"
              :href="!PreviewMode ? `${username}.vcf` : undefined"
              download
              target="_blank"
              :style="{ backgroundColor: colors.buttonBg.color }"
              @click.prevent="downloadVcard"
              aria-label="Save Contact"
            >
              <div class="icon iconColor" v-html="getIcon('add-user')"></div>
              <p class="iconColor">Save Contact</p>
            </a>
            <div class="actions">
              <div class="actionsC" v-for="(item, index) in primaryActions" :key="'pa' + index">
                <div class="actionBtn">
                  <a
                    :href="getHref(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :style="{ backgroundColor: colors.buttonBg.color }"
                    :aria-label="item.name"
                  >
                    <div class="icon iconColor" v-html="getIcon(item.icon)"></div>
                  </a>
                  <p class="textColor">
                    {{ item.name.substr(0, 1).toUpperCase() + item.name.slice(1) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="actions secondary">
              <div class="actionsC" v-for="(item, index) in secondaryActions" :key="'sa' + index">
                <div class="actionBtn secBtn">
                  <a
                    :href="getHref(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :style="{ background: item.color }"
                    :aria-label="item.name"
                  >
                    <div class="icon" v-html="getSVG(item)"></div>
                  </a>
                </div>
              </div>
            </div>
            <div class="featured" v-for="(item, index) in featured" :key="'fc' + index">
              <h2 class="section textColor" v-if="item.title">{{ item.title }}</h2>
              <div v-for="(item, i) in item.content" :key="i">
                <div
                  v-if="item.contentType === 'media'"
                  class="media"
                  :class="item.type"
                  :style="{ backgroundColor: colors.cardBg.color }"
                >
                  <div v-if="item.type === 'image'">
                    <img
                      v-if="item.dataURI"
                      :src="PreviewMode ? item.dataURI : `./media/${getTitle(item.title)}.${item.ext}`"
                      alt="Product image"
                    />
                    <div class="controls cardColor">
                      <p class="title">{{ item.title }}</p>
                    </div>
                  </div>
                  <MediaPlayer
                    v-if="item.type === 'music' || item.type === 'video'"
                    ref="mediaPlayerRef"
                    :media="item"
                    :type="item.type"
                    :colors="colors"
                    :togglePlay="togglePlay"
                    :PreviewMode="PreviewMode"
                  />
                  <DocumentDownloader
                    v-if="item.type === 'document'"
                    :media="item"
                    :type="item.type"
                    :colors="colors"
                    :PreviewMode="PreviewMode"
                  />
                </div>
                <ProductShowcase
                  v-else-if="item.contentType === 'product' && item.title"
                  :product="item"
                  :colors="colors"
                  :PreviewMode="PreviewMode"
                />
                <div
                  v-else-if="item.contentType === 'text' && item.value"
                  class="media"
                  :style="{ backgroundColor: colors.cardBg.color }"
                >
                  <p class="textC cardColor">{{ item.value }}</p>
                </div>
                <div
                  v-else-if="stripAttr(item)"
                  class="media embedded"
                  :style="{ backgroundColor: colors.cardBg.color }"
                >
                  <iframe :src="stripAttr(item)" frameborder="0" allowfullscreen></iframe>
                </div>
              </div>
            </div>
          </main>
          <footer
            v-if="footerCredit"
            :style="{ backgroundColor: colors.mainBg.color }"
            class="textColor"
          >
            Created with
            <a
              class="textColor"
              href="https://enbizcard.vishnuraghav.com/"
              target="_blank"
              rel="noopener noreferrer"
              >EnBizCard</a
            >
          </footer>
        </body>
      </html>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  username: string
  genInfo: Record<string, any>
  images: Record<string, any>
  featured: Array<Record<string, any>>
  colors: Record<string, { color: string }>
  primaryActions: Array<Record<string, any>>
  secondaryActions: Array<Record<string, any>>
  PreviewMode: boolean
  downloadVcard: () => void
  downloadKey: () => void
  footerCredit: boolean
  showAlert: (msg: string) => void
  hasLightBG: (key: string) => boolean
  pubKeyIsValid: boolean
}>()

const { theme } = useTheme()
const { getIcon, getSVG } = useIcons()

const htmlRef = ref<HTMLElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const copyViewRef = ref<HTMLElement | null>(null)
const qrViewRef = ref<HTMLElement | null>(null)
const mediaPlayerRef = ref<InstanceType<typeof import('./MediaPlayer.vue').default>[] | null>(null)

defineExpose({ html: htmlRef })

const getFullname = computed(() => {
  const fn = props.genInfo.fname
  const ln = props.genInfo.lname
  return (fn || '') + (ln || '') ? `${fn || ''}${ln ? ' ' + ln : ''}` : null
})

const hasOnlyProfilePic = computed(() =>
  !(props.images.cover.url || props.images.logo.url),
)

const getCssHref = computed(() => {
  if (!props.genInfo.fontLink) return false
  const html = new DOMParser().parseFromString(props.genInfo.fontLink, 'text/html')
  const link = Array.from(html.getElementsByTagName('link')).find(
    (e) => e.getAttribute('rel') === 'stylesheet',
  )
  return link ? link.getAttribute('href') : false
})

const getFontFamily = computed(() => {
  const css = props.genInfo.fontCss?.replace(/\s+/, '')
  if (!css) return ''
  const match = css.match(/^font-family[^;]*/)
  return match ? match[0] : ''
})

function getHref(e: Record<string, any>) {
  let value = e.value
  if (e.name === 'Viber' && value) {
    value = value.replace(/[\s\-()]/g, '').replace(/\+/, '%2B')
  }
  return e.href ? e.href + (value || e.value) + (e.hrefEnd || '') : value || e.value
}

function getTitle(e: string) {
  return e.toLowerCase().split(' ').join('_')
}

function stripAttr(val: any) {
  if (typeof val !== 'string') return null
  if (/<iframe(.*)\/iframe>/.test(val)) {
    const iframe = val.match(/<iframe(.*)\/iframe>/)![0]
    return iframe.match(/src="?([^"\s]+)"/)![1]
  } else if (/\/\/www\.instagram\.com\/embed\.js/.test(val)) {
    return `${val.match(/data-instgrm-permalink="(.*?)\/\?/)![1]}/embed/captioned`
  }
  return null
}

function toggleContainer(e: HTMLElement) {
  if (e.style.top === '2rem') {
    e.style.visibility = 'visible'
    e.style.top = '0px'
    e.style.opacity = '1'
  } else {
    e.style.top = '2rem'
    e.style.opacity = '0'
    setTimeout(() => { e.style.visibility = 'hidden' }, 200)
  }
}

function showKey() {
  if (!modalRef.value || !copyViewRef.value || !qrViewRef.value) return
  toggleContainer(modalRef.value)
  copyViewRef.value.style.display = 'none'
  qrViewRef.value.style.display = 'none'
}

function closePublicKey() {
  if (modalRef.value) toggleContainer(modalRef.value)
}

function sharingAlert() {
  props.showAlert(
    'You are able to share your business card after completing the hosting process.\n\nCheck out the <a class="underline font-extrabold text-emerald-600 hover:text-emerald-500 transition-colors duration-200" href="/demo" target="_blank">demo</a> to test the functionality.',
  )
}

function togglePlay(ref: HTMLVideoElement) {
  const players = mediaPlayerRef.value
  if (!players) return
  players.forEach((e: any) => {
    const src = e.mediaSource
    const play = e.play
    const pause = e.pause
    if (ref !== src) {
      src?.pause()
      if (play) play.style.display = 'block'
      if (pause) pause.style.display = 'none'
    } else {
      if (src?.paused) {
        src.play()
        if (play) play.style.display = 'none'
        if (pause) pause.style.display = 'block'
      } else {
        src?.pause()
        if (play) play.style.display = 'block'
        if (pause) pause.style.display = 'none'
      }
    }
  })
}
</script>

<style lang="scss">
#Theme1 {
  body { margin: 0 auto; width: 100%; padding: 0; max-width: 30rem; color: #222; position: relative; }
  p { line-height: 1.5; margin: 0; }
  h2, h3 { margin: 0; }
  .icon { width: 1.5rem; height: 1.5rem; }
  a { text-decoration: none; user-select: none; }
  #modal { display: flex; flex-direction: column; position: absolute; z-index: 1; width: 100%; bottom: 0; transition: top 0.2s ease-out, opacity 0.1s ease-out; transform: translateZ(0); }
  #close { align-self: end; padding: 1rem; cursor: pointer; line-height: 0; }
  #keyView, #copyView, #qrView { display: flex; flex-direction: column; align-items: center; margin: 0 1rem; text-align: center; p { margin: 2rem; text-align: center; } }
  #copyURL, #dlKey { display: flex; width: 100%; align-items: center; justify-content: center; border-radius: 5rem; padding: 1rem 1.5rem; border: none; outline: none; cursor: pointer; box-sizing: border-box; span { margin-left: 0.5rem; } }
  #qrView { h3 { margin: 2rem 2rem 0; } p { margin: 0.5rem 2rem 0; } }
  #qr { margin: 2rem; padding: 2rem; background: #fff; border-radius: 0.5rem; }
  header { display: flex; justify-content: flex-start; flex-direction: column; }
  .headerImgC { display: grid; grid-template-columns: auto; grid-template-rows: auto; overflow: hidden; }
  #cover { grid-column: 1; grid-row: 1; width: 100%; height: 20rem; object-position: top center; object-fit: cover; }
  #logo { max-height: 6rem; pointer-events: none; user-select: none; grid-column: 1; grid-row: 1; align-self: center; justify-self: center; }
  #topActions { flex-direction: row-reverse; justify-content: space-between; align-items: flex-start; & > div { display: flex; } a { padding: 1rem; cursor: pointer; line-height: 0; } }
  main { padding: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
  #profilePhoto { width: 10rem; height: 10rem; border-radius: 100%; box-sizing: content-box; pointer-events: none; user-select: none; margin-top: -6rem; }
  #info { display: flex; flex-direction: column; justify-content: center; align-items: center; margin-top: 1rem; line-height: 1.25; word-break: break-word; }
  .name { font-weight: bold; font-size: 1.5rem; margin: 0; }
  .pronouns { display: block; font-size: 0.9rem; opacity: 0.8; font-weight: normal; margin: 0 0 0.5rem; }
  .bizname { font-size: 0.9rem; margin: 0.5rem 0 0; opacity: 0.8; }
  .bizaddr { font-size: 0.8rem; opacity: 0.6; }
  .sub, .textC { font-size: 1rem; white-space: pre-line; line-height: 1.5; }
  .sub { font-size: 0.9rem; margin: 0.5rem 0 0; opacity: 0.8; }
  .textC { margin: 1rem; }
  #cta { color: #fff; display: flex; align-items: center; border-radius: 5rem; margin-top: 2rem; padding: 1rem 1.5rem; cursor: pointer; line-height: 0; width: 100%; justify-content: center; box-sizing: border-box; .icon { margin-right: 0.5rem; } p { margin: 0; } }
  .actions { width: 100%; margin-top: 2rem; display: flex; flex-wrap: wrap; justify-content: center; }
  .actionsC { width: 33.33%; }
  .actionBtn { padding: 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; a { border-radius: 100%; padding: 1rem; line-height: 0; } p { margin: 0.5rem 0 0; font-size: 0.9rem; } }
  .secBtn { padding: 1rem; }
  .featured { display: flex; flex-direction: column; justify-content: center; margin: 2rem 0 0; width: 100%; }
  .section { font-weight: bold; text-align: center; font-size: 1.3rem; padding: 1rem 0; }
  .media { overflow: hidden; border-radius: 1rem; margin-top: 1rem; img { display: block; pointer-events: none; user-select: none; width: 100%; } }
  .embedded { position: relative; padding-top: 100%; iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; } }
  .music, .video { width: 100%; }
  .mediaC { display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; }
  video { width: 100%; }
  .controls { padding: 1rem; font-size: 0.9rem; text-align: center; width: 100%; box-sizing: border-box; }
  .pCtrl, .docDl { display: none; flex-direction: column; align-items: center; width: 100%; }
  .docDl { display: flex; }
  .seekBar { width: 100%; height: 0.5rem; margin: 1.5rem 0 0.5rem; border-radius: 5rem; appearance: none; cursor: pointer; }
  .playPause, .dlBtn { margin: 1rem 0 0.5rem; padding: 1rem; border-radius: 5rem; line-height: 0; cursor: pointer; }
  .pause { display: none; }
  .title { font-size: 1rem; font-weight: bold; margin: 0; }
  .prodInfo .sub { margin: -1rem 0 0; }
  .price { margin: 1rem 0 0; font-size: 1rem; font-weight: bold; }
  .label { display: inline-block; font-size: 1rem; margin: 1rem 0 0.5rem; border-radius: 5rem; letter-spacing: 1px; padding: 1rem 1.5rem; p { margin: 0; } }
  footer { padding: 4rem 1rem 2rem; font-size: 0.9rem; text-align: center; a { text-decoration: underline; color: inherit; } }
}
#Theme2 {
  body { margin: 0 auto; width: 100%; padding: 0; max-width: 30rem; color: #222; position: relative; }
  p { line-height: 1.5; margin: 0; }
  h2, h3 { margin: 0; }
  .icon { width: 1.5rem; height: 1.5rem; }
  a { text-decoration: none; user-select: none; }
  #modal { display: flex; flex-direction: column; position: absolute; z-index: 1; width: 100%; bottom: 0; transition: top 0.2s ease-out, opacity 0.1s ease-out; transform: translateZ(0); }
  #close { align-self: end; padding: 1rem; cursor: pointer; line-height: 0; }
  #keyView, #copyView, #qrView { display: flex; flex-direction: column; align-items: center; margin: 0 1rem; text-align: center; p { margin: 2rem; } }
  #copyURL, #dlKey { display: flex; width: 100%; align-items: center; justify-content: center; border-radius: 0.5rem; padding: 1rem 1.5rem; border: none; outline: none; cursor: pointer; box-sizing: border-box; span { margin-left: 0.5rem; } }
  #qrView { h3 { margin: 2rem 2rem 0; } p { margin: 0.5rem 2rem 0; } }
  #qr { margin: 2rem; padding: 2rem; background: #fff; border-radius: 0.5rem; }
  header { display: flex; justify-content: flex-start; flex-direction: column; }
  .headerImgC { display: grid; grid-template-columns: auto; grid-template-rows: auto; height: 100%; overflow: hidden; }
  #cover { grid-column: 1; grid-row: 1; width: 100%; height: 20rem; object-position: top center; object-fit: cover; }
  #logo { max-height: 6rem; pointer-events: none; user-select: none; grid-column: 1; grid-row: 1; align-self: center; justify-self: center; }
  #topActions { flex-direction: row-reverse; justify-content: space-between; align-items: flex-start; & > div { display: flex; } a { padding: 1rem; cursor: pointer; line-height: 0; } }
  main { padding: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
  #profilePhoto { width: 10rem; height: 10rem; border-radius: 0.5rem; box-sizing: content-box; pointer-events: none; user-select: none; margin-top: -6rem; }
  #info { display: flex; flex-direction: column; justify-content: center; align-items: center; margin-top: 1rem; line-height: 1.25; word-break: break-word; }
  .name { font-weight: bold; font-size: 1.5rem; margin: 0; }
  .pronouns { display: block; font-size: 0.9rem; opacity: 0.8; font-weight: normal; margin: 0 0 0.5rem; }
  .bizname { font-size: 0.9rem; margin: 0.5rem 0 0 0; opacity: 0.8; }
  .bizaddr { font-size: 0.8rem; opacity: 0.6; }
  .sub, .textC { font-size: 1rem; white-space: pre-line; line-height: 1.5; }
  .sub { font-size: 0.9rem; margin: 0.5rem 0 0; opacity: 0.8; }
  .textC { margin: 1rem; }
  #cta {  color: #fff; display: flex; align-items: center; border-radius: 0.5rem; margin-top: 2rem; padding: 1rem 1.5rem; cursor: pointer; line-height: 0; width: 100%; justify-content: center; box-sizing: border-box; .icon { margin-right: 0.5rem; } p { margin: 0; } }
  .actions { width: 100%; margin-top: 2rem; display: flex; flex-wrap: wrap; justify-content: center; }
  .actionsC { width: 33.33%; }
  .actionBtn { padding: 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; a { border-radius: 0.5rem; padding: 1rem; line-height: 0; } p { margin: 0.5rem 0 0; font-size: 0.9rem; } }
  .secBtn { padding: 1rem; }
  .featured { display: flex; flex-direction: column; justify-content: center; margin: 2rem 0 0; width: 100%; }
  .section { font-weight: bold; text-align: center; font-size: 1.3rem; padding: 1rem 0; }
  .media { overflow: hidden; border-radius: 0.5rem; margin-top: 1rem; img { display: block; pointer-events: none; user-select: none; width: 100%; } }
  .embedded { position: relative; padding-top: 100%; iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; } }
  .music, .video { width: 100%; }
  .mediaC { display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; }
  video { width: 100%; }
  .controls { padding: 1rem; font-size: 0.9rem; text-align: center; width: 100%; box-sizing: border-box; }
  .pCtrl, .docDl { display: none; flex-direction: column; align-items: center; width: 100%; }
  .docDl { display: flex; }
  .seekBar { width: 100%; height: 0.5rem; margin: 1.5rem 0 0.5rem; border-radius: 0.5rem; appearance: none; cursor: pointer; }
  .playPause, .dlBtn { margin: 1rem 0 0.5rem; padding: 1rem; border-radius: 0.5rem; line-height: 0; cursor: pointer; }
  .pause { display: none; }
  .title { font-size: 1rem; font-weight: bold; margin: 0; }
  .prodInfo .sub { margin: -1rem 0 0; }
  .price { margin: 1rem 0 0; font-size: 1rem; font-weight: bold; }
  .label { display: inline-block; font-size: 1rem; margin: 1rem 0 0.5rem; border-radius: 0.5rem; letter-spacing: 1px; padding: 1rem 1.5rem; p { margin: 0; } }
  footer { padding: 4rem 1rem 2rem; font-size: 0.9rem; text-align: center; a { text-decoration: underline; color: inherit; } }
}
#Theme3 {
  body { margin: 0 auto; width: 100%; padding: 0; max-width: 30rem; color: #222; position: relative; }
  p { line-height: 1.5; margin: 0; }
  h2, h3 { margin: 0; }
  .icon { width: 1.5rem; height: 1.5rem; }
  a { text-decoration: none; user-select: none; }
  #modal { display: flex; flex-direction: column; position: absolute; z-index: 1; width: 100%; bottom: 0; transition: top 0.2s ease-out, opacity 0.1s ease-out; transform: translateZ(0); }
  #close { align-self: end; padding: 1rem; cursor: pointer; line-height: 0; }
  #keyView, #copyView, #qrView { display: flex; flex-direction: column; align-items: center; margin: 0 1rem; text-align: center; p { margin: 2rem; } }
  #copyURL, #dlKey { display: flex; width: 100%; align-items: center; justify-content: center; border-radius: 0.5rem; padding: 1rem 1.5rem; border: none; outline: none; cursor: pointer; box-sizing: border-box; span { margin-left: 0.5rem; } }
  #qrView { h3 { margin: 2rem 2rem 0; } p { margin: 0.5rem 2rem 0; } }
  #qr { margin: 2rem; padding: 2rem; background: #fff; border-radius: 0.5rem; }
  header { display: flex; justify-content: flex-start; flex-direction: column; }
  .headerImgC { display: grid; grid-template-columns: auto; grid-template-rows: auto; height: 100%; overflow: hidden; }
  #cover { grid-column: 1; grid-row: 1; width: 100%; height: 20rem; object-position: top center; object-fit: cover; }
  #logo { max-height: 6rem; pointer-events: none; user-select: none; grid-column: 1; grid-row: 1; align-self: center; justify-self: center; }
  #topActions { flex-direction: row-reverse; justify-content: space-between; align-items: flex-start; & > div { display: flex; } a { padding: 1rem; cursor: pointer; line-height: 0; } }
  main { padding: 1rem; display: flex; flex-direction: column; align-items: flex-start; }
  #profilePhoto { width: 10rem; height: 10rem; border-radius: 0.5rem; box-sizing: content-box; pointer-events: none; user-select: none; margin-top: -6rem; }
  #info { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; margin-top: 1rem; line-height: 1.25; word-break: break-word; padding: 0.25rem 1rem; }
  .name { font-weight: bold; font-size: 1.5rem; margin: 0; }
  .pronouns { display: block; font-size: 0.9rem; opacity: 0.8; font-weight: normal; margin: 0 0 0.5rem; }
  .bizname { font-size: 0.9rem; margin: 0.5rem 0 0 0; opacity: 0.8; }
  .bizaddr { font-size: 0.8rem; opacity: 0.6; }
  .sub, .textC { font-size: 1rem; white-space: pre-line; line-height: 1.5; }
  .sub { font-size: 0.9rem; margin: 0.5rem 0 0; opacity: 0.8; }
  .textC { margin: 1rem; }
  #cta {  color: #fff; display: flex; align-items: center; border-radius: 0.5rem; margin-top: 2rem; padding: 1rem 1.5rem; cursor: pointer; line-height: 0; justify-content: center; box-sizing: border-box; .icon { margin-right: 0.5rem; } p { margin: 0; } }
  .actions { width: 100%; margin-top: 2rem; display: grid; grid-gap: 1rem; grid-template-columns: 1fr 1fr; }
  .actionBtn { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; a { border-radius: 0.5rem; padding: 1rem; line-height: 0; } p { margin: 0 0 0 0.75rem; font-size: 0.9rem; white-space: nowrap; } }
  .secondary { grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr)); }
  .featured { display: flex; flex-direction: column; justify-content: center; margin: 3rem 0 0; width: 100%; }
  .section { font-weight: bold; font-size: 1.3rem; padding: 0.5rem 1rem; margin-bottom: 1rem; }
  .media { overflow: hidden; border-radius: 0.5rem; margin-top: 1rem; img { display: block; pointer-events: none; user-select: none; width: 100%; } }
  .embedded { position: relative; padding-top: 100%; iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; } }
  .music, .video { width: 100%; }
  .mediaC { display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; }
  video { width: 100%; }
  .controls { padding: 1rem; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
  .pCtrl, .docDl { display: none; align-items: center; justify-content: flex-start; width: 100%; margin: 1rem 0 0; }
  .docDl { display: flex; }
  .fileSize { margin: 0 0 0 1rem; }
  .currentTime { margin: 0 0.5rem 0 1rem; }
  .seekBar { width: 100%; height: 0.5rem; border-radius: 0.5rem; appearance: none; cursor: pointer; }
  .playPause, .dlBtn { padding: 1rem; border-radius: 0.5rem; line-height: 0; cursor: pointer; order: -1; }
  .pause { display: none; }
  .title { font-size: 1rem; font-weight: bold; margin: 0; }
  .prodInfo .sub { margin: -1rem 0 0; }
  .price { margin: 1rem 0 0; font-size: 1rem; font-weight: bold; }
  .label { display: inline-block; font-size: 1rem; margin: 1rem 0 0; border-radius: 0.5rem; letter-spacing: 1px; padding: 1rem 1.5rem; p { margin: 0; } }
  footer { padding: 4rem 1rem 2rem; font-size: 0.9rem; text-align: center; a { text-decoration: underline; color: inherit; } }
}
</style>
