<script setup>
import { ref } from "vue";
import { schema } from "./helpers/validationSchema";
import axios from "axios";

const form = ref({
  email: "",
  number: "",
});

const errors = ref({
  email: "",
  number: "",
});

let cancelTokenSource;
const isFetching = ref(false);
const results = ref(null);
const errorMessage = ref(null);
const statusData = ref(null);

const validateForm = () => {
  const result = schema.safeParse(form.value);
  if (!result.success) {
    errors.value = result.error.format();
    return false;
  }
  errors.value = {
    email: "",
    number: "",
  };
  return true;
};

const handleSubmit = async () => {
  if (validateForm()) {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Operation canceled due to new request.");
    }

    cancelTokenSource = axios.CancelToken.source();

    const params = {
      email: form.value.email,
      number: form.value.number,
    };

    try {
      isFetching.value = true;
      const { data, status } = await axios.get("http://localhost:3000/search", {
        params,
        cancelToken: cancelTokenSource.token,
      });
      results.value = data;
      statusData.value = status;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
      } else {
        console.error("Request failed", error);
        errorMessage.value = error.response.data.message;
        statusData.value = error.response.status
      }
    } finally {
      isFetching.value = false;
      form.value.email = "";
      form.value.number = "";
    }
  }
};
</script>

<template>
  <div class="wrapper">
    <div class="container">
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form__email">
          <label for="email">Email</label>
          <InputText
            id="email"
            type="email"
            v-model="form.email"
            placeholder="test@gmail.com"
          />
          <span v-if="errors.email">{{ errors.email._errors[0] }}</span>
        </div>
        <div class="form__number">
          <label for="phone">Phone</label>
          <InputMask
            id="phone"
            v-model="form.number"
            mask="99-99-99"
            placeholder="##-##-##"
            :unmask="true"
          />
          <span v-if="errors.number">{{ errors.number._errors[0] }}</span>
        </div>
        <Button label="Search" type="submit" v-if="!isFetching" />
        <Button
          label="Search"
          type="submit"
          icon="pi pi-spin pi-spinner"
          disabled
          v-else
        />
      </form>
      <ul class="results" v-if="statusData === 200 && results?.length">
        <li class="results__item" v-for="(item, index) in results" :key="index">
          {{ item.email }} | {{ item.number }}
        </li>
      </ul>
      <p class="error" v-else>{{ errorMessage }}</p>
    </div>
  </div>
</template>
