<template>
  <Card>
    <template v-slot:title>
      <span>Password</span>
    </template>
    <template v-slot:content>
      <div
        class="flex flex-col md:flex-row flex-wrap items-center lg:space-x-4"
      >
        <PasswordField
          label="Previous password"
          name="changepassword-olgpassword"
          placeholder="123456"
          type="password"
          class="w-full lg:w-[250px]"
          v-model="passwords.old"
        />
        <PasswordField
          label="New password"
          name="changepassword-password"
          placeholder="123456"
          type="password"
          class="w-full lg:w-[250px]"
          v-model="passwords.new"
        />
        <PasswordField
          label="New password - Confirmation"
          name="changepassword-passwordconfirmation"
          placeholder="123456"
          type="password"
          class="w-full lg:w-[250px]"
          v-model="passwords.newConfirmation"
        />

        <Button
          class="w-full md:w-[200px]"
          @clicked="changePassword()"
          :isDisabled="v$.$invalid"
        >
          <span>Change my password</span>
        </Button>
      </div>

      <div
        class="
          flex-col
          regexs
          bg-gray
          p-[20px]
          mt-4
          w-full
          flex
          lg:w-auto
          lg:inline-flex
        "
      >
        <div class="flex items-center mb-2">
          <img
            src="../../assets/icons/info.svg"
            alt=""
            class="w-[20px] h-[20px]"
          />
          <span class="text-black ml-2">Your password needs :</span>
        </div>
        <span
          class="regex"
          :class="[
            passwords.new.length > 16 ? 'valid' : '',
            passwords.new.length > 0 ? 'invalid' : '',
          ]"
        >
          At least 16 characters (you are at {{ passwords.new.length }})
        </span>
        <span
          class="regex"
          :class="[
            passwordRegexUppercase.test(passwords.new) ? 'valid' : '',
            passwords.new.length > 0 ? 'invalid' : '',
          ]"
        >
          At least 1 uppercase
        </span>
        <span
          class="regex"
          :class="[
            passwordRegexLowercase.test(passwords.new) ? 'valid' : '',
            passwords.new.length > 0 ? 'invalid' : '',
          ]"
        >
          At least 1 lowercase
        </span>
        <span
          class="regex"
          :class="[
            passwordRegexSpecial.test(passwords.new) ? 'valid' : '',
            passwords.new.length > 0 ? 'invalid' : '',
          ]"
        >
          At least 1 special character (can be : @$!%*?&_-)
        </span>
      </div>
    </template>
  </Card>
</template>

<script>
import { inject, reactive, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, sameAs, helpers } from "@vuelidate/validators";
export default {
  setup() {
    const userStore = inject("userStore");
    const passwords = reactive({
      old: "",
      new: "",
      newConfirmation: "",
    });
    const passwordRegexUppercase = new RegExp(/^(?=.*?[A-Z])/);
    const passwordRegexLowercase = new RegExp(/^(?=.*?[a-z])/);
    const passwordRegexSpecial = new RegExp(/^(?=.*?[@$!%*?&_-])/);
    const passwordRegex = helpers.regex(
      passwords.newConfirmation,
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&_-])[A-Za-zd@$!%*?&_-]{16,}$/
    );
    const rules = computed(() => {
      return {
        old: { required },
        new: { required },
        newConfirmation: {
          required,
          sameAs: sameAs(passwords.new),
          valid: () => {
            return passwordRegex();
          },
        },
      };
    });

    const v$ = useVuelidate(rules, passwords);
    const changePassword = async () => {
      v$.$touch;
      await userStore.changePassword({
        oldPassword: passwords.old,
        newPassword: passwords.new,
      });
    };
    return {
      v$,
      passwords,
      changePassword,
      passwordRegexUppercase,
      passwordRegexLowercase,
      passwordRegexSpecial,
    };
  },
};
</script>

<style lang="scss" scoped>
.regexs {
  .regex {
    @apply text-black font-normal;

    &.invalid {
      @apply text-orange;
    }

    &.valid {
      @apply text-green;
    }
  }
}
</style> 