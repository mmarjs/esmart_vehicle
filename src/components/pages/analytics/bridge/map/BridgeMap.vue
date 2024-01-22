<template>
  <div class="flex flex-col h-full space-y-4">
    <Card>
      <template v-slot:content>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-[200px]">
              <DropdownSimple
                placeholder="Select a time"
                :options="['Last day', 'Last week', 'Last month']"
                v-model="filters.range"
              />
            </div>
            <Button :isLoading="isLoading" @clicked="search()">
              <span>Search</span>
            </Button>
          </div>

          <ResetFilters @clicked="resetFilters()" />
        </div>
      </template>
    </Card>
    <div class="flex-1">
      <Gmap :markers="markers" clustering renderer="bridge"/>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue-demi";
import { useGeofence } from "../../../../../stores/geofences";
import { format, sub } from "date-fns";

const geofenceStore = useGeofence();
const geofences = computed(() => geofenceStore.mapGeofences);

const markers = ref([]);

const isLoading = computed(() => {
  return geofenceStore.map.loading;
});

const filters = reactive({
  range: "Last day",
  date_range: {
    start: null,
    end: null,
  },
});

const createMarker = (geofence) => {
  markers.value.push({
    id: geofence.unit_name,
    type: "bridge",
    position: {
      lat: geofence.latitude,
      long: geofence.longitude,
    },
    local_time: geofence.local_time,
    data: {
      time: geofence.time,
      unit_name: geofence.unit_name ,
      unit_uuid: geofence.unit_uuid,
      raw_data: geofence,
    },
  });
};

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

const resetFilters = () => {
  filters.range = null;
  markers.value = [];
};

const search = async () => {
  markers.value = [];
  setDateRange(filters.range);
  const payload = {
    date_range: {
      start: filters.date_range.start,
      end: filters.date_range.end,
    },
    limit: 100,
  };
  await geofenceStore.fetchGeofences(payload, "map");
  geofences.value.forEach((geofence) => {
    createMarker(geofence);
  });
};

if (geofenceStore.map.selectedGeofence) {
  const geofence = geofenceStore.map.selectedGeofence;
  createMarker(geofence);
  geofenceStore.setSelectedGeofence(null);
  geofenceStore.map.loading = false;
} else {
  geofenceStore
    .fetchGeofences(
      {
        limit: 100,
        start: format(sub(new Date(), { days: 1 }), "yyyy-MM-dd'T'hh:mm:ss"),
        end: format(new Date(), "yyyy-MM-dd'T'hh:mm:ss"),
      },
      "map"
    )
    .then(() => {
      geofences.value.forEach((geofence) => {
        createMarker(geofence);
      });
    });
}
</script>