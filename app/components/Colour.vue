<template>
  <div class="mt-6 flex flex-col items-start">
    <div class="flex items-center">
      <label
        :for="`color-${name}`"
        :style="{ backgroundColor: colors[name].color }"
        class="w-12 h-12 rounded mr-3 cursor-pointer block border-2 border-gray-600 hover:border-gray-400 transition-colors duration-200 focus-within:ring-2 focus-within:ring-gray-400"
      >
        <input
          :id="`color-${name}`"
          type="color"
          :value="colors[name].color"
          @input="colors[name].color = ($event.target as HTMLInputElement).value"
          class="opacity-0 w-0 h-0 absolute"
          aria-label="Pick colour"
        />
      </label>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  label: string
  colors: Record<string, { color: string; openPalette: boolean }>
}>()
</script>

<style lang="scss">
.palette-enter-active,
.palette-leave-active {
  transition: transform 0.2s ease;
  transform-origin: left top;
}
.palette-enter-from,
.palette-leave-to {
  transform: scale(0);
}
</style>
