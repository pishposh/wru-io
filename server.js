"use strict";

let express         = require("express");
let cookieParser    = require("cookie-parser");
let fs              = require("fs");
let morgan          = require("morgan");
let seedrandom      = require("seedrandom");
let loremIpsum      = require("lorem-ipsum");
let tld             = require("tldjs");

let hipsum = fs.readFileSync(`${__dirname}/hipsum.html-fragment`, "utf8");
let dimsum = fs.readFileSync(`${__dirname}/dimsum.html-fragment`, "utf8");
let nmhtml = (req) => `
        <div style="color: #666; font-size: 0.8em">
            <div>Server saw n=${req.cookies["n"]}, m1=${req.cookies["m1"]}, m2=${req.cookies["m2"]}.</div>
            <div>Did JavaScript run here? <span id="js">No.</span> <noscript>(I'm in a noscript tag!)</noscript></div>
            <div>How's n look from here? <span id="n">Dunno.</span></div>
            <div>How's m1 look from here? <span id="m1">Dunno.</span></div>
            <div>How's m2 look from here? <span id="m2">Dunno.</span></div>
        </div>

        <script>
            (function () {
                var js = document.getElementById("js"),
                    n = document.getElementById("n"),
                    m1 = document.getElementById("m1"),
                    m2 = document.getElementById("m2");
                js.innerHTML = "Yes!"
                n.innerHTML = "" + (window.document.cookie.match(/(^|;) *n=([^;]*)/) || [])[2];
                m1.innerHTML = "" + (window.document.cookie.match(/(^|;) *m1=([^;]*)/) || [])[2];
                m2.innerHTML = "" + (window.document.cookie.match(/(^|;) *m2=([^;]*)/) || [])[2];
            })();
        </script>
    `;


let app = express();
app.set("etag", false);
app.set("x-powered-by", false);

app.use(cookieParser());

morgan.token("nn", (req) => req.cookies["n"]);
app.use(morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" n=:nn xff=":req[x-forwarded-for]"'
));

app.get("/", endpoint("cookie test", dimsum));
app.get("/hipsum.html", endpoint("hipsum", hipsum));

app.get("/yank.html", (req, res) => {
    nplusone(req, res);
    res.cookie("m1", "z1-rkvfgf", {
        domain: tld.getPublicSuffix(req.hostname) ? "." + tld.getDomain(req.hostname) : undefined,
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    res.type("text/html");
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>yank test</title>
                <script>
                    (function () {
                        var m1 = (window.document.cookie.match(/(^|;) *m1=([^;]*)/) || [])[2];
                        if (!!m1) {
                            window.location = r("./lnax-" + m1) + r(".ugzy");
                        } else {
                            window.location = r("./lnax") + r("-pbbxvr-") + r("reebe.ugzy");
                        }
                        function r(a,b){return++b?String.fromCharCode((a<"["?91:123)>(a=a.charCodeAt()+13)?a:a-26):a.replace(/[a-zA-Z]/g,r)}
                    })();
                </script>
            </head>
            <body>
                <p>This is the yank page on ${req.hostname}.</p>
                ${lips("yank")}
                ${nmhtml(req)}
            </body>
        </html>
    `);
});

app.get("/yank-m1-exists.html", (req, res) => {
    nplusone(req, res);
    res.type("text/html");
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>yank success</title>
            </head>
            <body>
                <p>JavaScript ran on ${req.hostname} yank and cookie exists!</p>
                ${lips("yank-success")}
                ${nmhtml(req)}
            </body>
        </html>
    `);
});

app.get("/yank-cookie-error.html", (req, res) => {
    nplusone(req, res);
    res.type("text/html");
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>yank cookie error</title>
            </head>
            <body>
                <p>JavaScript ran on ${req.hostname} yank, but cookie did not exist!</p>
                ${lips("yank-fail")}
                ${nmhtml(req)}
            </body>
        </html>
    `);
});

app.get("/redirect.html", (req, res) => {
    nplusone(req, res);
    res.cookie("m2", "hello", {
        domain: tld.getPublicSuffix(req.hostname) ? "." + tld.getDomain(req.hostname) : undefined,
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    res.redirect("/redirect-verify.html");
});

app.get("/redirect-verify.html", (req, res) => {
    nplusone(req, res);
    if (!!req.cookies["m2"]) {
        res.type("text/html");
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>redirect success</title>
                </head>
                <body>
                    <p>Cookie exists on ${req.hostname} redirect-verify!</p>
                    ${lips("redirect-ok")}
                    ${nmhtml(req)}
                </body>
            </html>
        `);
    } else {
        res.redirect("/redirect-fail.html");
    }
});

app.get("/redirect-fail.html", (req, res) => {
    nplusone(req, res);
    res.type("text/html");
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>redirect cookie error</title>
            </head>
            <body>
                <p>Cookie did not exist on ${req.hostname} redirect-verify!</p>
                ${lips("redirect-fail")}
                ${nmhtml(req)}
            </body>
        </html>
    `);
});

app.use(express.static(`${__dirname}/static`));

function nplusone(req, res) {
    let n = req.cookies["n"];
    res.cookie("n", String(isNaN(n) ? 1 : +n + 1), {
        domain: tld.getPublicSuffix(req.hostname) ? "." + tld.getDomain(req.hostname) : undefined,
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
}

function endpoint(title, html) {
    return (req, res) => {
        nplusone(req, res);
        res.type("text/html");
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>${title}</title>
                </head>
                <body>
                    <p>Welcome to ${req.hostname}!</p>
                    ${html}
                    ${nmhtml(req)}
                </body>
            </html>
        `);
    };
};

function lips(seed) {
    return loremIpsum({
        count: 5, units: "paragraphs", format: "html",
        paragraphLowerBound: 1, paragraphUpperBound: 5,
        random: seedrandom(seed)
    });
}

let server = app.listen(process.env.PORT || 80, function () {
    console.log(`server listening on port ${server.address().port}`);
});
