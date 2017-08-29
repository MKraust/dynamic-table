class TableBuilder {

    constructor(settings) {
        // Элемент, в котором будет располагаться таблица
        this.elem = $('elem' in settings ? settings.elem : '.dynamic-table');

        // Собственно, сам элемент таблицы
        this.table = null;

        // Массив с данными
        this.data = 'data' in settings ? settings.data : [];

        // Массив с отфильтрованными данными
        this.buffer = this.data;

        // Столбцы
        this.columns = 'columns' in settings ? settings.columns : [];
    }

    // Инициализация таблицы. Генерация HTML, заполнение данными и регистрация событий
    init() {
        this.drawTable();
        this.fillTable();
        this.registerEvents();
    }

    // Регистрация событий
    registerEvents() {
        // Ссылка на текущий экземпляр класса TableBuilder для использования внутри callback'ов
        const self = this;

        // Реализация задержки
        const delay = (() => {
            let timer = 0;
            return (callback) => {
                clearTimeout(timer);
                timer = setTimeout(callback, 300);
            }
        })();

        $('#dtSearch').keydown(function(e) {
            const input = $(this);
            if (e.which === 13) {
                self.filter(input.val());
                return;
            }

            delay(() => {
                if (input.val() === '') self.resetTable();
                self.filter(input.val());
            });
        });
    }

    // Генерация HTML-кода пустой таблицы
    drawTable() {
        $(this.elem.append(`
            <input type="text" placeholder="Поиск" id="dtSearch">
            <table class="dt" border="1">
                <thead>
                    <tr>` + this.drawColumns() + `</tr>
                </thead>
                <tbody></tbody>
            </table>
        `));

        this.table = this.elem.find('.dt');
    }

    // Генерация HTML-кода столбцов таблицы
    drawColumns() {
        let html = '';
        for (let i = 0; i < this.columns.length; i++) {
            html += '<th>' + this.columns[i] + '</th>';
        }

        return html;
    };

    // Генерация HTML-кода строк для всех объектов в буфере
    drawRowsFromBuffer() {
        let html = '';
        for(let i = 0; i < this.buffer.length; i++) {
            html += this.drawRow(this.buffer[i]);
        }

        return html;
    }

    // Генерация HTML-кода строки для переданного в функцию объекта
    drawRow(obj) {
        let html = '<tr>';
        for(let i = 0; i < this.columns.length; i++) {
            html += '<td>' + obj[this.columns[i]] + '</td>';
        }
        html += '</tr>';

        return html;
    }

    // Отображение всех исходных данных в таблице
    resetTable() {
        this.buffer = this.data;
        this.fillTable();
    }

    // Очистка таблицы от строк
    clearTable() {
        this.table.find('tbody').empty();
    }

    // Заполнение таблицы данными из буфера
    fillTable() {
        this.clearTable();
        this.table.find('tbody').append(this.drawRowsFromBuffer());

        // Регистрация события по клику (выделение серым) для каждой cтроки
        $('.dt > tbody > tr').click(function () {
            $('.dt > tbody > tr.selected').each(function (i, elem) {
                $(elem).toggleClass('selected');
            });
            $(this).toggleClass('selected');
        });
    }

    // Фильтрация данных
    filter(str) {
        this.fillBuffer(this.search(str));
        this.fillTable();
    }

    // Поиск совпадений подстроки с данными в массиве this.data
    search(str) {
        const indexes = [];

        // Проверка на наличие знака ^ в начале строки
        // Если есть, то поиск будет производиться только в начале перебираемых строк
        if(str.indexOf('^') === 0) {
            // Перебор всех объектов в this.data
            for(let i = 0; i < this.data.length; i++) {
                // Перебор отображаемых св-в объекта
                for(let n = 0; n < this.columns.length; n++) {
                    // Приведение значения св-ва объекта к строке в нижнем регистре и поиск подстроки
                    let result = String(this.data[i][this.columns[n]]).toLowerCase().indexOf(str.substr(1).toLowerCase());
                    if (result === 0) {
                        indexes.push(i);
                        break;
                    }
                }
            }
        } else {
            for(let i = 0; i < this.data.length; i++) {
                for(let n = 0; n < this.columns.length; n++) {
                    let result = String(this.data[i][this.columns[n]]).toLowerCase().indexOf(str.toLowerCase());
                    if (result >= 0) {
                        indexes.push(i);
                        break;
                    }
                }
            }
        }

        return indexes;
    }

    // Заполняет буфер данными из this.data по массиву с индексами
    fillBuffer(array) {
        this.buffer = [];
        for(let i = 0; i < array.length; i++) {
            this.buffer.push(this.data[array[i]]);
        }
    }
}
