<script setup lang="ts">
import {ref} from 'vue';
import {NSelect, NSpace} from 'naive-ui';
import { useChatStore } from '@/store/modules/chat';

interface Model {
  label: string;
  value: string;
}

const models: Model[] = [
  {label: 'ChatGPT', value: 'gpt-3.5-turbo'},
  {label: 'CPM', value: 'cpm-conv'},
  {label: 'Taoli', value: 'taoli-chatglm'},
];

const selectedModel = ref<string>(models[0].value)

defineExpose({
  selectedModel,
})

// import { defineProps, defineEmits } from 'vue';
//
// const props = defineProps({
//   selectedModel: String,
// });


// const emit = defineEmits<{
//   'update:selectedModel': (value: string) => void;
// }>()
//
// const onValueUpdate = (value: string) => {
//   emit('update:selectedModel', value);
// };

</script>

<template>
  <div class="flex flex-row w-1/3 text-center">
    <NSelect v-model:value="selectedModel"
             placeholder="Select model"
             :default-value="ref<string>(models[0].value)"
             :options="models"
             size="large"/>
<!--    <NSelect v-model:value="selectedModel"-->
<!--             placeholder="Select model"-->
<!--             :default-value="models[0].value"-->
<!--             :options="models"-->
<!--             @update:value="onValueUpdate"-->
<!--             size="large"/>-->
  </div>
</template>

<style scoped>

</style>