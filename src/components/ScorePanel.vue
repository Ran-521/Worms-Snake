<template>
  <div class="score-panel">
    <div class="score">得分: {{ score }}</div>
    <div class="high-score">最高分: {{ highScore }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: number;
  highScore: number;
}>();
</script>

<style scoped>
.score-panel {
  display: flex;
  gap: 20px;
  font-size: 1.2em;
  font-weight: bold;
}

.score, .high-score {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 