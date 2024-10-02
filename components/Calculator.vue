<script setup lang="ts">
import {ref, computed, Ref} from "vue";
import Big from "big.js";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {format} from "date-fns";
import CurrencyPicker from "./CurrencyPicker.vue";
import Button from "./Button.vue";

const askCurrencyAmount: Ref<Number | String | null> = ref(null);
const currency: Ref<String> = ref("");
const exchangeRate: Ref<Number> = ref(0);
const date: Ref<Date | null> = ref(null);
const amountInEuros: Ref<Number> = ref(0);
const apiResponse: Ref<String> = ref(null);
const DPTextInputOptions = {
  enterSubmit: true,
  format: "dd-MM-yyyy"
};


const isButtonDisabled = computed(() => {
  return askCurrencyAmount.value === null || date.value === null;
});

const onBlur = () => {
  if (askCurrencyAmount.value === null || askCurrencyAmount.value === "") {
    askCurrencyAmount.value = null;
    amountInEuros.value = 0;

    return;
  }

  askCurrencyAmount.value = new Big(askCurrencyAmount.value).toFixed(2);
};

const calculate = async () => {
  let response = await $fetch('/api/hnb', {
    method: 'POST',
    body: {
      currencyCode: currency.value,
      date: format(date.value, 'yyyy-MM-dd'),
    }
  });

  apiResponse.value = response.data
  console.log(apiResponse.value)

  exchangeRate.value = parseFloat(apiResponse.value[0].srednji_tecaj.replace(/,/g, "."))

  let amount: Big = new Big(askCurrencyAmount.value);

  amountInEuros.value = amount.div(exchangeRate.value).toFixed(2);
};

</script>

<template>
  <div class="min-h-screen min-w-max mt-[30px] flex flex-col">
    <div class="min-w-max min-h-max flex m-[20px]">

      <div class="w-1/2 h-[500px] p-[50px] m-[50px] flex flex-col items-center justify-between bg-[--light-bg-color] rounded-md">
        <div class="min-w-max flex flex-col justify-around items-center">
          <label>Pick a date</label>
          <VueDatePicker
              v-model="date"
              :text-input="DPTextInputOptions"
              :max-date="new Date()"
              :enable-time-picker="false"
              format="dd-MM-yyyy"
              dark
              auto-apply
              vertical
          />
        </div>
        <CurrencyPicker @currency-change="(value: string) => currency = value"/>
        <div class="flex flex-col justify-around items-center">
          <label for="amount-to-eur">Amount in {{ currency }}</label>
          <input
              id="amount-to-eur"
              class="p-2 rounded-md border border-gray-300 bg-[color:--bg-color]"
              type="number"
              v-model="askCurrencyAmount"
              @blur="onBlur"
              placeholder="Enter amount"
          />
        </div>
      </div>

      <div class="w-1/2 h-[500px] p-[50px] m-[50px] flex flex-col items-center justify-center bg-[--light-bg-color] rounded-md">
        <div class="flex flex-col justify-around items-center">
          <p>Amount in Euros</p>
          <p id="amount-in-eur">{{ amountInEuros }}</p>
        </div>
        <div class="min-w-max flex flex-col items-center justify-center">
          <p>Exchange rate</p>
          <p>{{ exchangeRate }}</p>
        </div>
      </div>

    </div>
    <Button
        :disabled="isButtonDisabled"
        @clicked-button="calculate"
    />
  </div>
</template>

<style scoped>

</style>