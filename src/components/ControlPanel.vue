<template>
  <div class="control-panel">
    <button @click="$emit('start')" v-if="!isRunning">开始游戏</button>
    <button @click="$emit('pause')" v-if="isRunning && !isPaused">暂停</button>
    <button @click="$emit('resume')" v-if="isPaused">继续</button>
    <button @click="$emit('reset')">重新开始</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isRunning: boolean;
  isPaused: boolean;
}>();

defineEmits<{
  (e: 'start'): void;
  (e: 'pause'): void;
  (e: 'resume'): void;
  (e: 'reset'): void;
}>();
</script>

<style scoped>
.control-panel {
  display: flex;
  gap: 10px;
}

.control-panel button {
  padding: 8px 16px;
  font-size: 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

.control-panel button:hover {
  background-color: #45a049;
}
</style> 