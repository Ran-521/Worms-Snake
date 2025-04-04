<template>
  <div class="app">
    <header class="app-header">
      <h1>贪吃蛇游戏</h1>
    </header>
    <main class="app-main">
      <GameBoard />
    </main>
  </div>
</template>

<script setup lang="ts">
import GameBoard from './components/GameBoard.vue';
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 2rem;
  font-weight: bold;
}

.app-main {
  flex: 1;
  padding: 2rem;
}
</style> 