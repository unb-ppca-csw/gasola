/**
 *
 * @author Gasola <contato@gasola.com.br>
 * @copyright Gasola 2018
 * @licence GNU General Public License (GPL)
 */


/**
 * General Config & Init Variables
 */
var app = null;
var configView = null;
var contactView = null;
var locale = 'pt-BR';
var config_show = 'map';
var __ = '';
var token = '';
var user = null;
var gas_station = new Array();
var searchbar = null;


/**
 *
 * Get data from localStorage / Browser
 */
var locastorage = JSON.stringify(localStorage.getItem("f7form-frm-config") );
console.log('- Get locale');


/**
 *
 * Get and set user language
 */
if (locastorage != 'null') {
    locale = JSON.parse(localStorage['f7form-frm-config']).config_lang;
    config_show = JSON.parse(localStorage['f7form-frm-config']).config_show;
    console.log('- Set locale');
}


/**
 *
 * Prevents screen freeze
 */
setInterval(function () {
    if ( $('#gig').css('display') == 'block' ) {
        location.reload();
    }
}, 10000);


/**
 *
 * Get JSON language
 */
$.ajax({
    url: "i18n/" + locale + ".json?nocache="+ (new Date()).getTime(),
    dataType: 'json',
    timeout: 3000,
    cache: false,
    success: function (data) {
        console.log('- Get json');
        /**
         * Do App Translation (i18n)
         */
        $.each(data, function (index1, value1) {
            $.each(value1, function (index2, value2) {
                var lang = index1 + '.' + index2;
                var pattern = '/{{' + lang + '}}/g';
                var NewHTML = $('#app').html().replace(eval(pattern), value2);
                $('#app').html(NewHTML);
                __ += ', "' + index1 + '_' + index2.replace(/\./g , '_') + '"' + ':"' + value2 + '"';
            });
        });
        console.log('- Run html translate');
        __ = JSON.parse('{' + __.substr(2) + '}');
        console.log('- Set js translate');
        /**
         * Start App Object
         */
        app = initApp();
        //mainView =  app.views.create('.view-main');
        configView = app.views.create('.view-config');
        //listView = app.views.create('.view-list');
        contactView = app.views.create('.view-contact');
        //  var registerView = app.views.create('.view-register');

        var panel = app.panel.create({
            el: '.panel-right',
        })

        $$ = Dom7;
        console.log('- Init app');

        /**
         * Check if user is logged
         */
        user = JSON.parse(localStorage.getItem("user"));

        //    app.dialog.alert(localStorage.getItem("user"));
        //

        if (user == null) {
            //app.loginScreen.open('.login-screen');
            app.popup.open('.popup-notlogged');
            setTimeout(function () {
                showMessage(__.message_notice, __.message_login_required, 3500);
            }, 1000);
            $('#btn-login').show();
            $('#btn-logout').hide();
        //    $('#box-register').show();
        }
        else {
          //   app.dialog.alert('USER' + user.nome);
            $('#btn-login').hide();
            $('#btn-logout').show();
            $('#lb-username').html(user.nome);
          //  $('#box-register').hide();
        }


        /**
         * Popup register close
          */
        $$('#btn-popup-register-close').on('click', function () {
            //app.dialog.alert('CLOSE');
            app.popup.close('.popup-register');
        });

        /**
         * Popup forgot pwd close
         */
        $$('#btn-popup-forgot-close').on('click', function () {
            //app.dialog.alert('CLOSE');
            app.popup.close('.popup-forgot');
        });

        /**
         * Popup update pwd close
         */
        $$('#btn-popup-updatepwd-close').on('click', function () {
            //app.dialog.alert('CLOSE');
            app.popup.close('.popup-updatepwd');
        });

        /**
         * Popup privacy close
         */
        $$('#btn-popup-privacy-close').on('click', function () {
            //app.dialog.alert('CLOSE');
            app.popup.close('.popup-privacy');
        });

        /**
         * Popup report close
         */
        $$('#btn-popup-report-close').on('click', function () {
            //app.dialog.alert('CLOSE');
            $('#frm-report')[0].reset();
            app.popup.close('.popup-report');
        });

        /**
         * Popup contact close
         */
        $$('#btn-popup-contact-close').on('click', function () {
            //app.dialog.alert('CLOSE');
            app.popup.close('.popup-contact');
        });

        /**
         * Logout
         */
        $$('#btn-logout').on('click', function () {
            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/logoff',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "token": user.token
                }),
                success: function (data) {

                },
                error: function (request, status, error) {

                }
            }); // end ajax login

            localStorage.removeItem('user');
            location.reload();
        });


        /**
         * Show Map or List
         */
        if (config_show == 'map') {
            getViewMap();
            console.log('- Show map');
        }
        else {
            getViewList();
            console.log('- Show list');
        }

        /**
         * Init Google Maps
         */
        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB83BPveU38_iZm4Wg1Gb_LiTKhFc0lWOQ&libraries=places&language=' + locale, function () {
            var map = initMap();
            //      setTimeout(function () {
            //        initAutocomplete(map);
            //     }, 2000);
        });
        console.log('- Init map');

        /**
         * Show Maps Search Field
         */
        // setTimeout(function () {
        //     $('#pac-input').fadeIn();
        // }, 4000);

        /**
         * App Apresentation Screen
         */
        $(function () {
            setTimeout(function () {
                $('#gig').fadeOut(600);
            }, 2000);
        });

        /**
         * Get Config Default from Local Storage
         */
        var formData = app.form.convertToData('#frm-config');

        /**
         * Save Config in Local Storage
         */
         $$('#btn-apply-config').on('click', function () {
            app.form.fillFromData('#frm-config', JSON.stringify($('#frm-config').serializeArray()));
            showMessage(__.message_notice, __.message_success);
            if (locale == $("#frm-config select[name=config_lang]").val()) {
                var map = initMap();
                // $('#map-search').html('<input id="pac-input" class="controls" type="text" placeholder="Buscar" style="display:block;">');
                // setTimeout(function () {
                //     initAutocomplete(map);
                // }, 1000);
            }
            else {
                app.dialog.confirm(__.message_reload + '<h3>' + __.message_confirm + '</h3>', function () {
                    location.reload();
                });
            }
        });

        // create searchbar list gas station
        searchbar = app.searchbar.create({
            el: '.searchbar',
            searchContainer: '.list',
            searchIn: '.item-inner'
            });

        // Event close panel right
        app.on('panelOpened', function (panel) {
            //console.log('Panel ' + panel.side + ': closed');

            //searchbar.clear();
            //searchbar.toggle();
            searchbar.disable();
        });



        // REGISTER
        $$('#btn-register').on('click', function () {
            if (!$('#cbx-privacy').is(':checked')) {
                app.dialog.alert(__.message_privacy_failure);
                return false;
            }
            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/criaUsuario',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({"nome": $('#register-name').val(), "email": $('#register-email').val(), "senha" : $('#register-password').val()}),
                success: function (data) {
                    if (data == false) {
                        showMessage(__.message_notice, __.register_failure);
                    }
                    else {
                        app.dialog.alert(__.register_success);
                        app.popup.close('.popup-register');
                    }
                },
                error: function (request, status, error) {
                    showMessage(__.message_notice, __.register_failure);
                }
            }); // end ajax login
        });

        // LOGIN
        $$('#btn-signin').on('click', function () {

            if ($('#email').val() == '' || $('#password').val() == '') {
                showMessage(__.message_notice, __.login_failure);
                return false;
            }
            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/login',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({'email': $('#email').val(), 'senha' : $('#password').val()}),
                success: function (data) {



                    if (data.status == 1) {
                        showMessage(__.message_notice, __.login_failure_unregistered);
                        return false;
                    }
                    else if (data.status == 2) {
                        showMessage(__.message_notice, __.login_failure_unactivated);
                        return false;
                    }
                    else if (data.status == 3) {
                        showMessage(__.message_notice, __.login_failure_password);
                        return false;
                    }
                    else if (data.status == 4) {
                        localStorage.setItem("user", JSON.stringify(data));
                        location.reload();
                    }
                    else {
                        showMessage(__.message_notice, __.login_failure);
                    }

                    //app.dialog.alert(data);

                },
                error: function (request, status, error) {
                    showMessage(__.message_notice, __.login_failure);
                }
            }); // end ajax login
        });


        $('#bt-show-map').on('click', function (e) {
            e.preventDefault();
            panel.close();
            getViewMap();
            app.form.storeFormData('#frm-config', $("#frm-config").serializeToJSON());
            // return false;
        });

        $('#bt-show-list').on('click', function (e) {
            e.preventDefault();
            panel.close();
            getViewList()
            app.form.storeFormData('#frm-config', $("#frm-config").serializeToJSON()   );
            //  return false;
        });

        // FORGOT PWD
        $$(document).on('click', '#btn-forgot', function () {
            if ($('#forgot-email').val() == '') {
                showMessage(__.message_notice, __.forgot_fill_email);
                return false;
            }
            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/recuperaSenha',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({'email' : $('#forgot-email').val()}),
                success: function (data) {
                    //app.dialog.alert(data);
                    if (data == false) {
                        showMessage(__.message_notice, __.forgot_failure);
                    }
                    else {
                        app.dialog.alert(__.forgot_success);
                        app.popup.close('.popup-forgot');
                    }
                },
                error: function (request, status, error) {
                    showMessage(__.message_notice, __.forgot_failure);
                }
            }); // end ajax forgot pwd
        });

        // UPDATE PWD
        $$(document).on('click', '#btn-updatepwd', function () {
            if ($('#updatepwd-old').val() == '' || $('#updatepwd-new').val() == '' || $('#updatepwd-again').val() == '') {
                showMessage(__.message_notice, __.updatepwd_fill_requered);
                return false;
            }

            if ($('#updatepwd-new').val() != $('#updatepwd-again').val()) {
                showMessage(__.message_notice, __.updatepwd_not_match);
                return false;
            }

            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/atualizaSenha',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "senhaAntiga" : $('#updatepwd-old').val(),
                    "senhaNova" : $('#updatepwd-new').val(),
                    "token": user.token
                }),
                success: function (data) {
                    //app.dialog.alert(data);
                    if (data == false) {
                        showMessage(__.message_notice, __.updatepwd_failure);
                    }
                    else {
                        app.dialog.alert(__.updatepwd_success);
                        app.popup.close('.popup-updatepwd');
                    }
                },
                error: function (request, status, error) {
                    showMessage(__.message_notice, __.updatepwd_failure);
                }
            }); // end ajax update pwd
        });

        // REPORT LOAD
      //  $('.money').mask("0.000");
        $$(document).on('click', '[id^="report_"]', function () {

            $('#gasstation-id').val( $(this).data('id'));
            $('#lb-report-price-g').html( '' + parseFloat((gas_station[$(this).data('id')].price_g)).toFixed(3) + '' );
            $('#lb-report-price-e').html( '' + parseFloat((gas_station[$(this).data('id')].price_e)).toFixed(3) + '');
            $('#lb-report-price-d').html( '' + parseFloat((gas_station[$(this).data('id')].price_d)).toFixed(3) + '');


            $('#report-gasstation-id').val( $(this).data('id') );
            // var text = '<div class="item-title"><strong>' + gas_station[$(this).data('id')].name + '</strong></div>' +
            //     '<div class="item-title">' + gas_station[$(this).data('id')].brand + '</div>' +
            //     '<div class="item-title">' + gas_station[$(this).data('id')].address + '</div>' ;
            // $('#gs_info_box').html( '<div class="block">' + text + "</div>" );
            // // app.dialog.alert('id: ' + $(this).data('id'));
        });

        // REPORT SUBBMIT
        $$(document).on('click', '#btn-report', function () {
            var frm_data = $('#frm-report').serializeToJSON();

            if (frm_data.report_price_g == null && frm_data.report_price_e == null && frm_data.report_price_g == null)
                return false;

            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/avaliaPreco',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    'g': frm_data.report_price_g,
                    'e': frm_data.report_price_d,
                    'd': frm_data.report_price_e,
                    'idPosto': $('#report-gasstation-id').val(),
              //      'idUsuario': user.id,
                    'token': user.token
                }),
                success: function (data) {
                    //app.dialog.alert(data);
                    if (data == false) {
                        showMessage(__.message_notice, __.report_failure);
                    }
                    else {
                        // app.dialog.alert(__.report_success);

                        $('#frm-report')[0].reset();
                        app.popup.close('.popup-report');


                        //app.dialog.alert("->"+frm_data.report_price_g+"<- ->"+frm_data.report_price_e+"<- ->"+frm_data.report_price_d+"<-");


                        if ( (frm_data.report_price_g != null &&  "1234".indexOf(frm_data.report_price_g) != -1) || (frm_data.report_price_g != null && "1234".indexOf(frm_data.report_price_e) != -1)  || (frm_data.report_price_g != null && "1234".indexOf(frm_data.report_price_d) != -1) ) {
                            app.dialog.confirm(__.report_success + '<br /><strong>' + __.report_ask_update_price + '</strong>', function () {
                                app.popup.open('.popup-price-update');
                            });
                        }
                        else {
                            app.dialog.alert(__.report_success);
                        }

                    }
                },
                error: function (request, status, error) {
                    showMessage(__.message_notice, __.report_failure);
                }
            }); // end ajax report

        });


        // CONTACT SUBBMIT
        $$(document).on('click', '#btn-contact', function () {

            if ($('#contact-message').val() == '') {
                showMessage(__.message_notice, __.updatepwd_fill_requered);
                return false;
            }

            $.ajax({
                type: "POST",
                url: 'https://gasola.com.br/rest/contato',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    'assunto': $('#contact-subject').val(),
                    'mensagem': $('#contact-message').val(),
                    'idUsuario': user.id,
                    'token': user.token
                }),
                success: function (data) {
                    //app.dialog.alert(data);
                    if (data == false) {
                        showMessage(__.message_notice, __.contact_failure);
                    }
                    else {
                        app.dialog.alert(__.contact_success);
                        $('#frm-contact')[0].reset();
                        app.popup.close('.popup-contact');
                    }
                },
                error: function (request, status, error) {
                    showMessage(__.message_notice, __.contact_failure);
                }
            }); // end ajax report
        });

        // PRICE UPDATE
        $('.money').mask("0.000");
        $$(document).on('click', '[id^="pop_"]', function () {
            // Setar popup com os valores do posto aberto
            $('#frm-price-update').each (function(){
                this.reset();
            });

            var price_date_g =  '';
            if (gas_station[$(this).data('id')].price_g > 0) {
                var d = (gas_station[$(this).data('id')].date_g + "T00:00:00+00:00").slice(0, 10).split('-');
                price_date_g = ', ' + d[2] + '/' + d[1] + '/' + d[0];
            }
            var price_date_e =  '';
            if (gas_station[$(this).data('id')].price_e > 0) {
                var d = (gas_station[$(this).data('id')].date_e + "T00:00:00+00:00").slice(0, 10).split('-');
                price_date_e = ', ' + d[2] + '/' + d[1] + '/' + d[0];
            }
            var price_date_d =  '';
            if (gas_station[$(this).data('id')].price_d > 0) {
                var d = (gas_station[$(this).data('id')].date_d + "T00:00:00+00:00").slice(0, 10).split('-');
                price_date_d = ', ' + d[2] + '/' + d[1] + '/' + d[0];
            }
            $('#gasstation-id').val( $(this).data('id'));
            $('#lb-fuel-price-g').html( '[R$ ' + parseFloat((gas_station[$(this).data('id')].price_g)).toFixed(3) + '' + price_date_g + ']');
            $('#lb-fuel-price-e').html( '[R$ ' + parseFloat((gas_station[$(this).data('id')].price_e)).toFixed(3) + '' + price_date_e + ']');
            $('#lb-fuel-price-d').html( '[R$ ' + parseFloat((gas_station[$(this).data('id')].price_d)).toFixed(3) + '' + price_date_d + ']');
            var text = '<div class="item-title"><strong>' + gas_station[$(this).data('id')].name + '</strong></div>' +
                '<div class="item-title">' + gas_station[$(this).data('id')].brand + '</div>' +
                '<div class="item-title">' + gas_station[$(this).data('id')].address + '</div>' ;
            $('#gs_info_box').html( '<div class="block">' + text + "</div>" );
            // app.dialog.alert('id: ' + $(this).data('id'));
        });

        $$('#btn-price-update').on('click', function () {
            var activeAjaxConnections = 0;
            var totalAjaxConnections = 0;
            var activeAjaxConnectionsErrors = 0;
            if ($('#price-g').val()) {
                totalAjaxConnections++;
            }
            if ($('#price-e').val()) {
                totalAjaxConnections++;
            }
            if ($('#price-d').val()) {
                totalAjaxConnections++;
            }

            if ($('#price-g').val()) {
                $.ajax({
                    type: "POST",
                    url: 'https://gasola.com.br/rest/atualizaPreco',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        'preco':  $('#price-g').val(),
                        'idCombustivel': 1,
                        'idPosto': $('#gasstation-id').val(),
                       // 'idUsuario': user.id,
                        'token': user.token
                    }),
                    success: function (data) {
                        if (data == true) {
                            activeAjaxConnections++;
                            console.log('- Price update G: ok');
                            if (activeAjaxConnections == totalAjaxConnections) {
                                mapUpdatePrice( $('#gasstation-id').val() );
                            }
                        }
                        else {
                            activeAjaxConnectionsErrors++;
                            console.log('- Price update Error G.');
                            if (activeAjaxConnectionsErrors == totalAjaxConnections) {
                                app.popup.close('.popup-price-update');
                                showMessage(__.message_notice, __.message_price_update_failured);
                            }
                        }
                    },
                    error: function (request, status, error) {
                        activeAjaxConnectionsErrors++;
                        if (activeAjaxConnectionsErrors == totalAjaxConnections) {
                            app.popup.close('.popup-price-update');
                            showMessage(__.message_notice, __.message_price_update_failured);
                        }
                    }
                }); // end 1
            }
            if ($('#price-e').val()) {
                $.ajax({
                    type: "POST",
                    url: 'https://gasola.com.br/rest/atualizaPreco',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        'preco':  $('#price-e').val(),
                        'idCombustivel': 2,
                        'idPosto': $('#gasstation-id').val(),
                  //      'idUsuario': user.id,
                        'token': user.token
                    }),
                    success: function (data) {
                        if (data == true) {
                            activeAjaxConnections++;
                            console.log('- Price update E: ok');
                            if (activeAjaxConnections == totalAjaxConnections) {
                                mapUpdatePrice( $('#gasstation-id').val() );
                            }
                        }
                        else {
                            activeAjaxConnectionsErrors++;
                            console.log('- Price update Error E.');
                            if (activeAjaxConnectionsErrors == totalAjaxConnections) {
                                app.popup.close('.popup-price-update');
                                showMessage(__.message_notice, __.message_price_update_failured);
                            }
                        }
                    },
                    error: function (request, status, error) {
                        activeAjaxConnectionsErrors++;
                        if (activeAjaxConnectionsErrors == totalAjaxConnections) {
                            app.popup.close('.popup-price-update');
                            showMessage(__.message_notice, __.message_price_update_failured);
                        }
                    }
                }); // end 2
            }

            if ($('#price-d').val()) {
                $.ajax({
                    type: "POST",
                    url: 'https://gasola.com.br/rest/atualizaPreco',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        'preco':  $('#price-d').val(),
                        'idCombustivel': 3,
                        'idPosto': $('#gasstation-id').val(),
                     //   'idUsuario': user.id,
                        'token': user.token
                    }),
                    success: function (data) {

                        if (data == true) {
                            activeAjaxConnections++;
                            console.log('- Price update D: ok');
                            if (activeAjaxConnections == totalAjaxConnections) {
                                mapUpdatePrice( $('#gasstation-id').val() );
                            }
                        }
                        else {
                            activeAjaxConnectionsErrors++;
                            console.log('- Price update Error D.');
                            if (activeAjaxConnectionsErrors == totalAjaxConnections) {
                                app.popup.close('.popup-price-update');
                                showMessage(__.message_notice, __.message_price_update_failured);
                            }
                        }
                    },
                    error: function (request, status, error) {
                        activeAjaxConnectionsErrors++;
                        if (activeAjaxConnectionsErrors == totalAjaxConnections) {
                            app.popup.close('.popup-price-update');
                            showMessage(__.message_notice, __.message_price_update_failured);
                        }
                    }
                }); // end 3
            }

            function mapUpdatePrice(gasstation_id) {
                var map = initMap();
                app.popup.close('.popup-price-update');
                showMessage(__.message_notice, __.message_price_update_success);
                setTimeout(function () {
                    goToMarker(gasstation_id);
                }, 4000);

            }
        });
    },
    error: function (jqXHR, status, errorThrown) {   //the status returned will be "timeout"
        console.log('JSON Error!');
    }

}); // end JSON

function getViewMap() {
    $('#config_show').val('map');
    $('#bt-show-map').addClass('button-active');
    $('#bt-show-list').removeClass('button-active');
    $('#view-show-map').show();
    $('#view-show-list').hide();
}
function getViewList() {
    $('#config_show').val('list');
    $('#bt-show-list').addClass('button-active');
    $('#bt-show-map').removeClass('button-active');
    $('#view-show-map').hide();
    $('#view-show-list').show();
}

/**
 * Show Message on top screen
 */
function showMessage(title, message, time) {
    if (!time) time = 2500;
    var notificationFull = app.notification.create({
        icon: '<i class="f7-icons color-blue">info</i>',
        title: title,
        text: message,
        closeTimeout: time,
        closeButton: true,
    }).open();
}



/**
 * App Setup
 *
 * @returns object app
 */
function initApp() {
    var app = new Framework7({
        root: '#app',
        name: 'Gasola',
        id: 'br.com.gasola',
        panel: {
            swipe: 'left',
        },
        routes: [
            {
                path: '/',
                url: 'index.html',
            },

        ],
        panel: {
            swipe: 'right',
            swipeOnlyClose: true,
        },
        cache: true,
        animateNavBackIcon: true,
        // dialog: {
        //     buttonOk: __.label_yes,
        //     buttonCancel: __.label_no
        //
        // }
    });
    return app;
}

