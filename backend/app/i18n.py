"""i18n translations for the landing page.

Extracted from the official terminal.army website's 5 language versions
(en, de, es, tr, ru).  Each key maps to a dict of lang -> translated string.
"""

from __future__ import annotations

SUPPORTED_LANGS = ("en", "de", "es", "tr", "ru")
DEFAULT_LANG = "en"

# -- HTML head --
T = {
    "html_lang": {
        "en": "en", "de": "de", "es": "es", "tr": "tr", "ru": "ru",
    },
    "title": {
        "en": "terminal.army \u00b7 Command a galactic empire from your terminal",
        "de": "terminal.army \u00b7 Befehlige ein galaktisches Imperium aus deinem Terminal",
        "es": "terminal.army \u00b7 Comanda un imperio gal\u00e1ctico desde tu terminal",
        "tr": "terminal.army \u00b7 Galaktik bir imparatorlu\u011fu terminalinizden y\u00f6netin",
        "ru": "terminal.army \u00b7 \u041a\u043e\u043c\u0430\u043d\u0434\u0443\u0439\u0442\u0435 \u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0438\u043c\u043f\u0435\u0440\u0438\u0435\u0439 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430",
    },
    "meta_description": {
        "en": "Command a galactic empire from your terminal. Mines, research, fleets and wars, all from the same window as your code. It keeps running after you close it.",
        "de": "Befehlige ein galaktisches Imperium aus deinem Terminal. Minen, Forschung, Flotten und Kriege, alles im selben Fenster wie dein Code. Es l\u00e4uft weiter, wenn du es schlie\u00dft.",
        "es": "Comanda un imperio gal\u00e1ctico desde tu terminal. Minas, investigaci\u00f3n, flotas y guerras, en la misma ventana que tu c\u00f3digo. Sigue funcionando cuando lo cierras.",
        "tr": "Galaktik bir imparatorlu\u011fu terminalinizden y\u00f6netin. Madenler, ara\u015ft\u0131rma, filolar ve sava\u015flar, kodunuzla ayn\u0131 pencerede. Siz kapatt\u0131ktan sonra da \u00e7al\u0131\u015fmaya devam eder.",
        "ru": "\u041a\u043e\u043c\u0430\u043d\u0434\u0443\u0439\u0442\u0435 \u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0438\u043c\u043f\u0435\u0440\u0438\u0435\u0439 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430. \u0428\u0430\u0445\u0442\u044b, \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f, \u0444\u043b\u043e\u0442\u044b \u0438 \u0432\u043e\u0439\u043d\u044b, \u0432\u0441\u0451 \u0432 \u0442\u043e\u043c \u0436\u0435 \u043e\u043a\u043d\u0435, \u0447\u0442\u043e \u0438 \u0432\u0430\u0448 \u043a\u043e\u0434. \u041e\u043d\u0430 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043f\u043e\u0441\u043b\u0435 \u0442\u043e\u0433\u043e, \u043a\u0430\u043a \u0432\u044b \u0435\u0451 \u0437\u0430\u043a\u0440\u044b\u043b\u0438.",
    },
    "og_title": {
        "en": "Command a galactic empire from your terminal",
        "de": "Befehlige ein galaktisches Imperium aus deinem Terminal",
        "es": "Comanda un imperio gal\u00e1ctico desde tu terminal",
        "tr": "Galaktik bir imparatorlu\u011fu terminalinizden y\u00f6netin",
        "ru": "\u041a\u043e\u043c\u0430\u043d\u0434\u0443\u0439\u0442\u0435 \u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0438\u043c\u043f\u0435\u0440\u0438\u0435\u0439 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430",
    },
    "og_locale": {
        "en": "en_US", "de": "de_DE", "es": "es_ES", "tr": "tr_TR", "ru": "ru_RU",
    },
    "og_image_alt": {
        "en": "The terminal.army wordmark beside a cyan block cursor, above the single command that installs the game.",
        "de": "Der Schriftzug terminal.army neben einem cyanfarbenen Blockcursor, \u00fcber dem einen Befehl, der das Spiel installiert.",
        "es": "El logotipo de terminal.army junto a un cursor de bloque cian, sobre el \u00fanico comando que instala el juego.",
        "tr": "Camg\u00f6be\u011fi bir blok imlecin yan\u0131nda terminal.army logosu, oyunu kuran tek komutun \u00fczerinde.",
        "ru": "\u041b\u043e\u0433\u043e\u0442\u0438\u043f terminal.army \u0440\u044f\u0434\u043e\u043c \u0441 \u0433\u043e\u043b\u0443\u0431\u044b\u043c \u0431\u043b\u043e\u0447\u043d\u044b\u043c \u043a\u0443\u0440\u0441\u043e\u0440\u043e\u043c, \u043d\u0430\u0434 \u0435\u0434\u0438\u043d\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u043e\u0439, \u043a\u043e\u0442\u043e\u0440\u0430\u044f \u0443\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442 \u0438\u0433\u0440\u0443.",
    },
    # -- strip --
    "commanders_count": {
        "en": "{n} commanders",
        "de": "{n} Kommandanten",
        "es": "{n} comandantes",
        "tr": "{n} komutan",
        "ru": "{n} \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432",
    },
    "online_now": {
        "en": "{n} online now",
        "de": "{n} gerade online",
        "es": "{n} conectados ahora",
        "tr": "\u015fu an {n} \u00e7evrimi\u00e7i",
        "ru": "{n} \u0438\u0433\u0440\u043e\u043a\u043e\u0432 \u0432 \u0441\u0435\u0442\u0438",
    },
    "community_label": {
        "en": "Community",
        "de": "Community",
        "es": "Comunidad",
        "tr": "Topluluk",
        "ru": "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e",
    },
    "community_aria": {
        "en": "Community",
        "de": "Community",
        "es": "Comunidad",
        "tr": "Topluluk",
        "ru": "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e",
    },
    # -- nav --
    "nav_login": {
        "en": "Log in",
        "de": "Anmelden",
        "es": "Iniciar sesi\u00f3n",
        "tr": "Giri\u015f yap",
        "ru": "\u0412\u043e\u0439\u0442\u0438",
    },
    "nav_signup": {
        "en": "Sign up",
        "de": "Registrieren",
        "es": "Crear cuenta",
        "tr": "Kaydol",
        "ru": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
    },
    # -- hero board --
    "board_aria": {
        "en": "Top commanders",
        "de": "Beste Kommandanten",
        "es": "Mejores comandantes",
        "tr": "En iyi komutanlar",
        "ru": "\u041b\u0443\u0447\u0448\u0438\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u044b",
    },
    "board_title": {
        "en": "Top commanders",
        "de": "Beste Kommandanten",
        "es": "Mejores comandantes",
        "tr": "En iyi komutanlar",
        "ru": "\u041b\u0443\u0447\u0448\u0438\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u044b",
    },
    "board_more": {
        "en": "See the full ladder",
        "de": "Ganze Rangliste ansehen",
        "es": "Ver la clasificaci\u00f3n completa",
        "tr": "S\u0131ralaman\u0131n tamam\u0131n\u0131 g\u00f6r",
        "ru": "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432\u0435\u0441\u044c \u0440\u0435\u0439\u0442\u0438\u043d\u0433",
    },
    # -- hero body --
    "hero_title_1": {
        "en": "Build your empire",
        "de": "Bau dein Imperium",
        "es": "Construye tu imperio",
        "tr": "\u0130mparatorlu\u011funu",
        "ru": "\u0421\u0442\u0440\u043e\u0439\u0442\u0435 \u0438\u043c\u043f\u0435\u0440\u0438\u044e",
    },
    "hero_title_2": {
        "en": "from your terminal.",
        "de": "von deinem Terminal aus.",
        "es": "desde tu terminal.",
        "tr": "terminalinden kur.",
        "ru": "\u0438\u0437 \u0441\u0432\u043e\u0435\u0433\u043e \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430.",
    },
    "hero_lede": {
        "en": "Mines, research, fleets and wars, all from the same window as your code. It keeps running after you close it.",
        "de": "Minen, Forschung, Flotten und Kriege, alles im selben Fenster wie dein Code. Es l\u00e4uft weiter, wenn du es schlie\u00dft.",
        "es": "Minas, investigaci\u00f3n, flotas y guerras, todo en la misma ventana que tu c\u00f3digo. Sigue funcionando cuando la cierras.",
        "tr": "Madenler, ara\u015ft\u0131rma, filolar ve sava\u015flar, kodunu yazd\u0131\u011f\u0131n pencerede. Sen kapatt\u0131ktan sonra da i\u015flemeye devam eder.",
        "ru": "\u0428\u0430\u0445\u0442\u044b, \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f, \u0444\u043b\u043e\u0442\u044b \u0438 \u0432\u043e\u0439\u043d\u044b, \u0432 \u0442\u043e\u043c \u0436\u0435 \u043e\u043a\u043d\u0435, \u0433\u0434\u0435 \u0432\u0430\u0448 \u043a\u043e\u0434. \u0412\u0441\u0451 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0442\u043e\u0433\u043e, \u043a\u0430\u043a \u0432\u044b \u0435\u0433\u043e \u0437\u0430\u043a\u0440\u043e\u0435\u0442\u0435.",
    },
    "copy_label": {
        "en": "Copy", "de": "Kopieren", "es": "Copiar", "tr": "Kopyala", "ru": "\u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
    },
    "copy_done": {
        "en": "Copied", "de": "Kopiert", "es": "Copiado", "tr": "Kopyaland\u0131", "ru": "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e",
    },
    # -- MCP band --
    "mcp_title": {
        "en": "Or give it a commander.",
        "de": "Oder gib ihm einen Kommandanten.",
        "es": "O dale un comandante.",
        "tr": "Ya da bir komutan ver.",
        "ru": "\u0418\u043b\u0438 \u0434\u0430\u0439\u0442\u0435 \u0435\u043c\u0443 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u0430.",
    },
    "mcp_lede": {
        "en": "One command sets it up in your AI assistant. After that you ask for things instead of typing them. It signs in as you, and it can do exactly what you can do and nothing more.",
        "de": "Ein Befehl richtet es in deinem KI-Assistenten ein. Danach fragst du nach Dingen, statt sie zu tippen. Er meldet sich als du an und kann genau das, was du kannst, und nichts dar\u00fcber hinaus.",
        "es": "Un comando lo instala en tu asistente de IA. Despu\u00e9s pides las cosas en lugar de escribirlas. Entra como t\u00fa, y puede hacer exactamente lo que t\u00fa puedes y nada m\u00e1s.",
        "tr": "Tek komut oyunu yapay zek\u00e2 asistan\u0131na kuruyor. Sonras\u0131 yazmak yerine istemek. Senin olarak giri\u015f yapar, ve senin yapabildi\u011finin ayn\u0131s\u0131n\u0131 yapar, fazlas\u0131 de\u011fil.",
        "ru": "\u041e\u0434\u043d\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0443\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442 \u0438\u0433\u0440\u0443 \u0432 \u0432\u0430\u0448\u0435\u0433\u043e \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043d\u0442\u0430. \u0414\u0430\u043b\u044c\u0448\u0435 \u0432\u044b \u043f\u0440\u043e\u0441\u0438\u0442\u0435, \u0432\u043c\u0435\u0441\u0442\u043e \u0442\u043e\u0433\u043e \u0447\u0442\u043e\u0431\u044b \u043d\u0430\u0431\u0438\u0440\u0430\u0442\u044c. \u041e\u043d \u0432\u0445\u043e\u0434\u0438\u0442 \u043a\u0430\u043a \u0432\u044b \u0438 \u043c\u043e\u0436\u0435\u0442 \u0440\u043e\u0432\u043d\u043e \u0442\u043e \u0436\u0435, \u0447\u0442\u043e \u0438 \u0432\u044b, \u0438 \u043d\u0438\u0447\u0435\u0433\u043e \u0441\u0432\u0435\u0440\u0445 \u0442\u043e\u0433\u043e.",
    },
    "mcp_more": {
        "en": "How the commander works",
        "de": "Wie der Kommandant arbeitet",
        "es": "C\u00f3mo trabaja el comandante",
        "tr": "Komutan nas\u0131l \u00e7al\u0131\u015f\u0131yor",
        "ru": "\u041a\u0430\u043a \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440",
    },
    "mcp_ask": {
        "en": "what should I do next",
        "de": "was soll ich als N\u00e4chstes tun",
        "es": "qu\u00e9 deber\u00eda hacer ahora",
        "tr": "s\u0131rada ne yapmal\u0131y\u0131m",
        "ru": "\u0447\u0442\u043e \u043c\u043d\u0435 \u0434\u0435\u043b\u0430\u0442\u044c \u0434\u0430\u043b\u044c\u0448\u0435",
    },
    "mcp_reply": {
        "en": "Your solar plant is at 8 and production is running at 0.71, so every mine here is slow. Take the plant to 9 first: 4,240 metal, about eleven minutes. Separately, room_to_keep_it is finished and unclaimed. That is 2,500 metal. Claim it?",
        "de": "Dein Solarkraftwerk steht auf 8 und die Produktion l\u00e4uft auf 0,71, also ist jede Mine hier langsam. Bring das Kraftwerk zuerst auf 9: 4.240 Metall, etwa elf Minuten. Au\u00dferdem ist room_to_keep_it fertig und nicht eingel\u00f6st. Das sind 2.500 Metall. Einl\u00f6sen?",
        "es": "Tu planta solar est\u00e1 en 8 y la producci\u00f3n va a 0,71, as\u00ed que todas las minas de aqu\u00ed van lentas. Sube la planta a 9 primero: 4.240 de metal, unos once minutos. Aparte, room_to_keep_it est\u00e1 terminada y sin cobrar. Son 2.500 de metal. \u00bfLa cobro?",
        "tr": "G\u00fcne\u015f santralin 8&#39;de ve \u00fcretim 0,71&#39;de \u00e7al\u0131\u015f\u0131yor, yani buradaki b\u00fct\u00fcn madenler yava\u015f. \u00d6nce santrali 9&#39;a \u00e7ek: 4.240 metal, yakla\u015f\u0131k on bir dakika. Ayr\u0131ca room_to_keep_it bitmi\u015f ve al\u0131nmam\u0131\u015f. 2.500 metal ediyor. Alay\u0131m m\u0131?",
        "ru": "\u0412\u0430\u0448\u0430 \u0441\u043e\u043b\u043d\u0435\u0447\u043d\u0430\u044f \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u0441\u0442\u0430\u043d\u0446\u0438\u044f \u043d\u0430 \u0443\u0440\u043e\u0432\u043d\u0435 8, \u0430 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e \u0438\u0434\u0451\u0442 \u043d\u0430 0,71, \u0442\u0430\u043a \u0447\u0442\u043e \u0432\u0441\u0435 \u0448\u0430\u0445\u0442\u044b \u0437\u0434\u0435\u0441\u044c \u0440\u0430\u0431\u043e\u0442\u0430\u044e\u0442 \u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e. \u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043f\u043e\u0434\u043d\u0438\u043c\u0438\u0442\u0435 \u0441\u0442\u0430\u043d\u0446\u0438\u044e \u0434\u043e 9: 4 240 \u043c\u0435\u0442\u0430\u043b\u043b\u0430, \u043e\u043a\u043e\u043b\u043e \u043e\u0434\u0438\u043d\u0430\u0434\u0446\u0430\u0442\u0438 \u043c\u0438\u043d\u0443\u0442. \u041e\u0442\u0434\u0435\u043b\u044c\u043d\u043e: room_to_keep_it \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e \u0438 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043e. \u042d\u0442\u043e 2 500 \u043c\u0435\u0442\u0430\u043b\u043b\u0430. \u041f\u043e\u043b\u0443\u0447\u0438\u0442\u044c?",
    },
    # -- footer brand --
    "foot_desc": {
        "en": "An OGame-style strategy game you play from a terminal. The universe keeps running while the client is closed.",
        "de": "Ein Strategiespiel im OGame-Stil, das du im Terminal spielst. Das Universum l\u00e4uft weiter, auch wenn der Client geschlossen ist.",
        "es": "Un juego de estrategia al estilo de OGame que se juega desde la terminal. El universo sigue funcionando con el cliente cerrado.",
        "tr": "Terminalden oynanan, OGame tarz\u0131 bir strateji oyunu. \u0130stemci kapal\u0131yken de evren i\u015flemeye devam eder.",
        "ru": "\u0421\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044f \u0432 \u0434\u0443\u0445\u0435 OGame, \u0432 \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u0438\u0433\u0440\u0430\u044e\u0442 \u0438\u0437 \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043b\u0430. \u0412\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c, \u043f\u043e\u043a\u0430 \u043a\u043b\u0438\u0435\u043d\u0442 \u0437\u0430\u043a\u0440\u044b\u0442.",
    },
    # -- footer columns --
    "col_play": {
        "en": "Play", "de": "Spielen", "es": "Jugar", "tr": "Oyna", "ru": "\u0418\u0433\u0440\u0430\u0442\u044c",
    },
    "col_learn": {
        "en": "Learn", "de": "Lernen", "es": "Aprender", "tr": "\u00d6\u011fren", "ru": "\u0418\u0437\u0443\u0447\u0438\u0442\u044c",
    },
    "col_service": {
        "en": "Service", "de": "Betrieb", "es": "Servicio", "tr": "Servis", "ru": "\u0421\u0435\u0440\u0432\u0438\u0441",
    },
    "col_community": {
        "en": "Community", "de": "Community", "es": "Comunidad", "tr": "Topluluk", "ru": "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e",
    },
    "link_signup": {
        "en": "Sign up", "de": "Registrieren", "es": "Crear cuenta", "tr": "Kaydol", "ru": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
    },
    "link_login": {
        "en": "Log in", "de": "Anmelden", "es": "Iniciar sesi\u00f3n", "tr": "Giri\u015f yap", "ru": "\u0412\u043e\u0439\u0442\u0438",
    },
    "link_ranking": {
        "en": "Ranking", "de": "Rangliste", "es": "Clasificaci\u00f3n", "tr": "S\u0131ralama", "ru": "\u0420\u0435\u0439\u0442\u0438\u043d\u0433",
    },
    "link_install_client": {
        "en": "Install the client", "de": "Client installieren", "es": "Instalar el cliente", "tr": "\u0130stemciyi kur", "ru": "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442",
    },
    "link_commander": {
        "en": "How the commander works", "de": "Wie der Kommandant arbeitet", "es": "C\u00f3mo trabaja el comandante", "tr": "Komutan nas\u0131l \u00e7al\u0131\u015f\u0131yor", "ru": "\u041a\u0430\u043a \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440",
    },
    "link_docs": {
        "en": "Docs", "de": "Doku", "es": "Documentaci\u00f3n", "tr": "Belgeler", "ru": "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f",
    },
    "link_commands": {
        "en": "Commands", "de": "Befehle", "es": "Comandos", "tr": "Komutlar", "ru": "\u041a\u043e\u043c\u0430\u043d\u0434\u044b",
    },
    "link_mechanics": {
        "en": "Game mechanics", "de": "Spielmechanik", "es": "Mec\u00e1nicas del juego", "tr": "Oyun mekanikleri", "ru": "\u041c\u0435\u0445\u0430\u043d\u0438\u043a\u0430 \u0438\u0433\u0440\u044b",
    },
    "link_about": {
        "en": "About", "de": "\u00dcber das Spiel", "es": "Acerca de", "tr": "Hakk\u0131nda", "ru": "\u041e\u0431 \u0438\u0433\u0440\u0435",
    },
    "link_faq": {
        "en": "FAQ", "de": "Fragen", "es": "Preguntas", "tr": "Sorular", "ru": "\u0412\u043e\u043f\u0440\u043e\u0441\u044b",
    },
    "link_changelog": {
        "en": "Changelog", "de": "\u00c4nderungen", "es": "Cambios", "tr": "De\u011fi\u015fiklikler", "ru": "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f",
    },
    "link_status": {
        "en": "Status", "de": "Status", "es": "Estado", "tr": "Durum", "ru": "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435",
    },
    "link_terms": {
        "en": "Terms", "de": "Bedingungen", "es": "Condiciones", "tr": "Ko\u015fullar", "ru": "\u0423\u0441\u043b\u043e\u0432\u0438\u044f",
    },
    "link_privacy": {
        "en": "Privacy", "de": "Datenschutz", "es": "Privacidad", "tr": "Gizlilik", "ru": "\u041a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
    },
    "link_cookies": {
        "en": "Cookies", "de": "Cookies", "es": "Cookies", "tr": "\u00c7erezler", "ru": "Cookie",
    },
    # -- footer base --
    "formula_note": {
        "en": "Every formula comes from the",
        "de": "Jede Formel stammt aus dem",
        "es": "Cada f\u00f3rmula viene de la",
        "tr": "Her form\u00fcl",
        "ru": "\u041a\u0430\u0436\u0434\u0430\u044f \u0444\u043e\u0440\u043c\u0443\u043b\u0430 \u0432\u0437\u044f\u0442\u0430 \u0438\u0437",
    },
    "lang_aria": {
        "en": "Language", "de": "Sprache", "es": "Idioma", "tr": "Dil", "ru": "\u042f\u0437\u044b\u043a",
    },
    # -- version footer --
    "version_note": {
        "en": "run tarmy update to match the server",
        "de": "tarmy update ausf\u00fchren, um zum Server zu passen",
        "es": "ejecuta tarmy update para igualar al servidor",
        "tr": "sunucuyla e\u015fitlemek i\u00e7in tarmy update \u00e7al\u0131\u015ft\u0131r",
        "ru": "\u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 tarmy update, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0432\u043f\u0430\u0441\u0442\u044c \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043e\u043c",
    },
    "last_updated": {
        "en": "last updated",
        "de": "zuletzt aktualisiert",
        "es": "actualizado por \u00faltima vez el",
        "tr": "son g\u00fcncelleme",
        "ru": "\u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435",
    },
    "legal_aria": {
        "en": "Information and legal",
        "de": "Informationen und Rechtliches",
        "es": "Informaci\u00f3n y aviso legal",
        "tr": "Bilgi ve hukuki metinler",
        "ru": "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0438 \u043f\u0440\u0430\u0432\u043e\u0432\u044b\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b",
    },
    "footer_aria": {
        "en": "Footer",
        "de": "Footer",
        "es": "Footer",
        "tr": "Footer",
        "ru": "Footer",
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
