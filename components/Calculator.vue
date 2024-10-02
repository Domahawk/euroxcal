<script setup lang="ts">
import {ref, computed, Ref} from "vue";
import Big from "big.js";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {format} from "date-fns";
import CurrencyPicker from "./CurrencyPicker.vue";
import Button from "./Button.vue";

type Amount = {
  currency: String,
  value: Number,
}

type ExchangeRate = {
  currency: String,
  value: Number,
}

const askCurrencyAmount: Ref<Number | String | null> = ref(null);
const currency: Ref<String> = ref("");
const exchangeRates: Ref<Array<ExchangeRate>> = ref([]);
const date: Ref<Date | null> = ref(null);
const calculatedAmounts: Ref<Array<Amount>> = ref([]);
const apiResponse: Ref<String> = ref(null);
const DPTextInputOptions = {
  enterSubmit: true,
  format: "dd-MM-yyyy"
};

const dateEur = computed(() => {
  return date.value?.getFullYear() > 2022
});

const isButtonDisabled = computed(() => {
  return askCurrencyAmount.value === null || date.value === null;
});

const onBlur = () => {
  if (askCurrencyAmount.value === null || askCurrencyAmount.value === "") {
    askCurrencyAmount.value = null;
    amountInEuros.value = [];

    return;
  }

  askCurrencyAmount.value = new Big(askCurrencyAmount.value).toFixed(2);
};

const calculate = async () => {
  exchangeRates.value = [];
  calculatedAmounts.value = [];

  let response = await $fetch('/api/hnb', {
    method: 'POST',
    body: {
      currencyCode: currency.value,
      date: format(date.value, 'yyyy-MM-dd'),
      dateEur: dateEur.value,
    }
  });

  apiResponse.value = response.data
  let amount: Big = new Big(askCurrencyAmount.value);

  if (!dateEur.value) {
    let rate = getExchangeRate(response.data, currency.value.toUpperCase())

    exchangeRates.value.push({currency: 'To KN', value: rate});
    amount = calculateCurrencyToKn(amount, rate);
    calculatedAmounts.value.push({currency: 'Amount in KN', value: amount})
  }

  let toEurER = getExchangeRate(response.data, dateEur.value ? currency.value.toUpperCase() : 'EUR');

  exchangeRates.value.push({currency: 'To EUR', value: toEurER})
  calculatedAmounts.value.push({currency: 'Amount in EUR', value: amount.div(toEurER).toFixed(2)})
};

const calculateCurrencyToKn = (askCurrencyAmount: Big, exchangeRate: Number): Big => {
  return askCurrencyAmount.times(exchangeRate);
}

const getExchangeRate = (responseData: array, toCurrency: String): Object => {
  let exchangeRate = responseData.find((item: Object): Object => item.valuta === toCurrency).srednji_tecaj;

  return parseFloat(exchangeRate.replace(/,/g, "."));
}

</script>

<template>
  <div class="min-w-max flex flex-col items-center justify-center min-h-[100px] bg-[--warning-color]">
    <H2>Dates before year 2023 will calculate the amount from asked currency to KN then from KN to EUR</H2>
  </div>
  <div class="min-h-screen min-w-max mt-[30px] flex flex-col">
    <div class="min-w-max min-h-max flex m-[20px]">

      <div
          class="w-1/2 h-[500px] p-[50px] m-[50px] flex flex-col items-center justify-between bg-[--light-bg-color] rounded-md">
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

      <div
          class="w-1/2 h-[500px] p-[50px] m-[50px] flex flex-col items-center justify-center bg-[--light-bg-color] rounded-md">
        <div class="flex flex-col justify-around items-center">
          <p>Calculation</p>

          <p v-for="amount in calculatedAmounts"> {{ amount.currency }} - {{ amount.value }}</p>
        </div>
        <div class="min-w-max flex flex-col items-center justify-center">
          <p>Exchange rate</p>
          <p v-for="exRate in exchangeRates"> {{ exRate.currency }} - {{ exRate.value }} </p>
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