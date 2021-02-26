const { nativeTheme } = require("electron");
const settings = require("electron-settings");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const contextmenu = require("electron-context-menu");
const { openProcessManager } = require('@krisdages/electron-process-manager');

function commandLine() {
    return yargs(hideBin(process.argv))
        .usage('Usage: $0 [options]')
        .option('login', {
            alias: 'l',
            type: 'array',
            description: 'Autologin on darkorbit. Example: --login user pass'
        })
        .option('dosid', {
            alias: 'sid',
            type: "string",
            description: "Run client with custom dosid"
        })
        .option('dev', {
            alias: 'd',
            type: 'boolean',
            description: 'Run in development mode',
            default: false
        })
        .epilog('for more information visit https://github.com/kaiserdj/Darkorbit-client')
        .argv;
}

function settingsWindow(window, type) {
    if (settings.getSync()[type].max) {
        window.maximize();
    }

    window.on('maximize', () => {
        let backup = settings.getSync();
        backup[type].max = true;
        settings.setSync(backup);
    });

    window.on("unmaximize", () => {
        let backup = settings.getSync();
        backup[type].max = false;
        settings.setSync(backup);
    });

    window.on('resize', () => {
        let backup = settings.getSync();
        let size = window.getSize();
        backup[type].width = size[0];
        backup[type].height = size[1];

        settings.setSync(backup);
    })

    window.on('move', (data) => {
        let backup = settings.getSync();
        let pos = data.sender.getBounds();
        backup[type].x = pos.x;
        backup[type].y = pos.y;

        settings.setSync(backup);
    });
}

function contextMenu(dev) {
    contextmenu({
        shouldShowMenu: (event, params) => {
            switch (params.pageURL.split(":")[0]) {
                case "file":
                    if (dev) {
                        return true;
                    } else {
                        return false;
                    }
                    default:
                        return true;
            }
        },
        prepend: (defaultActions, params, browserWindow) => [{
                label: 'Back',
                icon: `${__dirname}/contextMenu/back${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                enabled: browserWindow.webContents.canGoBack(),
                click: (menu, win) => win.webContents.goBack()
            },
            {
                label: 'Forward',
                icon: `${__dirname}/contextMenu/forward${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                enabled: browserWindow.webContents.canGoForward(),
                click: (menu, win) => win.webContents.goForward()
            },
            {
                label: 'Refresh',
                icon: `${__dirname}/contextMenu/refresh${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                click: (menu, win) => win.webContents.reload()
            },
            {
                label: 'Full Screen',
                icon: `${__dirname}/contextMenu/fullscreen${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                visible: !browserWindow.isFullScreen(),
                click: (menu, win) => win.setFullScreen(true)
            },
            {
                label: 'Full Screen',
                icon: `${__dirname}/contextMenu/fullscreen_exit${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                visible: browserWindow.isFullScreen(),
                click: (menu, win) => win.setFullScreen(false)
            },
            { type: 'separator' },
            { 
                role: 'resetzoom',
                label: 'Normal zoom',
                icon: `${__dirname}/contextMenu/resetZoom${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`
            },
            { 
                role: 'zoomin',
                icon: `${__dirname}/contextMenu/zoomIn${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png` 
            },
            { 
                role: 'zoomout',
                icon: `${__dirname}/contextMenu/zoomOut${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png` 
            },
            {
                type: 'separator',
                visible: dev
            },
            {
                label: 'Inspect Element',
                icon: `${__dirname}/contextMenu/inspectElement${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                visible: dev,
                click: () => browserWindow.inspectElement(params.x, params.y)
            },
            {
                label: 'Process Manager',
                icon: `${__dirname}/contextMenu/processManager${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                visible: dev,
                click: () => openProcessManager()
            },
            { 
                role: 'forcereload',
                label: 'Force reload',
                icon: `${__dirname}/contextMenu/forceReload${nativeTheme.shouldUseDarkColors ? "" : "_dark"}.png`,
                visible: dev
            }
        ],
        showLookUpSelection: false,
        showCopyImage: false,
        showCopyImageAddress: false,
        showSaveImage: false,
        showSaveImageAs: false,
        showSaveLinkAs: false,
        showInspectElement: false,
        showServices: false,
        showSearchWithGoogle: false
    });
}

module.exports = {
    commandLine,
    settingsWindow,
    contextMenu
}