<template>
  <div>
    <nav>
      <router-link to="/admin">状态</router-link>
      <router-link to="/admin/devices">设备</router-link>
      <router-link to="/admin/config">配置</router-link>
    </nav>
    <router-view />
  </div>
</template>
