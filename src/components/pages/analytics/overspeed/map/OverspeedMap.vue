<template>
  <div class="flex flex-col h-full space-y-4">
    <Card>
      <template v-slot:content>
        <OverspeedMapForm
          :isLoading="isLoading"
          :filtersPayload="filters"
          @search="search"
          @reset="reset"
        />
      </template>
    </Card>
    <div class="flex-1">
      <Gmap :markers="markers" clustering renderer="overspeed" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, reactive } from "vue";
import { format, sub } from "date-fns";
import { useOverspeed } from "../../../../../stores/overspeeds";
import { convertOverspeed } from "../../../../../utils/notifications";

const overspeedStore = useOverspeed();
const notificationsStore = inject("notificationsStore");
const overspeeds = computed(() => overspeedStore.map.overspeeds);

const markers = ref([]);

const isLoading = computed(() => overspeedStore.map.loading);

const filters = reactive({
  unit: null,
});

const createMarker = (overspeed) => {
  markers.value.push({
    id: overspeed.unit_name,
    ...overspeed,
  });
};

const reset = () => {
  markers.value = [];
  const data = {
    start: format(sub(new Date(), { days: 1 }), "yyyy-MM-dd'T'hh:mm:ss"),
    end: format(new Date(), "yyyy-MM-dd'T'hh:mm:ss"),
    limit: 100,
  };
  overspeedStore.fetchOverspeeds(data, "map").then(() => {
    overspeeds.value.forEach((overspeed) => {
      createMarker(overspeed);
    });
  });
};

const search = async (e) => {
  markers.value = [];
  await overspeedStore.fetchOverspeeds(
    {
      start: e.date_range.start
        ? format(new Date(e.date_range.start), "yyyy-MM-dd'T'hh:mm:ss")
        : null,
      end: e.date_range.end
        ? format(new Date(), "yyyy-MM-dd'T'hh:mm:ss")
        : null,
      unit: e.unit,
      overspeed_above: e.speed_delta_in_kmh,
      limit: 100,
    },
    "map"
  );

  if (overspeeds.value.length) {
    overspeeds.value.forEach((overspeed) => {
      createMarker(overspeed);
    });
  } else {
    notificationsStore.addNotification({
      type: "error",
      title: "No overspeeds",
      content: "Can't find overspeeds with your parameters.",
    });
  }
};

/* At page load, if we come from overspeed report, display the selected marker */
if (overspeedStore.map.selectedOverspeed) {
  filters.unit = overspeedStore.map.selectedOverspeed.unit_name;
  const overspeed = overspeedStore.map.selectedOverspeed;
  createMarker(overspeed);
} else {
  const data = {
    start: format(sub(new Date(), { days: 1 }), "yyyy-MM-dd'T'hh:mm:ss"),
    end: format(new Date(), "yyyy-MM-dd'T'hh:mm:ss"),
    limit: 100,
  };
  overspeedStore.fetchOverspeeds(data, "map").then(() => {
    overspeeds.value.forEach((overspeed) => {
      createMarker(overspeed);
    });
  });
}
</script>