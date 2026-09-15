"""i18n translations for the landing page.

Extracted from the official terminal.army website's 5 language versions
(en, de, es, tr, ru), plus added zh-cn (Simplified Chinese) and zh-tw
(Traditional Chinese). Each key maps to a dict of lang -> translated string.
"""

from __future__ import annotations

SUPPORTED_LANGS = ("en", "de", "es", "tr", "ru", "zh-cn", "zh-tw")
DEFAULT_LANG = "en"

# -- HTML head --
T = {
    "html_lang": {
        "en": "en", "de": "de", "es": "es", "tr": "tr", "ru": "ru",
        "zh-cn": "zh-CN", "zh-tw": "zh-TW",
    },
    "title": {
        "en": "terminal.army \u00b7 Command a galactic empire from your terminal",
        "de": "terminal.army \u00b7 Befehlige ein galaktisches Imperium aus deinem Terminal",
        "es": "terminal.army \u00b7 Comanda un imperio gal\u00e1ctico desde tu terminal",
        "tr": "terminal.army \u00b7 Galaktik bir imparatorlu\u011fu terminalinizden y\u00f6netin",
        "ru": "terminal.army \u00b7 \u041a\u043e\u043c\u0430\u043d\u0434\u0443\u0439\u0442\u0435 \u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0438\u043c\u043f\u0435\u0440\u0438\u0435\u0439 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430",
        "zh-cn": "terminal.army \u00b7 \u4ece\u7ec8\u7aef\u6307\u6325\u4f60\u7684\u94f6\u6cb3\u5e1d\u56fd",
        "zh-tw": "terminal.army \u00b7 \u5f9e\u7d42\u7aef\u6307\u63ee\u4f60\u7684\u9280\u6cb3\u5e1d\u570b",
    },
    "meta_description": {
        "en": "Command a galactic empire from your terminal. Mines, research, fleets and wars, all from the same window as your code. It keeps running after you close it.",
        "de": "Befehlige ein galaktisches Imperium aus deinem Terminal. Minen, Forschung, Flotten und Kriege, alles im selben Fenster wie dein Code. Es l\u00e4uft weiter, wenn du es schlie\u00dft.",
        "es": "Comanda un imperio gal\u00e1ctico desde tu terminal. Minas, investigaci\u00f3n, flotas y guerras, en la misma ventana que tu c\u00f3digo. Sigue funcionando cuando lo cierras.",
        "tr": "Galaktik bir imparatorlu\u011fu terminalinizden y\u00f6netin. Madenler, ara\u015ft\u0131rma, filolar ve sava\u015flar, kodunuzla ayn\u0131 pencerede. Siz kapatt\u0131ktan sonra da \u00e7al\u0131\u015fmaya devam eder.",
        "ru": "\u041a\u043e\u043c\u0430\u043d\u0434\u0443\u0439\u0442\u0435 \u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0438\u043c\u043f\u0435\u0440\u0438\u0435\u0439 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430. \u0428\u0430\u0445\u0442\u044b, \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f, \u0444\u043b\u043e\u0442\u044b \u0438 \u0432\u043e\u0439\u043d\u044b, \u0432\u0441\u0451 \u0432 \u0442\u043e\u043c \u0436\u0435 \u043e\u043a\u043d\u0435, \u0447\u0442\u043e \u0438 \u0432\u0430\u0448 \u043a\u043e\u0434. \u041e\u043d\u0430 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043f\u043e\u0441\u043b\u0435 \u0442\u043e\u0433\u043e, \u043a\u0430\u043a \u0432\u044b \u0435\u0451 \u0437\u0430\u043a\u0440\u044b\u043b\u0438.",
        "zh-cn": "\u4ece\u7ec8\u7aef\u6307\u6325\u4f60\u7684\u94f6\u6cb3\u5e1d\u56fd\u3002\u77ff\u573a\u3001\u7814\u7a76\u3001\u8230\u961f\u4e0e\u6218\u4e89\uff0c\u4e00\u5207\u90fd\u5728\u4f60\u5199\u4ee3\u7801\u7684\u540c\u4e00\u4e2a\u7a97\u53e3\u91cc\u3002\u5173\u95ed\u540e\u4f9d\u7136\u6301\u7eed\u8fd0\u884c\u3002",
        "zh-tw": "\u5f9e\u7d42\u7aef\u6307\u63ee\u4f60\u7684\u9280\u6cb3\u5e1d\u570b\u3002\u7926\u5834\u3001\u7814\u7a76\u3001\u8266\u968a\u8207\u6230\u722d\uff0c\u4e00\u5207\u90fd\u5728\u4f60\u5beb\u7a0b\u5f0f\u78bc\u7684\u540c\u4e00\u500b\u8996\u7a97\u88e1\u3002\u95dc\u9589\u5f8c\u4f9d\u7136\u6301\u7e8c\u904b\u884c\u3002",
    },
    "og_title": {
        "en": "Command a galactic empire from your terminal",
        "de": "Befehlige ein galaktisches Imperium aus deinem Terminal",
        "es": "Comanda un imperio gal\u00e1ctico desde tu terminal",
        "tr": "Galaktik bir imparatorlu\u011fu terminalinizden y\u00f6netin",
        "ru": "\u041a\u043e\u043c\u0430\u043d\u0434\u0443\u0439\u0442\u0435 \u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0438\u043c\u043f\u0435\u0440\u0438\u0435\u0439 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430",
        "zh-cn": "\u4ece\u7ec8\u7aef\u6307\u6325\u4f60\u7684\u94f6\u6cb3\u5e1d\u56fd",
        "zh-tw": "\u5f9e\u7d42\u7aef\u6307\u63ee\u4f60\u7684\u9280\u6cb3\u5e1d\u570b",
    },
    "og_locale": {
        "en": "en_US", "de": "de_DE", "es": "es_ES", "tr": "tr_TR", "ru": "ru_RU",
        "zh-cn": "zh_CN", "zh-tw": "zh_TW",
    },
    "og_image_alt": {
        "en": "The terminal.army wordmark beside a cyan block cursor, above the single command that installs the game.",
        "de": "Der Schriftzug terminal.army neben einem cyanfarbenen Blockcursor, \u00fcber dem einen Befehl, der das Spiel installiert.",
        "es": "El logotipo de terminal.army junto a un cursor de bloque cian, sobre el \u00fanico comando que instala el juego.",
        "tr": "Camg\u00f6be\u011fi bir blok imlecin yan\u0131nda terminal.army logosu, oyunu kuran tek komutun \u00fczerinde.",
        "ru": "\u041b\u043e\u0433\u043e\u0442\u0438\u043f terminal.army \u0440\u044f\u0434\u043e\u043c \u0441 \u0433\u043e\u043b\u0443\u0431\u044b\u043c \u0431\u043b\u043e\u0447\u043d\u044b\u043c \u043a\u0443\u0440\u0441\u043e\u0440\u043e\u043c, \u043d\u0430\u0434 \u0435\u0434\u0438\u043d\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u043e\u0439, \u043a\u043e\u0442\u043e\u0440\u0430\u044f \u0443\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442 \u0438\u0433\u0440\u0443.",
        "zh-cn": "terminal.army \u6807\u5fd7\u65c1\u7684\u9752\u8272\u65b9\u5757\u5149\u6807\uff0c\u4e0a\u65b9\u662f\u5b89\u88c5\u6e38\u620f\u7684\u552f\u4e00\u547d\u4ee4\u3002",
        "zh-tw": "terminal.army \u6a19\u8a8c\u65c1\u7684\u9752\u8272\u65b9\u584a\u6e38\u6a19\uff0c\u4e0a\u65b9\u662f\u5b89\u88dd\u904a\u6232\u7684\u552f\u4e00\u6307\u4ee4\u3002",
    },
    # -- strip --
    "commanders_count": {
        "en": "{n} commanders",
        "de": "{n} Kommandanten",
        "es": "{n} comandantes",
        "tr": "{n} komutan",
        "ru": "{n} \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432",
        "zh-cn": "{n} \u4f4d\u6307\u6325\u5b98",
        "zh-tw": "{n} \u4f4d\u6307\u63ee\u5b98",
    },
    "online_now": {
        "en": "{n} online now",
        "de": "{n} gerade online",
        "es": "{n} conectados ahora",
        "tr": "\u015fu an {n} \u00e7evrimi\u00e7i",
        "ru": "{n} \u0438\u0433\u0440\u043e\u043a\u043e\u0432 \u0432 \u0441\u0435\u0442\u0438",
        "zh-cn": "{n} \u4eba\u5728\u7ebf",
        "zh-tw": "{n} \u4eba\u5728\u7dda",
    },
    "community_label": {
        "en": "Community",
        "de": "Community",
        "es": "Comunidad",
        "tr": "Topluluk",
        "ru": "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e",
        "zh-cn": "\u793e\u533a",
        "zh-tw": "\u793e\u7fa4",
    },
    "community_aria": {
        "en": "Community",
        "de": "Community",
        "es": "Comunidad",
        "tr": "Topluluk",
        "ru": "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e",
        "zh-cn": "\u793e\u533a",
        "zh-tw": "\u793e\u7fa4",
    },
    # -- nav --
    "nav_login": {
        "en": "Log in",
        "de": "Anmelden",
        "es": "Iniciar sesi\u00f3n",
        "tr": "Giri\u015f yap",
        "ru": "\u0412\u043e\u0439\u0442\u0438",
        "zh-cn": "\u767b\u5f55",
        "zh-tw": "\u767b\u5165",
    },
    "nav_signup": {
        "en": "Sign up",
        "de": "Registrieren",
        "es": "Crear cuenta",
        "tr": "Kaydol",
        "ru": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
        "zh-cn": "\u6ce8\u518c",
        "zh-tw": "\u8a3b\u518a",
    },
    # -- hero board --
    "board_aria": {
        "en": "Top commanders",
        "de": "Beste Kommandanten",
        "es": "Mejores comandantes",
        "tr": "En iyi komutanlar",
        "ru": "\u041b\u0443\u0447\u0448\u0438\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u044b",
        "zh-cn": "\u9876\u5c16\u6307\u6325\u5b98",
        "zh-tw": "\u9802\u5c16\u6307\u63ee\u5b98",
    },
    "board_title": {
        "en": "Top commanders",
        "de": "Beste Kommandanten",
        "es": "Mejores comandantes",
        "tr": "En iyi komutanlar",
        "ru": "\u041b\u0443\u0447\u0448\u0438\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u044b",
        "zh-cn": "\u9876\u5c16\u6307\u6325\u5b98",
        "zh-tw": "\u9802\u5c16\u6307\u63ee\u5b98",
    },
    "board_more": {
        "en": "See the full ladder",
        "de": "Ganze Rangliste ansehen",
        "es": "Ver la clasificaci\u00f3n completa",
        "tr": "S\u0131ralaman\u0131n tamam\u0131n\u0131 g\u00f6r",
        "ru": "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432\u0435\u0441\u044c \u0440\u0435\u0439\u0442\u0438\u043d\u0433",
        "zh-cn": "\u67e5\u770b\u5b8c\u6574\u6392\u884c\u699c",
        "zh-tw": "\u67e5\u770b\u5b8c\u6574\u6392\u884c\u699c",
    },
    # -- hero body --
    "hero_title_1": {
        "en": "Build your empire",
        "de": "Bau dein Imperium",
        "es": "Construye tu imperio",
        "tr": "\u0130mparatorlu\u011funu",
        "ru": "\u0421\u0442\u0440\u043e\u0439\u0442\u0435 \u0438\u043c\u043f\u0435\u0440\u0438\u044e",
        "zh-cn": "\u4ece\u4f60\u7684\u7ec8\u7aef",
        "zh-tw": "\u5f9e\u4f60\u7684\u7d42\u7aef",
    },
    "hero_title_2": {
        "en": "from your terminal.",
        "de": "von deinem Terminal aus.",
        "es": "desde tu terminal.",
        "tr": "terminalinden kur.",
        "ru": "\u0438\u0437 \u0441\u0432\u043e\u0435\u0433\u043e \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430.",
        "zh-cn": "\u5efa\u7acb\u4f60\u7684\u5e1d\u56fd\u3002",
        "zh-tw": "\u5efa\u7acb\u4f60\u7684\u5e1d\u570b\u3002",
    },
    "hero_lede": {
        "en": "Mines, research, fleets and wars, all from the same window as your code. It keeps running after you close it.",
        "de": "Minen, Forschung, Flotten und Kriege, alles im selben Fenster wie dein Code. Es l\u00e4uft weiter, wenn du es schlie\u00dft.",
        "es": "Minas, investigaci\u00f3n, flotas y guerras, todo en la misma ventana que tu c\u00f3digo. Sigue funcionando cuando la cierras.",
        "tr": "Madenler, ara\u015ft\u0131rma, filolar ve sava\u015flar, kodunu yazd\u0131\u011f\u0131n pencerede. Sen kapatt\u0131ktan sonra da i\u015flemeye devam eder.",
        "ru": "\u0428\u0430\u0445\u0442\u044b, \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f, \u0444\u043b\u043e\u0442\u044b \u0438 \u0432\u043e\u0439\u043d\u044b, \u0432 \u0442\u043e\u043c \u0436\u0435 \u043e\u043a\u043d\u0435, \u0433\u0434\u0435 \u0432\u0430\u0448 \u043a\u043e\u0434. \u0412\u0441\u0451 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0442\u043e\u0433\u043e, \u043a\u0430\u043a \u0432\u044b \u0435\u0433\u043e \u0437\u0430\u043a\u0440\u043e\u0435\u0442\u0435.",
        "zh-cn": "\u77ff\u573a\u3001\u7814\u7a76\u3001\u8230\u961f\u4e0e\u6218\u4e89\uff0c\u4e00\u5207\u90fd\u5728\u4f60\u5199\u4ee3\u7801\u7684\u540c\u4e00\u4e2a\u7a97\u53e3\u91cc\u3002\u5173\u95ed\u540e\u4f9d\u7136\u6301\u7eed\u8fd0\u884c\u3002",
        "zh-tw": "\u7926\u5834\u3001\u7814\u7a76\u3001\u8266\u968a\u8207\u6230\u722d\uff0c\u4e00\u5207\u90fd\u5728\u4f60\u5beb\u7a0b\u5f0f\u78bc\u7684\u540c\u4e00\u500b\u8996\u7a97\u88e1\u3002\u95dc\u9589\u5f8c\u4f9d\u7136\u6301\u7e8c\u904b\u884c\u3002",
    },
    "copy_label": {
        "en": "Copy", "de": "Kopieren", "es": "Copiar", "tr": "Kopyala", "ru": "\u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
        "zh-cn": "\u590d\u5236", "zh-tw": "\u8907\u88fd",
    },
    "copy_done": {
        "en": "Copied", "de": "Kopiert", "es": "Copiado", "tr": "Kopyaland\u0131", "ru": "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e",
        "zh-cn": "\u5df2\u590d\u5236", "zh-tw": "\u5df2\u8907\u88fd",
    },
    # -- MCP band --
    "mcp_title": {
        "en": "Or give it a commander.",
        "de": "Oder gib ihm einen Kommandanten.",
        "es": "O dale un comandante.",
        "tr": "Ya da bir komutan ver.",
        "ru": "\u0418\u043b\u0438 \u0434\u0430\u0439\u0442\u0435 \u0435\u043c\u0443 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u0430.",
        "zh-cn": "\u6216\u8005\u4ea4\u7ed9\u5b83\u4e00\u4e2a\u6307\u6325\u5b98\u3002",
        "zh-tw": "\u6216\u8005\u4ea4\u7d66\u5b83\u4e00\u500b\u6307\u63ee\u5b98\u3002",
    },
    "mcp_lede": {
        "en": "One command sets it up in your AI assistant. After that you ask for things instead of typing them. It signs in as you, and it can do exactly what you can do and nothing more.",
        "de": "Ein Befehl richtet es in deinem KI-Assistenten ein. Danach fragst du nach Dingen, statt sie zu tippen. Er meldet sich als du an und kann genau das, was du kannst, und nichts dar\u00fcber hinaus.",
        "es": "Un comando lo instala en tu asistente de IA. Despu\u00e9s pides las cosas en lugar de escribirlas. Entra como t\u00fa, y puede hacer exactamente lo que t\u00fa puedes y nada m\u00e1s.",
        "tr": "Tek komut oyunu yapay zek\u00e2 asistan\u0131na kuruyor. Sonras\u0131 yazmak yerine istemek. Senin olarak giri\u015f yapar, ve senin yapabildi\u011finin ayn\u0131s\u0131n\u0131 yapar, fazlas\u0131 de\u011fil.",
        "ru": "\u041e\u0434\u043d\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0443\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442 \u0438\u0433\u0440\u0443 \u0432 \u0432\u0430\u0448\u0435\u0433\u043e \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043d\u0442\u0430. \u0414\u0430\u043b\u044c\u0448\u0435 \u0432\u044b \u043f\u0440\u043e\u0441\u0438\u0442\u0435, \u0432\u043c\u0435\u0441\u0442\u043e \u0442\u043e\u0433\u043e \u0447\u0442\u043e\u0431\u044b \u043d\u0430\u0431\u0438\u0440\u0430\u0442\u044c. \u041e\u043d \u0432\u0445\u043e\u0434\u0438\u0442 \u043a\u0430\u043a \u0432\u044b \u0438 \u043c\u043e\u0436\u0435\u0442 \u0440\u043e\u0432\u043d\u043e \u0442\u043e \u0436\u0435, \u0447\u0442\u043e \u0438 \u0432\u044b, \u0438 \u043d\u0438\u0447\u0435\u0433\u043e \u0441\u0432\u0435\u0440\u0445 \u0442\u043e\u0433\u043e.",
        "zh-cn": "\u4e00\u6761\u547d\u4ee4\u5373\u53ef\u5728\u4f60\u7684 AI \u52a9\u624b\u4e2d\u5b89\u88c5\u3002\u4e4b\u540e\u4f60\u53ea\u9700\u63d0\u51fa\u9700\u6c42\uff0c\u65e0\u9700\u624b\u52a8\u8f93\u5165\u3002\u5b83\u4ee5\u4f60\u7684\u8eab\u4efd\u767b\u5f55\uff0c\u80fd\u505a\u4f60\u80fd\u505a\u7684\u4e00\u5207\uff0c\u4e0d\u591a\u4e0d\u5c11\u3002",
        "zh-tw": "\u4e00\u689d\u6307\u4ee4\u5373\u53ef\u5728\u4f60\u7684 AI \u52a9\u624b\u4e2d\u5b89\u88dd\u3002\u4e4b\u5f8c\u4f60\u53ea\u9700\u63d0\u51fa\u9700\u6c42\uff0c\u7121\u9700\u624b\u52d5\u8f38\u5165\u3002\u5b83\u4ee5\u4f60\u7684\u8eab\u4efd\u767b\u5165\uff0c\u80fd\u505a\u4f60\u80fd\u505a\u7684\u4e00\u5207\uff0c\u4e0d\u591a\u4e0d\u5c11\u3002",
    },
    "mcp_more": {
        "en": "How the commander works",
        "de": "Wie der Kommandant arbeitet",
        "es": "C\u00f3mo trabaja el comandante",
        "tr": "Komutan nas\u0131l \u00e7al\u0131\u015f\u0131yor",
        "ru": "\u041a\u0430\u043a \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440",
        "zh-cn": "\u6307\u6325\u5b98\u7684\u5de5\u4f5c\u539f\u7406",
        "zh-tw": "\u6307\u63ee\u5b98\u7684\u5de5\u4f5c\u539f\u7406",
    },
    "mcp_ask": {
        "en": "what should I do next",
        "de": "was soll ich als N\u00e4chstes tun",
        "es": "qu\u00e9 deber\u00eda hacer ahora",
        "tr": "s\u0131rada ne yapmal\u0131y\u0131m",
        "ru": "\u0447\u0442\u043e \u043c\u043d\u0435 \u0434\u0435\u043b\u0430\u0442\u044c \u0434\u0430\u043b\u044c\u0448\u0435",
        "zh-cn": "\u4e0b\u4e00\u6b65\u6211\u8be5\u505a\u4ec0\u4e48",
        "zh-tw": "\u4e0b\u4e00\u6b65\u6211\u8a72\u505a\u4ec0\u9ebc",
    },
    "mcp_reply": {
        "en": "Your solar plant is at 8 and production is running at 0.71, so every mine here is slow. Take the plant to 9 first: 4,240 metal, about eleven minutes. Separately, room_to_keep_it is finished and unclaimed. That is 2,500 metal. Claim it?",
        "de": "Dein Solarkraftwerk steht auf 8 und die Produktion l\u00e4uft auf 0,71, also ist jede Mine hier langsam. Bring das Kraftwerk zuerst auf 9: 4.240 Metall, etwa elf Minuten. Au\u00dferdem ist room_to_keep_it fertig und nicht eingel\u00f6st. Das sind 2.500 Metall. Einl\u00f6sen?",
        "es": "Tu planta solar est\u00e1 en 8 y la producci\u00f3n va a 0,71, as\u00ed que todas las minas de aqu\u00ed van lentas. Sube la planta a 9 primero: 4.240 de metal, unos once minutos. Aparte, room_to_keep_it est\u00e1 terminada y sin cobrar. Son 2.500 de metal. \u00bfLa cobro?",
        "tr": "G\u00fcne\u015f santralin 8&#39;de ve \u00fcretim 0,71&#39;de \u00e7al\u0131\u015f\u0131yor, yani buradaki b\u00fct\u00fcn madenler yava\u015f. \u00d6nce santrali 9&#39;a \u00e7ek: 4.240 metal, yakla\u015f\u0131k on bir dakika. Ayr\u0131ca room_to_keep_it bitmi\u015f ve al\u0131nmam\u0131\u015f. 2.500 metal ediyor. Alay\u0131m m\u0131?",
        "ru": "\u0412\u0430\u0448\u0430 \u0441\u043e\u043b\u043d\u0435\u0447\u043d\u0430\u044f \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u0441\u0442\u0430\u043d\u0446\u0438\u044f \u043d\u0430 \u0443\u0440\u043e\u0432\u043d\u0435 8, \u0430 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e \u0438\u0434\u0451\u0442 \u043d\u0430 0,71, \u0442\u0430\u043a \u0447\u0442\u043e \u0432\u0441\u0435 \u0448\u0430\u0445\u0442\u044b \u0437\u0434\u0435\u0441\u044c \u0440\u0430\u0431\u043e\u0442\u0430\u044e\u0442 \u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e. \u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043f\u043e\u0434\u043d\u0438\u043c\u0438\u0442\u0435 \u0441\u0442\u0430\u043d\u0446\u0438\u044e \u0434\u043e 9: 4 240 \u043c\u0435\u0442\u0430\u043b\u043b\u0430, \u043e\u043a\u043e\u043b\u043e \u043e\u0434\u0438\u043d\u0430\u0434\u0446\u0430\u0442\u0438 \u043c\u0438\u043d\u0443\u0442. \u041e\u0442\u0434\u0435\u043b\u044c\u043d\u043e: room_to_keep_it \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e \u0438 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043e. \u042d\u0442\u043e 2 500 \u043c\u0435\u0442\u0430\u043b\u043b\u0430. \u041f\u043e\u043b\u0443\u0447\u0438\u0442\u044c?",
        "zh-cn": "\u4f60\u7684\u592a\u9633\u80fd\u7535\u7ad9\u7b49\u7ea7\u4e3a 8\uff0c\u4ea7\u80fd\u7cfb\u6570 0.71\uff0c\u6240\u4ee5\u8fd9\u91cc\u7684\u6bcf\u4e2a\u77ff\u573a\u90fd\u5f88\u6162\u3002\u5148\u628a\u7535\u7ad9\u5347\u5230 9 \u7ea7\uff1a\u9700\u8981 4,240 \u91d1\u5c5e\uff0c\u5927\u7ea6\u5341\u4e00\u5206\u949f\u3002\u53e6\u5916\uff0croom_to_keep_it \u5df2\u5b8c\u6210\u4f46\u672a\u9886\u53d6\u3002\u90a3\u662f 2,500 \u91d1\u5c5e\u3002\u8981\u9886\u53d6\u5417\uff1f",
        "zh-tw": "\u4f60\u7684\u592a\u967d\u80fd\u96fb\u7ad9\u7b49\u7d1a\u70ba 8\uff0c\u7522\u80fd\u4fc2\u6578 0.71\uff0c\u6240\u4ee5\u9019\u88e1\u7684\u6bcf\u500b\u7926\u5834\u90fd\u5f88\u6162\u3002\u5148\u628a\u96fb\u7ad9\u5347\u5230 9 \u7d1a\uff1a\u9700\u8981 4,240 \u91d1\u5c6c\uff0c\u5927\u7d04\u5341\u4e00\u5206\u9418\u3002\u53e6\u5916\uff0croom_to_keep_it \u5df2\u5b8c\u6210\u4f46\u672a\u9818\u53d6\u3002\u90a3\u662f 2,500 \u91d1\u5c6c\u3002\u8981\u9818\u53d6\u55ce\uff1f",
    },
    # -- footer brand --
    "foot_desc": {
        "en": "An OGame-style strategy game you play from a terminal. The universe keeps running while the client is closed.",
        "de": "Ein Strategiespiel im OGame-Stil, das du im Terminal spielst. Das Universum l\u00e4uft weiter, auch wenn der Client geschlossen ist.",
        "es": "Un juego de estrategia al estilo de OGame que se juega desde la terminal. El universo sigue funcionando con el cliente cerrado.",
        "tr": "Terminalden oynanan, OGame tarz\u0131 bir strateji oyunu. \u0130stemci kapal\u0131yken de evren i\u015flemeye devam eder.",
        "ru": "\u0421\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044f \u0432 \u0434\u0443\u0445\u0435 OGame, \u0432 \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u0438\u0433\u0440\u0430\u044e\u0442 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430. \u0412\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c, \u043f\u043e\u043a\u0430 \u043a\u043b\u0438\u0435\u043d\u0442 \u0437\u0430\u043a\u0440\u044b\u0442.",
        "zh-cn": "\u4e00\u6b3e\u4ece\u7ec8\u7aef\u6e38\u73a9\u7684 OGame \u98ce\u683c\u7b56\u7565\u6e38\u620f\u3002\u5373\u4f7f\u5173\u95ed\u5ba2\u6237\u7aef\uff0c\u5b87\u5b99\u4f9d\u7136\u6301\u7eed\u8fd0\u884c\u3002",
        "zh-tw": "\u4e00\u6b3e\u5f9e\u7d42\u7aef\u904a\u73a9\u7684 OGame \u98a8\u683c\u7b56\u7565\u904a\u6232\u3002\u5373\u4f7f\u95dc\u9589\u7528\u6236\u7aef\uff0c\u5b87\u5b99\u4f9d\u7136\u6301\u7e8c\u904b\u884c\u3002",
    },
    # -- footer columns --
    "col_play": {
        "en": "Play", "de": "Spielen", "es": "Jugar", "tr": "Oyna", "ru": "\u0418\u0433\u0440\u0430\u0442\u044c",
        "zh-cn": "\u6e38\u620f", "zh-tw": "\u904a\u6232",
    },
    "col_learn": {
        "en": "Learn", "de": "Lernen", "es": "Aprender", "tr": "\u00d6\u011fren", "ru": "\u0418\u0437\u0443\u0447\u0438\u0442\u044c",
        "zh-cn": "\u5b66\u4e60", "zh-tw": "\u5b78\u7fd2",
    },
    "col_service": {
        "en": "Service", "de": "Betrieb", "es": "Servicio", "tr": "Servis", "ru": "\u0421\u0435\u0440\u0432\u0438\u0441",
        "zh-cn": "\u670d\u52a1", "zh-tw": "\u670d\u52d9",
    },
    "col_community": {
        "en": "Community", "de": "Community", "es": "Comunidad", "tr": "Topluluk", "ru": "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e",
        "zh-cn": "\u793e\u533a", "zh-tw": "\u793e\u7fa4",
    },
    "link_signup": {
        "en": "Sign up", "de": "Registrieren", "es": "Crear cuenta", "tr": "Kaydol", "ru": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
        "zh-cn": "\u6ce8\u518c", "zh-tw": "\u8a3b\u518a",
    },
    "link_login": {
        "en": "Log in", "de": "Anmelden", "es": "Iniciar sesi\u00f3n", "tr": "Giri\u015f yap", "ru": "\u0412\u043e\u0439\u0442\u0438",
        "zh-cn": "\u767b\u5f55", "zh-tw": "\u767b\u5165",
    },
    "link_ranking": {
        "en": "Ranking", "de": "Rangliste", "es": "Clasificaci\u00f3n", "tr": "S\u0131ralama", "ru": "\u0420\u0435\u0439\u0442\u0438\u043d\u0433",
        "zh-cn": "\u6392\u884c\u699c", "zh-tw": "\u6392\u884c\u699c",
    },
    "link_install_client": {
        "en": "Install the client", "de": "Client installieren", "es": "Instalar el cliente", "tr": "\u0130stemciyi kur", "ru": "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442",
        "zh-cn": "\u5b89\u88c5\u5ba2\u6237\u7aef", "zh-tw": "\u5b89\u88dd\u7528\u6236\u7aef",
    },
    "link_commander": {
        "en": "How the commander works", "de": "Wie der Kommandant arbeitet", "es": "C\u00f3mo trabaja el comandante", "tr": "Komutan nas\u0131l \u00e7al\u0131\u015f\u0131yor", "ru": "\u041a\u0430\u043a \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440",
        "zh-cn": "\u6307\u6325\u5b98\u7684\u5de5\u4f5c\u539f\u7406", "zh-tw": "\u6307\u63ee\u5b98\u7684\u5de5\u4f5c\u539f\u7406",
    },
    "link_docs": {
        "en": "Docs", "de": "Doku", "es": "Documentaci\u00f3n", "tr": "Belgeler", "ru": "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f",
        "zh-cn": "\u6587\u6863", "zh-tw": "\u6587\u4ef6",
    },
    "link_commands": {
        "en": "Commands", "de": "Befehle", "es": "Comandos", "tr": "Komutlar", "ru": "\u041a\u043e\u043c\u0430\u043d\u0434\u044b",
        "zh-cn": "\u547d\u4ee4", "zh-tw": "\u6307\u4ee4",
    },
    "link_mechanics": {
        "en": "Game mechanics", "de": "Spielmechanik", "es": "Mec\u00e1nicas del juego", "tr": "Oyun mekanikleri", "ru": "\u041c\u0435\u0445\u0430\u043d\u0438\u043a\u0430 \u0438\u0433\u0440\u044b",
        "zh-cn": "\u6e38\u620f\u673a\u5236", "zh-tw": "\u904a\u6232\u6a5f\u5236",
    },
    "link_about": {
        "en": "About", "de": "\u00dcber das Spiel", "es": "Acerca de", "tr": "Hakk\u0131nda", "ru": "\u041e\u0431 \u0438\u0433\u0440\u0435",
        "zh-cn": "\u5173\u4e8e", "zh-tw": "\u95dc\u65bc",
    },
    "link_faq": {
        "en": "FAQ", "de": "Fragen", "es": "Preguntas", "tr": "Sorular", "ru": "\u0412\u043e\u043f\u0440\u043e\u0441\u044b",
        "zh-cn": "\u5e38\u89c1\u95ee\u9898", "zh-tw": "\u5e38\u898b\u554f\u984c",
    },
    "link_changelog": {
        "en": "Changelog", "de": "\u00c4nderungen", "es": "Cambios", "tr": "De\u011fi\u015fiklikler", "ru": "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f",
        "zh-cn": "\u66f4\u65b0\u65e5\u5fd7", "zh-tw": "\u66f4\u65b0\u65e5\u8a8c",
    },
    "link_status": {
        "en": "Status", "de": "Status", "es": "Estado", "tr": "Durum", "ru": "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435",
        "zh-cn": "\u72b6\u6001", "zh-tw": "\u72c0\u614b",
    },
    "link_terms": {
        "en": "Terms", "de": "Bedingungen", "es": "Condiciones", "tr": "Ko\u015fullar", "ru": "\u0423\u0441\u043b\u043e\u0432\u0438\u044f",
        "zh-cn": "\u6761\u6b3e", "zh-tw": "\u689d\u6b3e",
    },
    "link_privacy": {
        "en": "Privacy", "de": "Datenschutz", "es": "Privacidad", "tr": "Gizlilik", "ru": "\u041a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
        "zh-cn": "\u9690\u79c1", "zh-tw": "\u96b1\u79c1",
    },
    "link_cookies": {
        "en": "Cookies", "de": "Cookies", "es": "Cookies", "tr": "\u00c7erezler", "ru": "Cookie",
        "zh-cn": "Cookie", "zh-tw": "Cookie",
    },
    # -- footer base --
    "formula_note": {
        "en": "Every formula comes from the",
        "de": "Jede Formel stammt aus dem",
        "es": "Cada f\u00f3rmula viene de la",
        "tr": "Her form\u00fcl",
        "ru": "\u041a\u0430\u0436\u0434\u0430\u044f \u0444\u043e\u0440\u043c\u0443\u043b\u0430 \u0432\u0437\u044f\u0442\u0430 \u0438\u0437",
        "zh-cn": "\u6240\u6709\u516c\u5f0f\u5747\u6765\u81ea",
        "zh-tw": "\u6240\u6709\u516c\u5f0f\u5747\u4f86\u81ea",
    },
    "lang_aria": {
        "en": "Language", "de": "Sprache", "es": "Idioma", "tr": "Dil", "ru": "\u042f\u0437\u044b\u043a",
        "zh-cn": "\u8bed\u8a00", "zh-tw": "\u8a9e\u8a00",
    },
    # -- version footer --
    "version_note": {
        "en": "run tarmy update to match the server",
        "de": "tarmy update ausf\u00fchren, um zum Server zu passen",
        "es": "ejecuta tarmy update para igualar al servidor",
        "tr": "sunucuyla e\u015fitlemek i\u00e7in tarmy update \u00e7al\u0131\u015ft\u0131r",
        "ru": "\u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 tarmy update, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0432\u043f\u0430\u0441\u0442\u044c \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043e\u043c",
        "zh-cn": "\u8fd0\u884c tarmy update \u4ee5\u5339\u914d\u670d\u52a1\u5668\u7248\u672c",
        "zh-tw": "\u57f7\u884c tarmy update \u4ee5\u5339\u914d\u4f3a\u670d\u5668\u7248\u672c",
    },
    "last_updated": {
        "en": "last updated",
        "de": "zuletzt aktualisiert",
        "es": "actualizado por \u00faltima vez el",
        "tr": "son g\u00fcncelleme",
        "ru": "\u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435",
        "zh-cn": "\u6700\u540e\u66f4\u65b0",
        "zh-tw": "\u6700\u5f8c\u66f4\u65b0",
    },
    "legal_aria": {
        "en": "Information and legal",
        "de": "Informationen und Rechtliches",
        "es": "Informaci\u00f3n y aviso legal",
        "tr": "Bilgi ve hukuki metinler",
        "ru": "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0438 \u043f\u0440\u0430\u0432\u043e\u0432\u044b\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b",
        "zh-cn": "\u4fe1\u606f\u4e0e\u6cd5\u5f8b",
        "zh-tw": "\u8cc7\u8a0a\u8207\u6cd5\u5f8b",
    },
    "footer_aria": {
        "en": "Footer",
        "de": "Footer",
        "es": "Footer",
        "tr": "Footer",
        "ru": "Footer",
        "zh-cn": "\u9875\u811a",
        "zh-tw": "\u9801\u5c3e",
    },
}


def get_translations(lang: str) -> dict[str, str]:
    """Return a flat dict of key -> translated string for *lang*."""
    if lang not in SUPPORTED_LANGS:
        lang = DEFAULT_LANG
    return {key: vals.get(lang, vals[DEFAULT_LANG]) for key, vals in T.items()}


def format_count(template: str, n: int) -> str:
    """Replace {n} placeholder with the number."""
    return template.replace("{n}", str(n))
