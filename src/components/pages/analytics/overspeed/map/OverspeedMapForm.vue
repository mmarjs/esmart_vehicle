<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <div class="w-[200px]">
        <AutocompleteField
          ref="unitSelector"
          placeholder="Find a vehicle"
          :payload="filters.unit"
          :options="userUnits.map((u) => u.unit_name)"
          @selected="(e) => (filters.unit = e)"
        />
      </div>

      <div class="flex rounded-md h-[38px]">
        <span
          class="
            inline-flex
            items-center
            px-3
            rounded-l
            border border-r-0 border-lightgray
            bg-gray-50
            text-gray-500
            sm:text-sm
          "
        >
          Over allowed <strong class="ml-2">></strong>
        </span>
        <input
          type="number"
          name="company-website"
          id="company-website"
          class="
            flex-1
            min-w-0
            block
            w-full
            px-3
            py-2
            rounded
            focus:ring-indigo-500 focus:border-indigo-500
            sm:text-sm
            border-lightgray
          "
          placeholder="Value"
          v-model="filters.speed_delta_in_kmh"
        />
      </div>

      <div class="w-[200px]">
        <DropdownSimple
          placeholder="Select a time"
          :options="['Last day', 'Last week', 'Last month']"
          v-model="filters.range"
        />
      </div>

      <Button :isLoading="props.isLoading" @clicked="search">
        <span>Search</span>
      </Button>
    </div>
    <ResetFilters @clicked="resetFilters" />
  </div>
</template>

<script setup>
import { inject, ref, computed, watch, reactive } from "vue";
import { format, sub } from "date-fns";

const userStore = inject("userStore");
const userUnits = computed(() => {
  return userStore.state.user.units.data || [];
});

const emit = defineEmits(["search", "reset"]);
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  filtersPayload: Object,
});

const filters = reactive({
  unit: null,
  date_range: {
    start: "",
    end: "",
  },
  range: null,
  speed_delta_in_kmh: null,
});

if (props.filtersPayload.unit) {
  filters.unit = props.filtersPayload.unit;
}

const setDateRange = (e) => {
  filters.date_range.end = new Date();
  switch (e) {
    case "Last day":
      filters.date_range.start = sub(new Date(), { days: 1 });
      break;
    case "Last week":
      filters.date_range.start = sub(new Date(), { weeks: 1 });
      break;
    case "Last month":
      filters.date_range.start = sub(new Date(), { months: 1 });
      break;
    default:
      break;
  }
};
watch(
  () => filters.range,
  (val) => {
    setDateRange(val);
  }
);
const search = () => {
  emit("search", {
    ...{
      ...filters,
      speed_delta_in_kmh:
        userStore.speedUnit.value === "kmh"
          ? filters.speed_delta_in_kmh
          : Math.round(filters.speed_delta_in_kmh / 0.621371),
    },
    unit: filters.unit
      ? userUnits.value.filter((u) => u.unit_name === filters.unit)[0].unit_uuid
      : null,
  });
};
const unitSelector = ref(null);
const resetFilters = () => {
  emit("reset");
  filters.unit = null;
  unitSelector.value.reset();
  filters.range = "Last day";
  filters.speed_delta_in_kmh = null;
  filters.date_range = {
    start: sub(new Date(), { days: 1 }),
    end: new Date(),
  };
};
filters.range = "Last day";
setDateRange(filters.range);
</script>

<style lang='scss' scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>