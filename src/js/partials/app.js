$(document).ready(() => {
    new TableBuilder({
        elem: '.dynamic-table',
        data: window.TestData,
        columns: [
            'reg_number',
            'device',
            'ignition',
            'speed',
            'fuel_level',
            'mileage'
        ]
    }).init();
});
