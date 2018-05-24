//
//
var itemslang = {
    "en": {
        "translation": {
            "language": "Language xx",
            "Welcome-to-Framework7": "Welcome-to-Framework7",
        }
    },
    "br": {
            "language": "Idioma xxx",
            "Welcome-to-Framework7": "Bem Vindo ao Framework7",
        }
    }
};

// $(document).ready(function() {
//     import i18next from 'i18next';
//     var language = "en";
//     if (localStorage.getItem("language") != null)
//         language = localStorage.getItem("language");
//
//     i18n.init({
//         lng: language,
//         resStore: itemslang,
//         fallbackLng: "en"
//     }, function(o) {
//         $(document).i18n()
//     }), $(".lang").click(function() {
//         var o = $(this).attr("data-lang");
//
//         localStorage.setItem("language", o);
//
//         i18n.init({
//             lng: o
//         }, function(o) {
//             $(document).i18n()
//         })
//     })
// });