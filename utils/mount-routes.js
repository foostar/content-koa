const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const router = new Router();

module.exports = (readPath) => {
    const absoluteReadPath = getRoutesPath(readPath);
    const routerMap = getRouerMap(absoluteReadPath);
    routerMap.map(({route, filePath}, idx) => {
        const m = require(filePath);
        if (m.constructor.name === 'Router') {
            router.use(route, m.routes());
            if (idx === 0) {
                log(`\n┏${Array(42).join('━')}┳${Array(83).join('━')}┓`.black);
            } else {
                log(`┣${Array(42).join('━')}╋${Array(83).join('━')}┫`.black);
            }
            log(
                '┃'.black,
                `${fixWidth(route)}`.green,
                '┃'.black,
                ` ${fixWidth(filePath, 80)}`.blue,
                '┃'.black
            );
            if (idx === routerMap.length - 1) {
                log(`┗${Array(42).join('━')}┻${Array(83).join('━')}┛\n`.black);
            }
        }
    });
    return router;
};

function log (...arg) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...arg);
    }
}

function getRoutesPath (readPath) {
    if (!readPath) {
        return path.resolve(
            path.dirname(module.parent.filename),
            'routes'
        );
    }
    if (path.isAbsolute(readPath)) {
        return readPath;
    }
    return path.resolve(
        path.dirname(module.parent.filename),
        readPath
    );
}

function getRouerMap (r) {
    const result = [];
    function routerMap (readPath, prefix = '/') {
        fs.readdirSync(readPath).forEach(cName => {
            const absolutePath = path.resolve(readPath, cName);
            const stat = fs.statSync(absolutePath);
            if (stat.isDirectory()) {
                routerMap(absolutePath, prefix + cName + '/');
            }
            if (!stat.isFile() || !cName.endsWith('.js')) return;
            if (cName !== 'index.js') {
                result.push({
                    route: prefix + cName.replace(/\.js$/, ''),
                    filePath: absolutePath
                });
            } else if (readPath !== __dirname) {
                result.push({
                    route: prefix.replace(/.+\/$/, ''),
                    filePath: absolutePath
                });
            }
        });
    }
    routerMap(r);
    return result;
}

function fixWidth (str, width = 40) {
    const restNum = width - str.length;
    if (restNum < 0) {
        return str.substr(0, width - 1);
    }
    return str + Array(restNum).join(' ');
}

