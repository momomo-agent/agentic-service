<template>
  <table>
    <thead><tr><th>ID</th><th>Name</th></tr></thead>
    <tbody>
      <tr v-for="d in devices" :key="d.id">
        <td>{{ d.id }}</td><td>{{ d.name }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({ devices: { type: Array, default: () => [] } })
</script>
