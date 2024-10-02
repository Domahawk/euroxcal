export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    let apiVersion = 'tecajn-eur/v3'
    let currencyParam = `&valuta=${body.currencyCode.toUpperCase()}`

    if (!body.dateEur) {
        apiVersion = 'tecajn/v2'
        currencyParam = `&valuta=EUR${currencyParam}`
    }

    const queryParams = `?datum-primjene=${body.date}&${currencyParam}`
    const response = await $fetch(`https://api.hnb.hr/${apiVersion}${queryParams}`);

    return {
        data: response
    };
})