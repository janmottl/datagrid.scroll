var prefix = 'dgscroll-';
var prefixLength = 9;

var datagridOptions = [];
var optionsDefault = {
    tillEndOfPage:  true,
    maxHeight: 0,
    modifyDateRange: false,
    afterHeaderCreation : function () {
    }
};

function setTableHeight(datagrid_name) {
    var sourceTableId = 'snippet-'+datagrid_name+'-table';
    var divTbody = $('div#dgscroll-divbody-'+datagrid_name);
    var extraTableHead = "dgscroll-thead-"   + datagrid_name;
    var extraTableHeadTHeadTr = $('table#'+extraTableHead+' thead tr');
    var maxHeight;

    $(extraTableHeadTHeadTr).each(function () {
        var last = $(this).find('th').last();
        if ($(last).hasClass('dummy')) {
            $(last).remove();
        }
    });

    if (datagridOptions[datagrid_name] && datagridOptions[datagrid_name].tillEndOfPage) {
        var offset = $(divTbody).offset();
        maxHeight = window.innerHeight - offset.top - 60;
    } else if (datagridOptions[datagrid_name] && datagridOptions[datagrid_name].maxHeight) {
        maxHeight = parseInt(datagridOptions[datagrid_name].maxHeight) -  60;
    }

    if (maxHeight !== 'undefined') {
        var scrollbarWidth =  $.position.scrollbarWidth();
        var tableHeight = $('table#'+sourceTableId).outerHeight();

        if (tableHeight > maxHeight) {
            if (scrollbarWidth > 0) {
                $(extraTableHeadTHeadTr).each(function () {
                    $(this).append('<th style="width:'+scrollbarWidth+'px" class="dummy">');
                });
            }
        }

        $(divTbody).attr('style', 'max-height:'+maxHeight+'px');
    }
}

$(window).resize(function() {
    $('div.dgscroll-root').each(function () {
        var datagrid_name = $(this).attr('id').substr('dgscroll-root-'.length);
        setTableHeight(datagrid_name);
    });
});

function createExtraPaging(datagrid_name) {
    var sourceTfootId = 'snippet-'+datagrid_name+'-pagination';
    var extraDivPagingId = 'dgscroll-paging-' + datagrid_name;

    // zrusi se extra paging pri opakovanem volani
    $('div#'+extraDivPagingId).remove();

    // vytvori se znnivu cely div
    $('div#dgscroll-root-'+datagrid_name).append('<div class="dgscroll-paging datagrid" id="'+extraDivPagingId+'">' +
                                                    '<div class="row-grid-bottom"></div></div>');
    var divEl = $('div#'+extraDivPagingId+' div.row-grid-bottom');

    // zkopiruje se paging do extra pagingu
    var tbottom = $('tfoot#'+sourceTfootId+' tr td.row-grid-bottom');
    $(tbottom).children().clone().appendTo(divEl);
    // nastaveni atributu aby se na extra paging nechytal ublabloo datagrid
    var selectPerPage = $(divEl).find('select[name="per_page"]');
    var newId = prefix + $(selectPerPage).attr('id');
    $(selectPerPage).attr('id', newId).removeAttr('select[data-autosubmit-per-page]');
    $(divEl).find('div.col-pagination div a').attr('href', 'javascript:void(0)').removeClass('ajax');
    // skryti puvodniho pagingu
    $(tbottom).closest('tr').addClass('hidden');
}


// pocet radku na stranku se zrcadli do puvodniho pagingu
$(document).on('change', 'div.dgscroll-paging div.col-per-page select[name="per_page"]', function() {
    $('#'+$(this).attr('id').substr(prefixLength)).val($(this).val()).change();
});

// kliknuti na buttony pagigu se zrcadli do puvodniho pagingu
$(document).on('click', 'div.dgscroll-paging div.row-grid-bottom div.col-pagination div a', function() {
    var index = $('div.dgscroll-paging div.row-grid-bottom div.col-pagination div a').index(this);
    var paginationEl = $('td.row-grid-bottom div.col-pagination div').find('a');
    $(paginationEl[index]).click();
});


function createExtraHeader(datagrid_name) {
    var sourceTableId = 'snippet-'+datagrid_name+'-table';

    var extraDivBodyId = 'dgscroll-divbody-' + datagrid_name;
    var extraDivHeadId = "dgscroll-divhead-" + datagrid_name;
    var extraTableHead = "dgscroll-thead-"   + datagrid_name;
    var settingsId     = "dgscroll-settings-"+ datagrid_name;

    $('#'+extraDivBodyId).children().unwrap(); // zrusi se zabaleni tabulky

    var tableEl = $('table#'+sourceTableId);
    if ($(tableEl).find('thead tr').length > 0) {
        $('div#'+extraDivHeadId).remove(); // zrusi se pripadny extra header
        $('div#'+settingsId).remove(); // zrusi se pripadny extra header
    }

    tableEl.removeAttr('style'); // zrusi se table-layout: fixed, aby se dala spocitat sirka
    // Vytvori se extra header
    $(tableEl).closest('div.datagrid').before(
        '<div id="'+settingsId+'" class="dgscroll-settings row form-inline">'+
            '<div class="row-group-actions col-sm-6"></div>'+
            '<div class="settings"></div></div>' +
        '<div id="'+extraDivHeadId+'" class="datagrid dgscroll-divhead">' +
        '   <table id="'+extraTableHead+'" class="table-hover table-striped table-bordered">' +
        '   </table>' +
        '</div>');


    // zkopiruji se hromadne akce
    var source = $(tableEl).find('thead tr.row-group-actions th').children(':not(div.datagrid-toolbar)');
    if (source.length > 0) {
        var clone = $('div#'+settingsId+' div.row-group-actions');
        $(source).clone().prependTo(clone);
        $(clone).prepend('Hromadné akce:');
        $(clone).find('input,select,span').each(function () {
            var tagName = $(this).prop("tagName").toLowerCase();
            if (tagName !== 'span') {
                $(this).removeAttr('data-autosubmit').removeAttr('data-autosubmit-change').removeAttr('data-date-today-highlight').removeAttr('data-nette-rules');
                $(this).attr('data-dgscroll-autosubmit', '');

                var id = $(this).attr('id');
                $(this).attr('id',prefix+id);

                var name = $(this).attr('name');
                if (name && (name !== '')) {
                    $(this).attr('name', prefix+name);
                }

                var label = $('label[for="'+ id +'"]');
                if (label.length > 0 ) {
                    $(label).attr('for', prefix+id);
                }

                if (tagName === 'select') {
                    $(this).attr('data-datagrid-name', datagrid_name);
                }
            }
            $(this).css('margin-left', '5px');
        });
    }

    // zkopiruji se settings
    var source = $(tableEl).find('thead div.datagrid-settings');
    var clone = $('div#'+settingsId+' div.settings');
    $(source).clone().prependTo(clone);
    $(clone).find('div.datagrid-settings ul.dropdown-menu--grid li a').attr('href', 'javascript:void(0)').removeClass('ajax');
    $(clone).find('div.datagrid-settings').addClass('pull-right');

    // zkopiruje se obsah headeru
    source = $(tableEl).find('thead');
    clone = $("table#"+extraTableHead);
    // reseni chyby jquery, kdy se neprenasi stav selectu
    $(source).clone().appendTo(clone);
    $(source).find("select").each(function(i) {
        var select = this;
        $(clone).find("select").eq(i).val($(select).val());
    });
    $(clone).find('thead tr:not(.row-group-actions) input,select').each(function () {
        $(this).removeAttr('data-autosubmit').removeAttr('data-autosubmit-change').removeAttr('data-date-today-highlight');
        $(this).attr('data-dgscroll-autosubmit', '');

        var id = $(this).attr('id');
        $(this).attr('id',prefix+id);

        var label = $('label[for="'+ id +'"]');
        if (label.length > 0 ) {
            $(label).attr('for', prefix+id);
        }
    });

    if ((typeof datagridOptions[datagrid_name]['modifyDateRange'] !== 'undefined') && datagridOptions[datagrid_name].modifyDateRange) {
        dateRangeReset(datagrid_name);
    }
    datagridOptions[datagrid_name].afterHeaderCreation.call($("table#"+extraTableHead+' thead tr:not(.row-group-actions):eq(1)'));

    // obsah tabulky se zabali do divu
    $(tableEl).wrap('<div class="dgscroll-divbody" id="'+extraDivBodyId+'">');
    // puvodni header se skryje
    $(tableEl).find('thead tr').addClass('hidden');
    $(tableEl).find('thead tr').find('input[data-autosubmit]').attr('data-autosubmit-change','');

    var extraHeader = $("table#"+extraTableHead+" thead");
    // prvni radek s row-group-actions je treba zrusit, protoze by delal problemy pri table-layout:fixed
    // prohlizec bere pro rozmery prvni radek
    $(extraHeader).find('tr.row-group-actions').remove();
    // pri opakovenem spusteni muze byt zdrojovy radek hidden
    $(extraHeader).find('tr').removeClass('hidden');

    // do prvniho radek extra headeru a originalu se nastavi sirky
    // pri zmenach to prestalo vracet spravne hodnoty sirky
    $(tableEl).removeClass('table');
    var extraFirstRowTh = $(extraHeader).find('tr').eq(0).find('th');
    var tableFirstRowTh = $('table#'+sourceTableId+' thead').find('tr:not(.row-group-actions)').eq(0).find('th');
    for (i=0; i< extraFirstRowTh.length; i++) {
        var extraThWidth = $(extraFirstRowTh[i]).outerWidth();
        $(extraFirstRowTh[i]).attr('data-width', extraThWidth);
        $(tableFirstRowTh[i]).attr('data-width', extraThWidth);
    }

    // Extra header se scroluje horizontalne podle obsahu tabulky
    $('#'+extraDivBodyId).scroll(function () {
        $('#'+extraDivHeadId).scrollLeft($(this).scrollLeft());
    });
}

function resizeTable(datagrid_name) {
    var sourceTableId = 'snippet-'+datagrid_name+'-table';
    var extraDivHeadId = "dgscroll-divhead-" + datagrid_name;
    var extraDivBodyId = 'dgscroll-divbody-' + datagrid_name;
    var extraTableHead = "dgscroll-thead-"   + datagrid_name;

    var tableEl = $('table#'+sourceTableId);
    $(tableEl).removeClass('table').removeAttr('style'); // zrusi se table-layout: fixed, aby se dala spocitat sirka
    $(extraTableHead).removeAttr('style').removeClass('table');

    // prvni radek extra headeru se vymeni za original, aby byly k dispozici resety filtru
    var extraThead = $('table#'+extraTableHead+' thead');
    $(extraThead).find('tr:eq(0)').remove();
    var source = $('table#'+sourceTableId+' thead').find('tr:not(.row-group-actions):eq(0)');
    $(source).clone().prependTo(extraThead);
    $(extraThead).find('tr:not(.row-group-actions) a').each(function () {
        // linky se odstrani a schovaji se do data-dgscroll-href
        var href = $(this).attr('href');
        if (href && (href !== '')) {
            $(this).attr('href', 'javascript:void(0)').removeClass('ajax').attr('data-dgscroll-href', href);
        }
    });

    // prvni radek extra headeru
    var extraFirstRow = $(extraThead).find('tr:eq(0)');
    $(extraFirstRow).removeClass('hidden');
    var extraFirstRowTh = $(extraFirstRow).find('th');
    // prvni radek obsahu tabulky
    var contentFirstRowTd = $(tableEl).find('tbody tr:not(.hidden)').first().find('td');

    var dataNotFound = $(contentFirstRowTd[0]).attr('colspan');

    if (!dataNotFound) {
        // projde se extra header a tabulka
        // v tabulce se ve sloupci najde nejsirsi hodnota. Porovna se se sirkou sloupce a vybere se nejsirsi.
        // nejvetsi sirka se nastavi do stylu v extra headeru a prvniho radku tabulky
        //
        for (i=0; i< extraFirstRowTh.length; i++) {
            var extraThWidth = parseInt($(extraFirstRowTh[i]).attr('data-width'));
            var tableTdWidth = $(contentFirstRowTd[i]).outerWidth() + 6;
            var maxWidth = 0;
            if (extraThWidth > tableTdWidth) {
                maxWidth = extraThWidth;
            } else {
                maxWidth = tableTdWidth;
            }
            $(contentFirstRowTd[i]).attr('style', 'width:'+maxWidth+'px');
            $(extraFirstRowTh[i]).attr('style', 'width:'+maxWidth+'px');
        }

        // extra headru a tabulce se nastavi table-layout:fixed a nastavi se celkova sirka
        $(tableEl).attr('style', 'table-layout: fixed;').addClass('table');
        $("table#"+extraTableHead).attr('style', 'table-layout:fixed;').addClass('table');
    } else {
        for (i=0; i< extraFirstRowTh.length; i++) {
            var extraThWidth = $(extraFirstRowTh[i]).attr('data-width');
            $(extraFirstRowTh[i]).attr('style', 'width:'+extraThWidth+'px');
        }
        $(tableEl).addClass('table');
        $("table#"+extraTableHead).addClass('table');
    }

    setTableHeight(datagrid_name);
}

// drop-down zapnuti/vypnuti sloupce
$(document).on('click','div.dgscroll-settings div.settings ul.dropdown-menu--grid a', function () {
 var index = $('div.dgscroll-settings div.settings ul.dropdown-menu--grid a').index(this);
    var settingsId = $(this).closest('div.dgscroll-settings').attr('id');
    var settingsPrefix = 'dgscroll-settings-';
    var datagrid_name = settingsId.substr(settingsPrefix.length);
    var sourceTableId = 'snippet-'+datagrid_name+'-table';
    $($('table#'+sourceTableId+' thead tr.row-group-actions div.datagrid-settings ul.dropdown-menu--grid a')[index]).click();
});


//
$(document).on('click', '.dgscroll-divhead thead tr:eq(0) a', function () {
    var href = $(this).attr('data-dgscroll-href');
    if (href && (href !== '')) {
        var tableId = $(this).closest('table').attr('id');
        var tablePrefix = 'dgscroll-thead-';
        var datagrid_name = tableId.substr(tablePrefix.length);
        var sourceTableId = 'snippet-'+datagrid_name+'-table';
        $('table#'+sourceTableId+' thead tr:not(.row-group-actions) a[href="'+href+'"] ').click();
    }
});

// zmena filtru
$(document).on('change', 'select[data-dgscroll-autosubmit], input[data-dgscroll-autosubmit]', function() {
    $('#'+$(this).attr('id').substr(prefixLength)).val($(this).val()).trigger('change');
}).on('keyup', 'input[data-dgscroll-autosubmit]', function(e) {
    var code;
    code = e.which || e.keyCode || 0;
    if ((code !== 13) && ((code >= 9 && code <= 40) || (code >= 112 && code <= 123))) {
        return;
    }
    $('#'+$(this).attr('id').substr(prefixLength)).val($(this).val()).trigger('change');
});

// hromadne akce
//
function groupCounterRefresh (datagrid_name) {
    var checked_inputs, select, input, counter, total;
    if (datagrid_name) {
        checked_inputs = document.querySelectorAll('input[data-check-all-' + datagrid_name + ']:checked');
        select = document.querySelector('#dgscroll-frm-' + datagrid_name + '-filter-group_action-group_action');
        input = $('input#dgscroll-' + datagrid_name.toLowerCase() + 'group_action_submit');
        if (select) {
            counter = $(input).next('span');
            if (checked_inputs.length) {
                select.disabled = false;
                total = document.querySelectorAll('input[data-check-all-' + datagrid_name + ']').length;
                if (counter.length) {
                    $(counter).text(checked_inputs.length + '/' + total);
                }
            } else {
                select.value = "";
                select.disabled = true;
                $(select).trigger('change');
                if (counter.length) {
                    $(counter).text('');
                }
            }
        }
    }
}

document.addEventListener('change', function(e) {
    groupCounterRefresh(e.target.getAttribute('data-check'));
});

$(document).on('change', 'select[name="dgscroll-group_action[group_action]"]', function() {
    var value = $(this).val();
    var datagrid_name = $(this).attr('data-datagrid-name');
    var input = $('input#dgscroll-' + datagrid_name.toLowerCase() + 'group_action_submit');

    if ((value === 'undefined') || (value === '')) {
        $(input).css('display', 'none');
    } else {
        $(input).css('display', '');
    }

    $('#'+$(this).attr('id').substr(prefixLength)).val(value).trigger('change');
}).on('click', 'input[name="dgscroll-group_action[submit]"]', function () {
    $('#'+$(this).attr('id').substr(prefixLength)).trigger('click');
});

// kliknuti na novy zaznam
$(document).on('click', 'div.dgscroll-settings div.datagrid-settings a[data-datagrid-toggle-inline-add="true"]', function() {
    var settingsId = $(this).closest('div.dgscroll-settings').attr('id');
    if (settingsId && (settingsId !== '')) {
        var settingsPrefix = 'dgscroll-settings-';
        var datagrid_name = settingsId.substr(settingsPrefix.length);
        var sourceTableId = 'snippet-'+datagrid_name+'-table';
        $('table#'+sourceTableId+' thead div.datagrid-settings a[data-datagrid-toggle-inline-add="true"]').click();
        var _this = this;
        return window.dgscroll_timer = setTimeout((function(_this) {
            resizeTable(datagrid_name);
        })(this), 200);
    }
});

function dateRangeReset(datagrid_name) {
    var extraTableHead = "dgscroll-thead-"   + datagrid_name;

    // zruseni nastaveni date z Ublabloo a prestaveni na vlastni
    var dateRangeDiv = $('table#'+extraTableHead).find('div.datagrid-col-filter-date-range');
    $(dateRangeDiv).find('div.input-group').removeClass('input-group');
    $(dateRangeDiv).find('div.input-group-addon.datagrid-col-filter-datte-range-delimiter').remove();
    $(dateRangeDiv).find('input[data-provide="datepicker"]')
        .removeAttr('data-provide').removeAttr('data-date-orientation').removeAttr('data-date-format').removeAttr('data-date-autoclose')
        .attr('data-dgscroll-autosubmit', '')
        .each(function () {
            var group = $(this).add($(this).next());
            $(group).wrapAll('<div class="date">').first('div').parent().after('<br>');
        });
    $(dateRangeDiv).find('div.date').addClass(' input-group');
    baseControlsInit('table#'+extraTableHead+' div.datagrid-col-filter-date-range');
}


function datagrid_scroll(datagrid_name, options) {
    var resultOptions = optionsDefault;
    if (options) {
        if (typeof options['tillEndOfPage'] !== 'undefined') {
            resultOptions.tillEndOfPage = options.tillEndOfPage;
        }
        if (typeof options['modifyDateRange'] !== 'undefined') {
            resultOptions.modifyDateRange = options.modifyDateRange
        }
        if (typeof options['afterHeaderCreation'] !== 'undefined') {
            resultOptions.afterHeaderCreation = options.afterHeaderCreation;
        }
        if (typeof options['maxHeight'] !== 'undefined') {
            resultOptions.maxHeight = options.maxHeight;
        }
    }
    datagridOptions[datagrid_name] = resultOptions;

    // zabalit do divu
    $('div.datagrid.datagrid-'+datagrid_name).wrapAll('<div class="dgscroll-root" id="dgscroll-root-'+datagrid_name+'">');
    createExtraHeader(datagrid_name);
    createExtraPaging(datagrid_name);
    resizeTable(datagrid_name);
}


$.nette.ext('datagrid.handling', {
    success: function(payload) {
        var datagrid_name = '';

        if (payload._datagrid_inline_editing) {
            /*
            _datagrid_name
            _datagrid_inline_editing: true
            _datagrid_redraw_item_id: 1 // tato polozka bude zeditovana
            */
            datagrid_name = payload._datagrid_name;
            resizeTable(datagrid_name);
        } else if (payload._datagrid_inline_edited) {
            /*
            _datagrid_name
            _datagrid_inline_edited: "2"  // tato polozka byla zeditovana
            */
            datagrid_name = payload._datagrid_name;
            createExtraHeader(datagrid_name);
            createExtraPaging(datagrid_name);
            resizeTable(datagrid_name);
        } else if (payload._datagrid_inline_edit_cancel) {
            /*
            _datagrid_name
            _datagrid_inline_edit_cancel: "4"
             */
            datagrid_name = payload._datagrid_name;
            resizeTable(datagrid_name);
        } else if (payload._datagrid_inline_added) {
            /*
                _datagrid_name
                _datagrid_inline_added: true
             */
            datagrid_name = payload._datagrid_name;
            createExtraPaging(datagrid_name);
            resizeTable(datagrid_name);
        }  else {
            var processCreate = false;
            var processResize = false;

            if (payload && payload.snippets) {
                Object.keys(payload.snippets).forEach(function(snippet,index) {
                    if ((snippet.indexOf('-table') !== -1) || (snippet.indexOf('-grid') !== -1)) {
                        processCreate = true;
                    } else if (snippet.indexOf('-tbody') !== -1) {
                        processResize = true;
                    }

                    if (datagrid_name.length === 0) {
                        var name = snippet.replace('snippet-', '');
                        var index = name.indexOf('-');
                        if (index !== -1) {
                            datagrid_name = name.substr(0, index);
                        }
                    }
                });
            }

            if (processCreate) {
                createExtraHeader(datagrid_name);
                createExtraPaging(datagrid_name);
                resizeTable(datagrid_name);
                groupCounterRefresh(datagrid_name);
            } else if (processResize) {
                createExtraPaging(datagrid_name);
                resizeTable(datagrid_name);
                groupCounterRefresh(datagrid_name);
            }
        }
    }});
