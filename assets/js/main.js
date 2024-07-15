const inputAmount = document.querySelector("#converter__input-amount");
const labelResult = document.querySelector("#converter__label-result");
let finalResult = 0;
let data;
let myChart;

// VALIDAR INPUT
inputAmount.addEventListener("input", () => {
    inputAmount.value = inputAmount.value.replace(/[^0-9.]/g, ""); // Elimina caracteres no numéricos
    if (inputAmount.value < 0) {
        inputAmount.value = ""; // No permite valores negativos
    }
});

// FUNCION PARA TRAER DATOS DESDE API
async function fetchCurrencyData() {
    try {
        const res = await fetch("https://mindicador.cl/api");
        data = await res.json();
    } catch (error) {
        document.querySelector("#error").innerHTML = "¡Algo salió mal! Error: Failed to fetch";
    }
    return data;
}

// FUNCION ACTIVADORA DE EVENTOS AL HACER CLIC
async function handleClick() {
    await calculateCurrency();
    await renderChart();
}

// FUNCION PARA CALCULAR VALOR DE MONEDA
async function calculateCurrency() {
    try {
        const currencies = await fetchCurrencyData();
        let currency = document.querySelector("#converter__select-currency").value;

        if (currency === "inicial" || inputAmount.value === "") {
            finalResult = 0;
            labelResult.innerHTML = "...";
            return;
        }

        if (currency === "dolar") {
            finalResult = inputAmount.value / currencies.dolar.valor;
        } else if (currency === "euro") {
            finalResult = inputAmount.value / currencies.euro.valor;
        } else if (currency === "uf") {
            finalResult = inputAmount.value / currencies.uf.valor;
        } else {
            finalResult = 0;
        }

        labelResult.innerHTML = finalResult.toFixed(2);
    } catch (error) {
        labelResult.innerHTML = "Error en la conversión. Por favor, intente de nuevo.";
    }
}

// FUNCIONES PARA GRÁFICO
async function fetchAndCreateChart() {
    let currency = document.querySelector("#converter__select-currency").value;
    let apiUrl = "";

    if (currency === "dolar") {
        apiUrl = "https://mindicador.cl/api/dolar/2024";
    } else if (currency === "euro") {
        apiUrl = "https://mindicador.cl/api/euro/2024";
    } else if (currency === "uf") {
        apiUrl = "https://mindicador.cl/api/uf/2024";
    }

    const res = await fetch(apiUrl);
    const changes = await res.json();
    let info = changes.serie.slice(0, 10).reverse();

    const labels = info.map((change) => {
        return change.fecha.split("T")[0].split('-').reverse().join('-');
    });
    const data = info.map((change) => {
        return change.valor;
    });
    const datasets = [
        {
            label: "Cambio",
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 255, 255, 1)",
            data,
        },
    ];
    return { labels, datasets };
}

async function renderChart() {
    const data = await fetchAndCreateChart();

    if (myChart) {
        myChart.destroy();
    }

    const config = {
        type: "line",
        data,
    };

    const ctx = document.getElementById("chart__canvas").getContext("2d");
    ctx.canvas.style.backgroundColor = "white";
    myChart = new Chart(ctx, config);
}


