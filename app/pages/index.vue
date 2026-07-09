<template>
  <div
    ref="containerRef"
    class="container relative bg-gray-900 mx-auto text-gray-100"
    style="max-width: 960px"
  >
    <Modal
      v-if="content"
      @click.self="clearContent"
      :content="content"
      :clearContent="clearContent"
    />
    <transition name="drop">
      <div
        v-if="inView || showPreview"
        class="fixed top-0 w-full z-30 bg-gray-900 justify-between items-center flex md:hidden"
      >
        <div class="logo w-16 m-4" v-html="getIcon('logo')"></div>
        <button
          class="p-3 mx-4 font-extrabold rounded tracking-wide focus:outline-none select-none"
          :class="showPreview ? 'bg-gray-700' : 'bg-emerald-600'"
          @click="!opening && togglePreview()"
        >
          {{ showPreview ? 'Close preview' : 'Open preview' }}
        </button>
      </div>
    </transition>
    <transition name="fade">
      <Preview
        v-show="showPreview"
        class="fixed top-20 w-full bottom-0 z-20 border-none rounded-b-none"
        ref="htmlMobileRef"
        :username="username"
        :genInfo="genInfo"
        :images="images"
        :featured="featured"
        :colors="colors"
        :primaryActions="primaryActions"
        :secondaryActions="secondaryActions"
        :PreviewMode="PreviewMode"
        :downloadVcard="downloadVcard"
        :footerCredit="footerCredit"
        :showAlert="showAlert"
        :hasLightBG="hasLightBG"
        :downloadKey="downloadKey"
        :pubKeyIsValid="pubKeyIsValid"
      />
    </transition>

    <div class="px-4">
      <div class="flex items-start justify-between pt-8">
        <div
          class="logo w-24"
          v-html="getIcon('logo')"
          title="EnBizCard - An Open-Source Digital Business Card Generator"
        ></div>
        <a
          class="font-extrabold tracking-wide leading-none shrink-0 p-3 border-2 text-white border-gray-700 rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
          href="https://www.vishnuraghav.com/donate"
          target="_blank"
          rel="noreferrer"
          >Donate</a
        >
      </div>
      <h1 class="text-3xl md:text-5xl font-extrabold mt-24 md:mt-48 md:leading-tight">
        Why Pay When Your Website Can Host Your Digital Business Cards for Free!
      </h1>
      <p class="mt-8 text-lg md:text-xl w-full md:w-3/4 text-gray-200">
        EnBizCard helps you create beautiful, responsive HTML&#8209;based digital business cards
        that can be hosted on your website.
      </p>
      <ul class="mt-4 text-gray-400">
        <li>-&ensp;No sign-up required</li>
        <li>-&ensp;100% free and open-source</li>
        <li>-&ensp;No user tracking and data collection</li>
        <li>-&ensp;Works offline</li>
      </ul>
      <div class="mt-4 flex flex-wrap items-center">
        <button
          class="font-extrabold leading-none text-lg tracking-wide select-none shrink-0 p-5 mt-2 mr-2 text-white bg-emerald-600 rounded hover:bg-emerald-500 focus:bg-emerald-500 transition-colors duration-200 focus:outline-none"
          @click="create()"
        >
          Create your own
        </button>
        <a
          class="font-extrabold leading-none text-lg tracking-wide shrink-0 p-5 mt-2 text-white bg-gray-700 rounded hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200"
          :href="`${baseURL}demo`"
          target="_blank"
          >View demo</a
        >
      </div>
      <p class="mt-6">
        Read the
        <NuxtLink
          to="/hosting-guide"
          class="cursor-pointer underline font-extrabold text-emerald-600 hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200"
          >Hosting Guide</NuxtLink
        >
      </p>
    </div>
    <div class="md:grid md:grid-cols-2">
      <div class="px-4 mt-32">
        <div ref="createRef" id="step-1" class="pt-8">
          <h2 class="font-extrabold text-2xl">Header attachments</h2>
          <div class="stepC">
            <Attachment :content="images" type="logo" :resizeImage="resizeImage" label="Add logo" description="suggested format: svg, png or gif" :showAlert="showAlert" />
            <Attachment :content="images" type="cover" :resizeImage="resizeImage" label="Add cover photo" description="suggested format: svg, jpeg, png or gif" :showAlert="showAlert" />
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Recommended cover photo size is 960 x 640 pixels, with an aspect ratio of 3:2
            </p>
          </div>
        </div>
        <div id="step-2" class="mt-16">
          <h2 class="font-extrabold text-2xl">Contact information</h2>
          <Attachment :content="images" type="photo" :resizeImage="resizeImage" label="Add profile photo" description="suggested format: jpeg, png or gif" :showAlert="showAlert" />
          <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
            Recommended profile photo size is 320 x 320 pixels, with an aspect ratio of 1:1
          </p>
          <div class="stepC mt-6 grid grid-cols-2 gap-4">
            <div>
              <label for="firstname" class="ml-4">First name</label>
              <input id="firstname" spellcheck="false" type="text" v-model="genInfo.fname" autocapitalize="words" class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" />
            </div>
            <div>
              <label for="lastname" class="ml-4">Last name</label>
              <input id="lastname" spellcheck="false" type="text" v-model="genInfo.lname" autocapitalize="words" class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" />
            </div>
          </div>
          <div class="stepC mt-6">
            <label for="pronouns" class="ml-4">Gender pronouns</label>
            <input id="pronouns" spellcheck="false" type="text" v-model="genInfo.pronouns" placeholder="He/Him/His" autocapitalize="words" class="mt-2 px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" />
          </div>
          <div class="stepC mt-6">
            <label for="job-title" class="ml-4">Job title</label>
            <input id="job-title" type="text" spellcheck="true" autocapitalize="words" v-model="genInfo.title" class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" />
          </div>
          <div class="stepC mt-6">
            <label for="business-name" class="ml-4">Business name</label>
            <input id="business-name" spellcheck="false" type="text" v-model="genInfo.biz" autocapitalize="words" class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" />
          </div>
          <div class="stepC mt-6">
            <label for="business-address" class="ml-4">Business address</label>
            <textarea id="business-address" :value="genInfo.addr" @input="genInfo.addr = ($event.target as HTMLTextAreaElement).value" class="block mt-2 px-4 py-3 w-full bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" rows="4"></textarea>
          </div>
          <div class="stepC mt-6">
            <label for="business-description" class="ml-4">Business description</label>
            <textarea id="business-description" :value="genInfo.desc" @input="genInfo.desc = ($event.target as HTMLTextAreaElement).value" class="block mt-2 px-4 py-3 w-full bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" rows="4"></textarea>
          </div>
          <div class="stepC relative mt-6">
            <label for="pgp-public-key" class="flex justify-between ml-4"
              >OpenPGP public key<span v-if="genInfo.key" class="mr-4" :class="pubKeyIsValid ? 'text-emerald-500' : 'text-red-600'">{{ pubKeyIsValid ? 'Valid' : 'Invalid schema' }}</span>
            </label>
            <textarea id="pgp-public-key" v-model="genInfo.key" class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" rows="4" spellcheck="false" placeholder="Paste public key block here"></textarea>
          </div>
        </div>
        <div id="step-3" class="mt-16">
          <h2 class="font-extrabold text-2xl">Primary actions</h2>
          <draggable
            v-model="primaryActions"
            handle=".drag"
            :animation="1"
            ghost-class="ghost"
            item-key="name"
            tag="transition-group"
            :component-data="{ name: 'list', type: 'transition' }"
          >
            <template #item="{ element, index }">
              <Action
                name="primaryActions"
                :type="primaryActions"
                :item="element"
                :index="index"
                :buttonBg="colors.buttonBg.color"
                :removeAction="removeAction"
              />
            </template>
          </draggable>
          <div class="mt-6 border-gray-800" :class="{ 'border-t pt-6': primaryActions.length }">
            <input spellcheck="false" type="text" v-model="filterPrimary" placeholder="Search an action" class="px-4 mb-2 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" @keydown.esc="clearFilterActions" @keypress.enter="filteredAction('filteredPrimaryActions', 'primaryActions')" />
            <p class="p-3" v-if="filteredPrimaryActions.length < 1">
              Can't find an action? Please <a href="#help" class="cursor-pointer underline font-extrabold text-emerald-600 hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200">leave your suggestion</a> on Telegram
            </p>
            <div class="stepC actions">
              <button v-for="(action, index) in filteredPrimaryActions" :key="index" @click="addAction('primaryActions', action.name)" class="p-3 flex items-center shrink-0 rounded hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none bg-gray-700" :title="action.name.substr(0, 1).toUpperCase() + action.name.slice(1)" :aria-label="action.name">
                <div class="w-6 h-6 mr-3 shrink-0" v-html="getIcon(action.icon)"></div>
                <p class="whitespace-nowrap">{{ action.name.substr(0, 1).toUpperCase() + action.name.slice(1) }}</p>
              </button>
            </div>
          </div>
        </div>
        <div id="step-4" class="mt-16">
          <h2 class="font-extrabold text-2xl">Secondary actions</h2>
          <draggable
            v-model="secondaryActions"
            handle=".drag"
            :animation="1"
            ghost-class="ghost"
            item-key="name"
            tag="transition-group"
            :component-data="{ name: 'list', type: 'transition' }"
          >
            <template #item="{ element, index }">
              <Action
                name="secondaryActions"
                :type="secondaryActions"
                :item="element"
                :index="index"
                :removeAction="removeAction"
              />
            </template>
          </draggable>
          <div class="mt-6 border-gray-800" :class="{ 'border-t pt-6': secondaryActions.length }">
            <input spellcheck="false" type="text" v-model="filterSecondary" placeholder="Search an action" class="px-4 mb-2 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600" @keydown.esc="clearFilterActions" @keypress.enter="filteredAction('filteredSecondaryActions', 'secondaryActions')" />
            <p class="p-3" v-if="filteredSecondaryActions.length < 1">
              Can't find an action? Please <a href="#help" class="cursor-pointer underline font-extrabold text-emerald-600 hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200">leave your suggestion</a> on Telegram
            </p>
            <div class="stepC actions">
              <button v-for="(action, index) in filteredSecondaryActions" :key="index" @click="addAction('secondaryActions', action.name)" class="p-3 flex items-center shrink-0 rounded hover:brightness-125 focus:brightness-125 transition-all duration-200 focus:outline-none" :style="{ background: action.color }" :title="action.name.substr(0, 1).toUpperCase() + action.name.slice(1)">
                <div class="w-6 h-6 mr-3 shrink-0" v-html="getIcon(action.icon)"></div>
                <p class="whitespace-nowrap" :class="{ 'text-gray-900': action.light }">{{ action.name.substr(0, 1).toUpperCase() + action.name.slice(1) }}</p>
              </button>
            </div>
          </div>
        </div>
        <div id="step-5" class="mt-16">
          <h2 class="font-extrabold text-2xl">Featured content</h2>
          <div class="stepC">
            <draggable
              v-model="featured"
              handle=".drag"
              :animation="1"
              ghost-class="ghost"
              item-key="title"
            >
              <template #item="{ element: content, index }">
                <Featured
                  :featured="featured"
                  :resizeImage="resizeImage"
                  :index="index"
                  mimetypes="image/jpeg, image/png, audio/mpeg, video/mp4, video/webm, application/pdf"
                  :showAlert="showAlert"
                />
              </template>
            </draggable>
            <div class="flex mt-6">
              <div class="flex flex-wrap items-center">
                <button class="p-3 rounded bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none" @click="addFeature()" aria-label="Add section">
                  <div class="w-6 h-6" v-html="getIcon('add')"></div>
                </button>
                <p class="ml-3 leading-none">Add section</p>
              </div>
            </div>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Supported media formats: jpeg, png, mp3, mp4, webm and pdf
            </p>
          </div>
        </div>
        <div id="step-6" class="mt-16">
          <h2 class="font-extrabold text-2xl">Footer credit</h2>
          <div class="stepC mt-6">
            <div class="flex items-center">
              <div
                class="relative group inline-block w-24 h-12 mr-3 align-middle select-none transition duration-200 ease-in bg-gray-700 rounded hover:bg-gray-600 focus:bg-gray-600 cursor-pointer focus:outline-none"
                :class="{ 'bg-emerald-600 hover:bg-emerald-500 focus:bg-emerald-500': footerCredit }"
                tabindex="0"
                @click="footerCredit = !footerCredit"
                @keypress.space.enter.prevent="footerCredit = !footerCredit"
              >
                <transition name="slide">
                  <input type="checkbox" name="toggle" aria-label="Toggle footer credit" id="toggle" v-model="footerCredit" class="toggle-switch absolute block w-10 h-10 m-1 rounded border-4 border-transparent appearance-none cursor-pointer transition-colors duration-200 focus:outline-none bg-white" tabindex="-1" />
                </transition>
              </div>
              <p>{{ footerCredit ? 'Enabled' : 'Disabled' }}</p>
            </div>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              By enabling the footer credit, you can help this project reach more people.
            </p>
          </div>
        </div>
        <div id="step-7" class="mt-16">
          <h2 class="font-extrabold text-2xl">Themes</h2>
          <div class="stepC mt-3 flex flex-wrap">
            <button @click="changeTheme(1)" class="w-12 h-12 rounded mt-3 mr-3 font-extrabold focus:outline-none transition-colors duration-200" :class="theme == 1 ? 'bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'">A</button>
            <button @click="changeTheme(2)" class="w-12 h-12 rounded mt-3 mr-3 font-extrabold focus:outline-none transition-colors duration-200" :class="theme == 2 ? 'bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'">B</button>
            <button @click="changeTheme(3)" class="w-12 h-12 rounded mt-3 mr-3 font-extrabold focus:outline-none transition-colors duration-200" :class="theme == 3 ? 'bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'">C</button>
          </div>
        </div>
        <div id="step-8" class="mt-16">
          <h2 class="font-extrabold text-2xl">Colours</h2>
          <div class="stepC">
            <Colour name="logoBg" label="Header background" :colors="colors" />
            <Colour name="mainBg" label="Main background" :colors="colors" />
            <Colour name="buttonBg" label="Button background" :colors="colors" />
            <Colour name="cardBg" label="Featured content background" :colors="colors" />
          </div>
        </div>
        <div id="step-9" class="mt-16">
          <h2 class="font-extrabold text-2xl">Fonts</h2>
          <div class="stepC mt-6">
            <label for="font-link" class="ml-4">Web font embed code</label>
            <textarea id="font-link" v-model="genInfo.fontLink" class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" rows="4" spellcheck="false" :placeholder="`<link href=&quot;https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap&quot; rel=&quot;stylesheet&quot;>`"></textarea>
          </div>
          <div class="stepC mt-6">
            <label for="font-css" class="ml-4">Web font CSS rule</label>
            <input spellcheck="false" type="text" id="font-css" v-model="genInfo.fontCss" class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" :placeholder="`font-family: 'Poppins', sans-serif;`" />
          </div>
          <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
            Supports services such as Google Fonts, Adobe Typekit, etc.
          </p>
        </div>
        <div id="step-10" class="mt-16">
          <h2 class="font-extrabold text-2xl">Analytics</h2>
          <div class="stepC mt-6">
            <label for="tracking-code" class="ml-4">Tracking code</label>
            <textarea id="tracking-code" aria-label="tracking-code" v-model="genInfo.tracker" class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" rows="4" spellcheck="false" placeholder="Paste tracking code here"></textarea>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Supports services such as Clicky, Matomo, Google Analytics etc.
            </p>
          </div>
        </div>
        <div id="step-11" class="mt-16">
          <h2 class="font-extrabold text-2xl">Hosting</h2>
          <div class="stepC mt-6">
            <label for="hosted-url" class="ml-4">Hosted card URL</label>
            <input spellcheck="false" type="text" id="hosted-url" v-model="hostedURL" class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600" placeholder="https://yoursite/vcard/username" />
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Only paste your hosting URL if you've already decided where you want to host this digital business card.
            </p>
          </div>
        </div>
        <Download :downloadCheckList="downloadCheckList" :downloadChecked="downloadChecked" :downloadPackage="downloadPackage" />
        <Help />
      </div>
      <div id="preview-container" class="relative w-full mt-20 sm:mt-0 hidden md:block">
        <div id="preview" class="flex flex-col items-center justify-center sm:sticky sm:top-0 md:mx-6 lg:mx-12">
          <div id="device" class="bg-black rounded sm:mt-10">
            <h2 class="text-center py-4 font-extrabold text-gray-200">LIVE PREVIEW</h2>
            <div id="browserFrame" class="overflow-hidden flex flex-col">
              <div id="topBar" class="topbar border-r-4 border-l-4 border-black bg-gray-900 z-10">
                <div id="searchField" class="p-2 flex items-center">
                  <input type="text" class="pl-4 h-12 w-full bg-black rounded text-gray-500" aria-label="vCard URL" disabled :value="'https://yoursite/vcard/' + username" tabindex="-1" />
                  <div class="w-6 ml-2" v-html="getIcon('ellipsis')"></div>
                </div>
              </div>
              <Preview
                class="rounded-b-2xl"
                ref="htmlRef"
                :username="username"
                :genInfo="genInfo"
                :images="images"
                :featured="featured"
                :colors="colors"
                :primaryActions="primaryActions"
                :secondaryActions="secondaryActions"
                :PreviewMode="PreviewMode"
                :downloadVcard="downloadVcard"
                :footerCredit="footerCredit"
                :showAlert="showAlert"
                :hasLightBG="hasLightBG"
                :downloadKey="downloadKey"
                :pubKeyIsValid="pubKeyIsValid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Vcard ref="vCardRef" :vCard="vCard" />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Theme1 from '~/assets/styles/T1.min.css?raw'
import Theme2 from '~/assets/styles/T2.min.css?raw'
import Theme3 from '~/assets/styles/T3.min.css?raw'
import QRCode from '~/assets/scripts/qrcode.min.js?raw'

const { theme, changeTheme } = useTheme()
const { getIcon } = useIcons()
const { app: { baseURL } } = useRuntimeConfig()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const createRef = ref<HTMLElement | null>(null)
const htmlRef = ref<any>(null)
const htmlMobileRef = ref<any>(null)
const vCardRef = ref<any>(null)

// State
const downloadCheckList = ref([
  { label: 'I did not attach any link or file that will cause any risk to the user', checked: false },
  { label: 'I have verified that all the links are working correctly', checked: false },
  { label: 'I have removed all unused fields and sections', checked: false },
])

const images = reactive<Record<string, any>>({
  logo: { url: null, blob: null, ext: null, mime: null, resized: null },
  photo: { url: null, blob: null, ext: null, mime: null, resized: null },
  cover: { url: null, blob: null, ext: null, mime: null, resized: null },
})

const colors = reactive<Record<string, { color: string; openPalette: boolean }>>({
  logoBg: { color: '#059669', openPalette: false },
  mainBg: { color: '#ddd', openPalette: false },
  buttonBg: { color: '#059669', openPalette: false },
  cardBg: { color: '#fff', openPalette: false },
})

const genInfo = reactive<Record<string, any>>({
  fname: null, lname: null, pronouns: null, title: null, biz: null,
  addr: null, desc: null, key: null, tracker: null, fontLink: null, fontCss: null,
})

const primaryActions = ref<Array<Record<string, any>>>([])
const filterPrimary = ref('')
const secondaryActions = ref<Array<Record<string, any>>>([])
const filterSecondary = ref('')
const featured = ref<Array<Record<string, any>>>([{ title: 'Section title', content: [] }])
const hostedURL = ref<string | null>(null)
const footerCredit = ref(true)
const PreviewMode = ref(true)
const content = ref<string | null>(null)
const inView = ref(false)
const showPreview = ref(false)
const scrollPos = ref(0)
const opening = ref(false)

const allPrimaryActions: Array<Record<string, any>> = [
  { name: 'Mobile', icon: 'call', href: 'tel:', placeholder: '+XX XXXXX XXXXX', value: null, label: 'Mobile number', order: 0, isURL: 0 },
  { name: 'Office', icon: 'call', href: 'tel:', placeholder: '+XX XXXXX XXXXX', value: null, label: 'Office number', order: 1, isURL: 0 },
  { name: 'Home', icon: 'call', href: 'tel:', placeholder: '+XX XXXXX XXXXX', value: null, label: 'Home number', order: 2, isURL: 0 },
  { name: 'SMS', icon: 'sms', href: 'sms:', placeholder: '+XX XXXXX XXXXX', value: null, label: 'SMS mobile number', order: 3, isURL: 0 },
  { name: 'Email', icon: 'email', href: 'mailto:', placeholder: 'info@example.com', value: null, label: 'Email address', order: 4 },
  { name: 'Website', icon: 'website', placeholder: 'https://example.com', value: null, label: 'Website URL', order: 5, isURL: 1 },
  { name: 'Store', icon: 'store', placeholder: 'https://example.com/storeID', value: null, label: 'Online Store URL', order: 6, isURL: 1 },
  { name: 'Location', icon: 'location', placeholder: 'https://osm.org/go/location', value: null, label: 'Map location URL', order: 7, isURL: 1 },
  { name: 'Signal', icon: 'signal', href: 'https://signal.me/#p/', placeholder: '+XXXXXXXXXXXX', value: null, label: 'Signal number with country code (no spaces)', order: 8, isURL: 1 },
  { name: 'Telegram', icon: 'telegram', href: 'https://t.me/', placeholder: 'username', value: null, label: 'Telegram username', order: 9, isURL: 1 },
  { name: 'Matrix', icon: 'matrix', href: 'https://matrix.to/#/', placeholder: '@username:matrix.org', value: null, label: 'Matrix userID', order: 10, isURL: 1 },
  { name: 'WhatsApp', icon: 'whatsapp', placeholder: 'https://wa.me/profileID', value: null, label: 'WhatsApp profile URL', order: 11, isURL: 1 },
  { name: 'Messenger', icon: 'messenger', href: 'https://m.me/', placeholder: 'username', value: null, label: 'Messenger username', order: 12, isURL: 1 },
  { name: 'Skype', icon: 'skype', href: 'skype:', hrefEnd: '?chat', placeholder: 'username', value: null, label: 'Skype username', order: 13, isURL: 1 },
  { name: 'Line', icon: 'line', href: 'https://line.me/ti/p/', placeholder: 'LINE ID', value: null, label: 'Line profile ID', order: 14, isURL: 1 },
  { name: 'Viber', icon: 'viber', href: 'viber://chat?number=', placeholder: 'XX XXXXX XXXXX', value: null, label: 'Viber mobile number', order: 15, isURL: 1 },
  { name: 'WeChat', icon: 'wechat', href: 'weixin://dl/chat?', placeholder: 'WeChat ID', value: null, label: 'WeChat profile ID', order: 16, isURL: 1 },
  { name: 'Calendar', icon: 'calendar', placeholder: 'https://example.com/calendarID', value: null, label: 'Calendar URL', order: 17, isURL: 1 },
  { name: 'XMPP', icon: 'xmpp', href: 'xmpp:', placeholder: 'XMPP ID', value: null, label: 'XMPP ID', order: 18, isURL: 1 },
]

const allSecondaryActions: Array<Record<string, any>> = [
  { name: 'Instagram', icon: 'instagram', href: 'https://instagram.com/', placeholder: 'username', value: null, color: '#ffffff', light: 1, gradientIcon: 1, label: 'Instagram username' },
  { name: 'Threads', icon: 'threads', href: 'https://www.threads.net/', placeholder: '@username', value: null, color: '#000000', label: 'Threads username' },
  { name: 'Pixelfed', icon: 'pixelfed', placeholder: 'https://pixelfed.social/username', value: null, color: '#8d59a8', label: 'Pixelfed profile URL' },
  { name: 'Facebook', icon: 'facebook', href: 'https://facebook.com/', placeholder: 'username or pagename', value: null, color: '#1877f2', label: 'Facebook username or pagename' },
  { name: 'Diaspora', icon: 'diaspora', placeholder: 'https://diaspora.social/username', value: null, color: '#000000', label: 'Diaspora profile URL' },
  { name: 'Friendica', icon: 'friendica', placeholder: 'https://friendica.social/username', value: null, color: '#1d6e9a', label: 'Friendica profile URL' },
  { name: 'Twitter', icon: 'twitter', href: 'https://twitter.com/', placeholder: 'username', value: null, color: '#1da1f2', label: 'Twitter username' },
  { name: 'Mastodon', icon: 'mastodon', placeholder: 'https://mastodon.social/@username', value: null, color: '#2b90d9', label: 'Mastodon profile URL' },
  { name: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/', placeholder: 'in/username or company/companyname', value: null, color: '#0077b5', label: 'Linkedin username or companyname' },
  { name: 'YouTube', icon: 'youtube', href: 'https://youtube.com/', placeholder: 'channel name or ID', value: null, color: '#ff0000', label: 'Youtube channel name or ID' },
  { name: 'Vimeo', icon: 'vimeo', href: 'https://vimeo.com/', placeholder: 'channelname', value: null, color: '#1ab7ea', label: 'Vimeo channelname' },
  { name: 'Peertube', icon: 'peertube', placeholder: 'https://peertube.video/channelname', value: null, color: '#ffffff', light: 1, label: 'Peertube channel URL' },
  { name: 'Pinterest', icon: 'pinterest', href: 'https://pinterest.com/', placeholder: 'username', value: null, color: '#bd081c', label: 'Pinterest username' },
  { name: 'Behance', icon: 'behance', href: 'https://behance.net/', placeholder: 'username', value: null, color: '#1769ff', label: 'Behance username' },
  { name: 'Dribbble', icon: 'dribbble', href: 'https://dribbble.com/', placeholder: 'username', value: null, color: '#ea4c89', label: 'Dribbble username' },
  { name: 'Reddit', icon: 'reddit', href: 'https://reddit.com/', placeholder: 'username', value: null, color: '#ff5700', label: 'Reddit username' },
  { name: 'VK', icon: 'vk', href: 'https://vk.com/', placeholder: 'pagename', value: null, color: '#4a76a8', label: 'VK page URL' },
  { name: 'Snapchat', icon: 'snapchat', href: 'https://www.snapchat.com/add/', placeholder: 'username', value: null, color: '#fffc00', light: 1, label: 'Snapchat username' },
  { name: 'Tumblr', icon: 'tumblr', href: 'https://', hrefEnd: '.tumblr.com/', placeholder: 'username', value: null, color: '#2c4762', label: 'Tumblr blog URL' },
  { name: 'Quora', icon: 'quora', href: 'https://quora.com/', placeholder: 'username', value: null, color: '#a82400', label: 'Quora username' },
  { name: 'Medium', icon: 'medium', placeholder: 'https://medium.com/publication_name', value: null, color: '#000000', label: 'Medium publication' },
  { name: 'Discord', icon: 'discord', placeholder: 'https://discord.gg/invitecode', value: null, color: '#7289da', label: 'Discord channel invite link' },
  { name: 'Twitch', icon: 'twitch', href: 'https://twitch.tv/', placeholder: 'username', value: null, color: '#9146ff', label: 'Twitch username' },
  { name: 'Spotify', icon: 'spotify', href: 'https://open.spotify.com/user/', placeholder: 'username', value: null, color: '#1ed760', label: 'Spotify username' },
  { name: 'Soundcloud', icon: 'soundcloud', href: 'https://soundcloud.com/', placeholder: 'username', value: null, color: '#ff3300', label: 'Soundcloud username' },
  { name: 'Funkwhale', icon: 'funkwhale', placeholder: 'https://funkwhale.audio/username', value: null, color: '#ffffff', light: 1, label: 'Funkwhale username' },
  { name: 'GitHub', icon: 'github', href: 'https://github.com/', placeholder: 'username', value: null, color: '#333', label: 'Github username' },
  { name: 'GitLab', icon: 'gitlab', href: 'https://gitlab.com/', placeholder: 'username', value: null, color: '#171321', label: 'Gitlab username' },
  { name: 'Codeberg', icon: 'codeberg', href: 'https://codeberg.org/', placeholder: 'username', value: null, color: '#2185d0', label: 'Codeberg username' },
  { name: 'Yelp', icon: 'yelp', href: 'https://yelp.com/', placeholder: 'bizname', value: null, color: '#fff', light: 1, label: 'Yelp pagename' },
  { name: 'PayPal', icon: 'paypal', href: 'https://paypal.me/', placeholder: 'username', value: null, color: '#003087', label: 'PayPal.me URL' },
  { name: 'Patreon', icon: 'patreon', href: 'https://patreon.com/', placeholder: 'username', value: null, color: '#FF424D', label: 'Patreon URL' },
  { name: 'Open-Collective', icon: 'open-collective', href: 'https://opencollective.com/', placeholder: 'projectname', value: null, color: '#fff', light: 1, label: 'Open Collective projectname' },
  { name: 'TikTok', icon: 'tiktok', href: 'https://tiktok.com/', placeholder: 'username', value: null, color: '#fff', light: 1, label: 'TikTok username' },
  { name: 'Cash App', icon: 'cashapp', href: 'https://cash.app/', placeholder: '$username', value: null, color: '#fff', light: 1, label: 'Cash App username' },
  { name: 'Siilo', icon: 'siilo', href: 'https://app.siilo.com/qr/', placeholder: 'userID', value: null, color: '#17233b', label: 'Siilo userID' },
  { name: 'App Store', icon: 'appstore', placeholder: 'https://apps.apple.com/in/app/appname/id', value: null, color: 'linear-gradient(#5fc9f8, #147efb)', label: 'App Store developer/app URL' },
  { name: 'Play Store', icon: 'playstore', placeholder: 'https://play.google.com/store/apps/details?id=', value: null, color: '#fff', light: 1, label: 'Play Store developer/app URL' },
  { name: 'ArtStation', icon: 'artstation', href: 'https://www.artstation.com/', placeholder: 'username', value: null, color: '#171717', label: 'ArtStation username' },
  { name: 'Buy me a coffee', icon: 'buymeacoffee', href: 'https://www.buymeacoffee.com/', placeholder: 'username', value: null, color: '#ffdd00', light: 1, label: 'Buy me a coffee username' },
]

// Available (not yet added) action pools
const availablePrimary = reactive<Array<Record<string, any>>>([...allPrimaryActions])
const availableSecondary = reactive<Array<Record<string, any>>>([...allSecondaryActions])

// Computed
const getFullname = computed(() => {
  const fn = genInfo.fname
  const ln = genInfo.lname
  return (fn || '') + (ln || '') ? `${fn || ''}${ln ? ' ' + ln : ''}` : null
})

const pubKeyIsValid = computed(() => {
  if (!genInfo.key) return false
  return (
    !!genInfo.key.match(/^(-----BEGIN PGP PUBLIC KEY BLOCK-----)/) &&
    !!genInfo.key.match(/(-----END PGP PUBLIC KEY BLOCK-----)$/)
  )
})

const downloadChecked = computed(() =>
  downloadCheckList.value.filter((e) => e.checked).length === 3,
)

const username = computed(() =>
  getFullname.value
    ? getFullname.value.toLowerCase().replace(/\W+/g, '')
    : 'username',
)

const orderedPrimaryActions = computed(() =>
  [...availablePrimary].sort((a, b) => a.order - b.order),
)

const filteredPrimaryActions = computed(() =>
  orderedPrimaryActions.value.filter((e) =>
    e.name.toLowerCase().includes(filterPrimary.value.toLowerCase()),
  ),
)

const orderedSecondaryActions = computed(() =>
  [...availableSecondary].sort((a, b) => a.name.localeCompare(b.name)),
)

const filteredSecondaryActions = computed(() =>
  orderedSecondaryActions.value.filter((e) =>
    e.name.toLowerCase().includes(filterSecondary.value.toLowerCase()),
  ),
)

const vCard = computed(() => {
  const getNumber = (type: string) => {
    const no = primaryActions.value.find((e) => e.name === type)?.value
    return no ? no.replace(/\s/g, '') : null
  }
  const email = primaryActions.value.find((e) => e.name === 'Email')?.value ?? null
  const website = primaryActions.value.find((e) => e.name === 'Website')?.value ?? null
  const actions = [
    ...primaryActions.value,
    ...secondaryActions.value.map((e) => ({ ...e, isURL: 1 })),
  ]
  const urls = actions
    .filter((e) => e.isURL && e.value)
    .map((e) => ({
      title: e.name,
      url: (e.href || '') + e.value + (e.hrefEnd || ''),
    }))
  const note = genInfo.desc ? genInfo.desc.replace(/[\r\n]+/gm, '') : null
  const key = pubKeyIsValid.value ? window.btoa(genInfo.key) : null
  const randomNumber = Math.floor(100000000 + Math.random() * 900000)
  return {
    fn: genInfo.fname, ln: genInfo.lname, title: genInfo.title, org: genInfo.biz,
    addr: genInfo.addr, cell: getNumber('Mobile'), work: getNumber('Office'),
    home: getNumber('Home'), sms: getNumber('SMS'), email, hostedURL: hostedURL.value,
    website, urls, key, note, uid: `EnBizCard-${randomNumber}`,
    photo: (() => {
      const url = images.photo?.url
      if (!url) return null
      const mime = url.split(';')[0].split(':')[1]
      const type = mime.split('/')[1].toUpperCase()
      const b64 = url.split(',')[1]
      return { type, b64 }
    })(),
  }
})

// Methods
function togglePreview() {
  opening.value = true
  const c = containerRef.value
  if (!c) return
  if (showPreview.value) {
    c.classList.remove('overflow-y-hidden', 'h-screen')
    window.scrollTo(0, scrollPos.value)
    opening.value = false
  } else {
    scrollPos.value = window.scrollY
    setTimeout(() => {
      c.classList.add('overflow-y-hidden', 'h-screen')
      opening.value = false
    }, 400)
  }
  showPreview.value = !showPreview.value
}

function checkView() {
  const e = createRef.value
  if (e) {
    const top = e.getBoundingClientRect().top
    inView.value = showPreview.value ? true : top < 0
  }
}

function clearContent() { content.value = null }
function showAlert(msg: string) { content.value = msg }
function create() { createRef.value?.scrollIntoView({ behavior: 'smooth' }) }
function getTitle(e: string) { return e.toLowerCase().split(' ').join('_') }
function addFeature() { featured.value.push({ title: 'Section title', content: [] }) }

function hasLightBG(key: string) {
  let hex = colors[key].color.slice(1)
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return Math.round((r * 299 + g * 587 + b * 114) / 1000) > 125
}

function clearFilterActions() { filterPrimary.value = filterSecondary.value = '' }

function filteredAction(filterType: 'filteredPrimaryActions' | 'filteredSecondaryActions', actionType: 'primaryActions' | 'secondaryActions') {
  const list = filterType === 'filteredPrimaryActions' ? filteredPrimaryActions.value : filteredSecondaryActions.value
  if (list.length) addAction(actionType, list[0].name)
  clearFilterActions()
}

function addAction(type: 'primaryActions' | 'secondaryActions', name: string) {
  const pool = type === 'primaryActions' ? availablePrimary : availableSecondary
  const idx = pool.findIndex((e) => e.name === name)
  if (idx < 0) return
  const [item] = pool.splice(idx, 1)
  if (type === 'primaryActions') primaryActions.value.push(item)
  else secondaryActions.value.push(item)
  clearFilterActions()
}

function removeAction(type: string, index: number) {
  if (type === 'primaryActions') {
    const [item] = primaryActions.value.splice(index, 1)
    availablePrimary.unshift(item)
  } else {
    const [item] = secondaryActions.value.splice(index, 1)
    availableSecondary.unshift(item)
  }
}

function downloadVcard() {
  const text = vCardRef.value?.vCard?.innerText
  if (!text) return
  const blob = new Blob([text], { type: 'text/plain' })
  saveAs(window.URL.createObjectURL(blob), `${username.value}.vcf`)
}

function downloadKey() {
  const blob = new Blob([genInfo.key], { type: 'text/plain' })
  saveAs(window.URL.createObjectURL(blob), `${getFullname.value}'s public key.asc`)
}

async function resizeImage(type: string, mime: string, index1?: number, index2?: number) {
  const reader = new FileReader()
  let file: File
  if (index2 !== undefined && index2 >= 0 && index1 !== undefined) {
    if (type === 'image') file = featured.value[index1].content[index2].file
    else if (type === 'music') file = featured.value[index1].content[index2].cover
    else if (type === 'product') file = featured.value[index1].content[index2].image.file
    else return
  } else {
    file = images[type].blob
  }
  if (!file) return

  await new Promise<void>((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = document.createElement('img')
    let maxWidth = 960, maxHeight = 960

    reader.onload = (e) => {
      img.src = e.target!.result as string
      img.onload = () => {
        if (type === 'photo') {
          canvas.width = canvas.height = photoSize
        } else {
          if (type === 'logo') { maxWidth = 960; maxHeight = 192 }
          let w = img.width, h = img.height
          if (w > maxWidth) { h *= maxWidth / w; w = maxWidth }
          if (h > maxHeight) { w *= maxHeight / h; h = maxHeight }
          canvas.width = w; canvas.height = h
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (!blob) return
          const image = new File([blob], type, { type: mime })
          if (index2 !== undefined && index2 >= 0 && index1 !== undefined) {
            if (type === 'image') featured.value[index1].content[index2].file = image
            else if (type === 'music') featured.value[index1].content[index2].cover = image
            else if (type === 'product') featured.value[index1].content[index2].image.file = image
          } else {
            images[type].resized = image
            const fr = new FileReader()
            fr.onload = () => { images[type].url = fr.result }
            fr.readAsDataURL(blob)
          }
          resolve()
        }, mime, 0.8)
      }
    }
    reader.readAsDataURL(file)
  })
}

function getTrackingCode() {
  const regex = /<script[^<]*<\/script>/g
  const tracker = genInfo.tracker
  if (regex.test(tracker)) {
    const scripts = tracker.match(regex)
    const temp = document.createElement('div')
    temp.innerHTML = tracker
    return scripts?.length ? temp : false
  }
  return false
}

function downloadPackage() {
  if (!downloadChecked.value) return
  PreviewMode.value = false
  setTimeout(() => {
    const previewEl = htmlRef.value?.html
    if (!previewEl) { PreviewMode.value = true; return }

    const el = new DOMParser().parseFromString(previewEl.outerHTML, 'text/html')

    const styleLink = document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = './style.min.css'
    el.querySelector('head')!.appendChild(styleLink)

    const qrScript = document.createElement('script')
    qrScript.src = './qrcode.min.js'
    el.querySelector('body')!.appendChild(qrScript)

    const modalsScript = document.createElement('script')
    modalsScript.innerText = 'let m=document.getElementById("modal"),c=document.getElementById("close"),ki=document.getElementById("keyView"),cv=document.getElementById("copyView"),curl=document.getElementById("copyURL"),qrv=document.getElementById("qrView"),qr=document.getElementById("qr"),s=document.getElementById("share"),sqr=document.getElementById("showQR"),sk=document.getElementById("showKey");function tC(e){"2rem"==e.style.top?(e.style.visibility="visible",e.style.top="0px",e.style.opacity=1):(e.style.top="2rem",e.style.opacity=0,setTimeout(()=>{e.style.visibility="hidden"},200))}function dN(e){e.style.display="none"}window.addEventListener("load",()=>{document.querySelector("#topActions").style.display="flex",qr.innerHTML=new QRCode({content:window.location.href,container:"svg-viewbox",join:!0,ecl:"L",padding:0}).svg()}),navigator.canShare?s.addEventListener("click",()=>{navigator.share({title:document.title,text:"You can view my Digital Business Card here:",url:window.location.href})}):s.addEventListener("click",()=>{tC(m),cv.style.display="flex",dN(qrv),ki&&dN(ki)}),sqr.addEventListener("click",()=>{tC(m),qrv.style.display="block",dN(cv),ki&&dN(ki)}),sk&&sk.addEventListener("click",()=>{tC(m),ki&&(ki.style.display="flex"),dN(cv),dN(qrv)}),c.addEventListener("click",()=>tC(m)),curl.addEventListener("click",async()=>{let e=curl.querySelectorAll(".iconColor")[1];await navigator.clipboard.writeText(window.location.href).then(t=>{e.innerText="Copied",setTimeout(()=>{e.innerText="Copy URL"},1e3)})});'
    el.querySelector('body')!.appendChild(modalsScript)

    if (featured.value.length) {
      const mediaScript = document.createElement('script')
      mediaScript.innerText = 'let pC=document.querySelectorAll(".pCtrl"),pP=document.querySelectorAll(".playPause"),srcs=document.querySelectorAll(".source");srcs.forEach(e=>{e.style.pointerEvents="none",e.removeAttribute("controls")}),pC.forEach((e,l)=>{e.style.display="flex";let r=e.querySelector(".currentTime"),s=e.querySelector(".seekBar"),t=e.querySelector(".playPause"),a=t.querySelector(".play"),c=t.querySelector(".pause");srcs[l].addEventListener("timeupdate",()=>{let e=srcs[l].currentTime,t=100/srcs[l].duration*e;s.value=t,100==t&&(s.value=0,a.style.display="block",c.style.display="none");let o=Math.floor(e/60),y=Math.floor(e%60);o.toString().length<2&&(o="0"+o),y.toString().length<2&&(y="0"+y),r.value=o+":"+y}),s.addEventListener("change",()=>{srcs[l].currentTime=srcs[l].duration*(parseInt(s.value)/100)}),t.addEventListener("click",()=>{srcs[l].paused?(srcs.forEach((e,r)=>{l!=r&&(e.paused||e.pause())}),pP.forEach((e,l)=>{let r=e.querySelector(".play"),s=e.querySelector(".pause");r.style.display="block",s.style.display="none"}),srcs[l].play(),a.style.display="none",c.style.display="block"):(srcs[l].pause(),c.style.display="none",a.style.display="block")})});'
      el.querySelector('body')!.appendChild(mediaScript)
    }

    const tracker = getTrackingCode()
    if (tracker) {
      while (tracker.firstChild) el.head.appendChild(tracker.firstChild)
    }

    const htmlBlob = new Blob([`<!DOCTYPE html>${el.documentElement.outerHTML}`], { type: 'text/html' })
    const themeMap: Record<number, string> = { 1: Theme1, 2: Theme2, 3: Theme3 }
    const cssBlob = new Blob([themeMap[theme.value] || Theme1], { type: 'text/css' })
    const vCardText = vCardRef.value?.vCard?.innerText || ''
    const vCardBlob = new Blob([vCardText], { type: 'text/plain' })
    const guideBlob = new Blob(['<html><head><meta http-equiv="refresh" content="0; url=https://enbizcard.vishnuraghav.com/hosting-guide" /></head></html>'], { type: 'text/html' })
    const qrBlob = new Blob([QRCode], { type: 'application/javascript' })

    const uname = username.value
    const zip = new JSZip()
    zip.folder(uname)!.file('index.html', htmlBlob)
    zip.folder(uname)!.file('style.min.css', cssBlob)
    zip.folder(uname)!.file('qrcode.min.js', qrBlob)
    zip.file('Hosting-Guide.html', guideBlob)

    for (const key in images) {
      if (images[key].url) {
        zip.folder(uname)!.file(`${key}.${images[key].ext}`, images[key].resized)
      }
    }

    const hasFeaturedContent = featured.value.some((e) => e.content.length)
    if (hasFeaturedContent) {
      featured.value.forEach((section) => {
        section.content.forEach((item: any) => {
          if (item.contentType === 'media') {
            zip.folder(uname)!.folder('media')!.file(`${getTitle(item.title)}.${item.ext}`, item.file)
            if (item.type.match(/music|document/gi) && !item.info) {
              zip.folder(uname)!.folder('media')!.file(`${getTitle(item.title)}.${item.coverExt}`, item.cover)
            }
          } else if (item.contentType === 'product' && item.image) {
            zip.folder(uname)!.folder('media')!.file(`${getTitle(item.image.title)}.${item.image.ext}`, item.image.file)
          }
        })
      })
    }

    const name = getFullname.value
    if (pubKeyIsValid.value) {
      zip.folder(uname)!.file(`${name}'s public key.asc`, genInfo.key)
    }
    zip.folder(uname)!.file(`${uname}.vcf`, vCardBlob)

    zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
      saveAs(zipBlob, `${name}'s Digital Business Card.zip`)
    })

    PreviewMode.value = true
  }, 250)
}

// Config loading
let photoSize = 320
let configLoadedTypes = new Set<string>()
let configWatcher: ReturnType<typeof setInterval>

function loadConfigColors(colorData: Record<string, string> | null) {
  const defaults: Record<string, string> = { logoBg: '#059669', buttonBg: '#059669' }
  for (const key of Object.keys(defaults)) {
    if (colors[key]) {
      colors[key].color = (colorData && colorData[key]) ? colorData[key] : defaults[key]
    }
  }
}

async function loadConfig() {
  const config = await fetch(`${baseURL}.config`).then((r) => r.json()).catch(() => null)
  loadConfigColors(config?.colors ?? null)
  photoSize = config?.images?.photo?.size || 320
  await loadConfigImages(config)
}

function emptyImage() { return { url: null, blob: null, ext: null, mime: null, resized: null } }

async function loadConfigImages(config: any) {
  if (!config?.images) {
    for (const type of configLoadedTypes) { images[type] = emptyImage() }
    configLoadedTypes.clear()
    return
  }
  const currentTypes = new Set(Object.keys(config.images))
  for (const type of configLoadedTypes) {
    if (!currentTypes.has(type)) { images[type] = emptyImage(); configLoadedTypes.delete(type) }
  }
  for (const [type, entry] of Object.entries(config.images) as [string, any][]) {
    if (!images[type]) continue
    if (entry.base64) {
      if (configLoadedTypes.has(type) && images[type].url) continue
      const mime = `image/${entry.format || 'jpeg'}`
      images[type] = { url: `data:${mime};base64,${entry.base64}`, blob: null, ext: entry.format || 'jpeg', mime, resized: null }
      configLoadedTypes.add(type)
      continue
    }
    if (!entry.file) {
      if (configLoadedTypes.has(type)) { images[type] = emptyImage(); configLoadedTypes.delete(type) }
      continue
    }
    if (configLoadedTypes.has(type) && images[type].url) continue
    try {
      const res = await fetch(`/${entry.folder || 'images'}/${entry.file}`)
      if (!res.ok) { if (configLoadedTypes.has(type)) { images[type] = emptyImage(); configLoadedTypes.delete(type) } continue }
      const blob = await res.blob()
      const mime = blob.type
      const ext = entry.file.split('.').pop()
      const dataURI = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target!.result as string)
        reader.readAsDataURL(blob)
      })
      const file = new File([blob], entry.file, { type: mime })
      images[type] = { url: dataURI, blob: file, ext, mime, resized: file }
      configLoadedTypes.add(type)
      resizeImage(type, mime)
    } catch (_) {}
  }
}

onMounted(() => {
  window.addEventListener('scroll', checkView)
  loadConfig()
  configWatcher = setInterval(() => loadConfig(), 3000)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', checkView)
  clearInterval(configWatcher)
})
</script>
