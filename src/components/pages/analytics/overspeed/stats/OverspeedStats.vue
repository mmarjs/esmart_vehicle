<template>
  <Card>
    <template v-slot:content>
      <div class="overspeed__stats__top">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-2">
            <div class="w-[200px]">
              <AutocompleteField
                ref="unitSelector"
                placeholder="Find a vehicle"
                :payload="filters.unitSelected"
                :options="userUnits.map((u) => u.unit_name)"
                @selected="(e) => (filters.unitSelected = e)"
              />
            </div>
            <div>
              <DropdownSimple
                placeholder="Select range"
                :options="[t('DropdownSimple.Last 7 days'), t('DropdownSimple.Last 14 days'), t('DropdownSimple.Last 30 days')]"
                v-model="filters.range"
              />
            </div>

            <Button :isLoading="loading" @clicked="search">
              <span>Search</span>
            </Button>
          </div>
          <ResetFilters @clicked="reset" />
        </div>
      </div>
    </template>
  </Card>
  <div class="overspeed__stats__table">
    <OverspeedStatsTable v-if="stats.length" :statistics="stats" />
    <p class="mt-5 text-center font-bold" v-if="!loading && !stats.length">
      There is no data corresponding
    </p>
  </div>
</template>

<script setup>
import { inject, computed, ref, reactive, watch } from "vue";
import { useOverspeed } from "../../../../../stores/overspeeds.js";
import { useTranslation } from "../../../../../composables/lang";
const { t, locale } = useTranslation();
const userStore = inject("userStore");
const user = computed(() => userStore.state.user);
const userUnits = computed(() => user.value.units.data);
import moment from "moment";
const overspeedStore = useOverspeed();
const loading = computed(() => overspeedStore.stats.loading);
const stats = computed(() => overspeedStore.stats.stats);
import { sub, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
const filters = reactive({
  unitSelected: null,
  date: null,
  range: null,
});

watch(
  () => filters.date,
  (val) => {
    if (val) {
      filters.range = null;
    }
  }
);
watch(
  () => filters.range,
  (val) => {
    if (val) {
      filters.date = null;
    }
  }
);

const search = async () => {
  let data = {
    unit: filters.unitSelected
      ? userUnits.value.filter((u) => u.unit_name === filters.unitSelected)[0]
          .unit_uuid
      : null,
    speed_unit: userStore.speedUnit.value,
  };
  if (filters.date) {
    data = {
      ...data,
      start: formatInTimeZone(
        new Date(filters.date).setHours(0, 0, 0),
        "America/New_York",
        `yyyy-MM-dd'T'HH:mm:ss`
      ),
      end: formatInTimeZone(
        new Date(filters.date).setHours(23, 59, 0),
        "America/New_York",
        `yyyy-MM-dd'T'HH:mm:ss`
      ),
    };
  } else if (filters.range) {
    data = {
      ...data,
      start: formatInTimeZone(
        setDateRange(filters.range).start,
        "America/New_York",
        `yyyy-MM-dd'T'HH:mm:ss`
      ),
      end: formatInTimeZone(
        setDateRange(filters.range).end,
        "America/New_York",
        `yyyy-MM-dd'T'HH:mm:ss`
      ),
    };
  }
  overspeedStore.fetchOverspeedsStats(data);
};

const unitSelector = ref(null)
const reset = () => {
  filters.unitSelected = null;
  filters.date = null;
  filters.range = null;
  unitSelector.value.reset()
  overspeedStore.fetchOverspeedsStats({
    speed_unit: userStore.speedUnit.value,
  });
};
const setDateRange = (e) => {
  switch (e) {
    case t('DropdownSimple.Last 7 days'):
      return {
        start: sub(new Date(), { days: 7 }),
        end: new Date(),
      };
    case t('DropdownSimple.Last 14 days'):
      return {
        start: sub(new Date(), { days: 14 }),
        end: new Date(),
      };
    case t('DropdownSimple.Last 30 days'):
      return {
        start: sub(new Date(), { days: 30 }),
        end: new Date(),
      };
    default:
      break;
  }
};

overspeedStore.fetchOverspeedsStats({
  speed_unit: user.value.settings.speedUnit === "KPH" ? "kmh" : "mph",
});
</script>


<style lang="scss" scoped>
.overspeed__stats {
  @apply shadow bg-white rounded-lg;
}

.overspeed__stats__top {
  @apply flex items-center justify-between;
}

.overspeed__stats__stats {
  @apply bg-blue px-6 py-3;
}
</style>