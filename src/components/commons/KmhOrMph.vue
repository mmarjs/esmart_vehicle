<template>
  <span>
    {{ convertedValue }}
    {{ userStore.speedUnit === "kmh" ? "Kph" : "MPH" }}
  </span>
</template>

<script setup>
import { computed, inject, defineProps } from "vue";
const props = defineProps({
  value: {
    type: [String, Number],
  },
  valueUnit: {
    type: String,
    default: "kph",
  },
});
const userStore = inject("userStore");
const user = computed(() => {
  return userStore.state.user;
});

const convertedValue = computed(() => {
  if (userStore.speedUnit.value === "kmh" && props.valueUnit === "mph") {
    return mphToKph(props.value);
  }
  if (userStore.speedUnit.value === "mph" && props.valueUnit === "kph") {
    return kphToMph(props.value);
  }
  return props.value;
});

const kphToMph = (value) => {
  return Math.round(value * 0.621371);
};
const mphToKph = (value) => {
  return Math.round(value / 0.621371);
};
</script>