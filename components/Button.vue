<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  disabled: boolean,
}>()

const emits = defineEmits<{
  (e: 'clickedButton'): void
}>();

const handleButtonClick = () => {
  emits('clickedButton')
}

const buttonStyle = computed(() => {
  return {
    'p-[10px]': true,
    'rounded-md': true,
    'bg-[color:--success-color]': !props.disabled,
    'bg-[color:--secondary-color]': props.disabled,
  }
})

</script>

<template>
  <div class="min-w-max flex items-center justify-center">
    <button
        :disabled="props.disabled"
        @click="handleButtonClick"
        :class="buttonStyle"
    >Calculate
    </button>
  </div>
</template>

<style scoped>

</style>