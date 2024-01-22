<template>
  <div class="space-y-4">
    <Card class="mb-4">
      <template v-slot:content>
        <MultiplesVehicleSettingsForm
          :isLoading="isLoading"
          @updated="updateUnitsSelected"
        />
      </template>
    </Card>

    <VehicleSettingsCard
      :disabled="settingsDisabled"
      v-model="zonesLimits"
      v-model:immobilized="isImmobilized"
    />

    <div class="block md:hidden">
      <Button
        class="w-[90px]"
        :isDisabled="!unitsSelected.filter((u) => u.selected).length"
        @clicked="save"
      >
        <span> {{ t(`main_toolbar.Save`) }} </span>
      </Button>
    </div>
  </div>
  <teleport
    to="#settings-btn"
    class="block text-right mt-4"
    v-if="displaySaveBtn"
  >
    <Button
      :isDisabled="!unitsSelected.filter((u) => u.selected).length"
      @clicked="save"
    >
      {{ t(`main_toolbar.Save`) }}
    </Button>
  </teleport>
</template>

<script>
import { inject, computed, ref, nextTick, reactive } from "vue";
import updateShadows from "../../../../../api/shadow/update-shadows";
import { useTranslation } from "../../../../../composables/lang";
export default {
  setup() {
    const { t, locale } = useTranslation();
    const userStore = inject("userStore");
    const user = computed(() => userStore.state.user);
    const userSpeedUnit = userStore.speedUnit.value;
    const userUnits = computed(() => {
      return user.value.units.data;
    });
    const zonesLimits = ref([]);
    const isImmobilized = ref(false);
    const notificationsStore = inject("notificationsStore");
    const displaySaveBtn = ref(false);
    const isLoading = ref(false);
    nextTick(() => {
      displaySaveBtn.value = true;
    });
    const processZones = () => {
      const baseZones =
        userSpeedUnit === "kmh"
          ? [20, 25, 30, 40, 50, 60, 70, 80, 90, 100]
          : [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
      const zones = [];
      baseZones.forEach((zone) => {
        zones.push({
          value: zone,
          label: `Zone ${zone} ${userSpeedUnit}`,
          limit: 0,
        });
      });
      zonesLimits.value = zones;
    };
    const transformZonesForApi = () => {
      const transformedZones = {};
      zonesLimits.value.forEach((z) => {
        transformedZones[z.value] = z.limit;
      });
      return transformedZones;
    };
    processZones();
    const shadow = reactive({
      desired: {},
    });
    const save = async (e) => {
      shadow.desired = {
        ...shadow.desired,
        custom_limit: {
          kmh:
            userSpeedUnit === "kmh"
              ? transformZonesForApi()
              : user.value.settings.settings.speed_limit.kmh,
          mph:
            userSpeedUnit !== "kmh"
              ? transformZonesForApi()
              : user.value.settings.settings.speed_limit.mph,
        },
        mcu_config: {
          speed_limiter: {
            immobilize: isImmobilized.value,
          },
          load_limiter: {
            enable: false,
          },
          can: {
            read_only: false,
          },
        },
      };
      await updateShadows({
        serials: unitsSelected.value.map((s) => {
          return userUnits.value.filter((u) => u.unit_name === s.unit)[0]
            .device_identifier;
        }),
        shadow: shadow,
      });
    };
    const unitsSelected = ref([]);
    const updateUnitsSelected = (units) => {
      unitsSelected.value = units;
    };
    const settingsDisabled = computed(() => {
      if (unitsSelected.value.length > 0) {
        return false;
      } else {
        return true;
      }
    });
    return {
      save,
      displaySaveBtn,
      updateUnitsSelected,
      settingsDisabled,
      isLoading,
      unitsSelected,
      zonesLimits,
      isImmobilized,
      userUnits,
      t,
      locale,
    };
  },
};
</script>