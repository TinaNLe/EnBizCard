<template>
  <div class="mt-6 flex flex-col items-start">
    <div class="flex items-center">
      <label
        :style="{ backgroundColor: colors[name].color }"
        class="w-12 h-12 rounded mr-3 relative cursor-pointer transition-colors duration-200 focus-within:outline-none focus-within:ring ring-gray-100"
      >
        <input
          type="color"
          :value="colors[name].color"
          @input="changeColour($event, name)"
          class="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          :aria-label="label"
        />
      </label>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['name', 'label', 'colors'],
  methods: {
    changeColour(event, name) {
      this.colors[name].color = event.target.value
    },
  },
}
</script>
