<script setup lang="ts">
import {ref} from 'vue';
import {NSelect, NSpace} from 'naive-ui';

interface Model {
  label: string;
  value: string;
}

const models: Model[] = [
  {label: 'ChatGPT', value: 'gpt-3.5-turbo'},
  {label: 'Model 2', value: 'model2'},
  {label: 'Model 3', value: 'model3'},
  {label: 'Model 4', value: 'model4'},
  {label: 'Model 5', value: 'model5'},
];

const selectedModel = ref<string>(models[0].value)
</script>

<template>
  <div class="flex flex-row w-1/3 text-center">
    <NSelect v-model="selectedModel"
             placeholder="Select model"
             :default-value="ref<string>(models[0].value)"
             :options="models"
             size="large"/>
  </div>
</template>

<style scoped>

</style>