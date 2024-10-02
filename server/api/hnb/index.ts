export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const queryParams = `?datum-primjene=${body.date}&valuta=${body.currencyCode.toUpperCase()}`

    const response = await $fetch(`https://api.hnb.hr/tecajn-eur/v3${queryParams}`)

    return {
        data: response
    };
})