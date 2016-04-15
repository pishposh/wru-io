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
        Server saw that n was ${JSON.stringify(req.cookies["n"])},
        m1 was ${JSON.stringify(req.cookies["m1"])}, and
        m2 was ${JSON.stringify(req.cookies["m2"])}.
        <span id="js">JS hasn't run on client.</span>
        <noscript>(I'm in noscript!)</noscript>

        <script>
            (function () {
                var js = document.getElementById("js");
                var n = (window.document.cookie.match(/(^|;) *n=([^;]*)/) || [])[2];
                var m1 = (window.document.cookie.match(/(^|;) *m1=([^;]*)/) || [])[2];
                var m2 = (window.document.cookie.match(/(^|;) *m2=([^;]*)/) || [])[2];
                js.innerHTML = "JS on client sees that n is " + JSON.stringify(n) +
                    ", m1 is " + JSON.stringify(m1) + ", and m2 is " + JSON.stringify(m2) + ".";
            })();
        </script>
    `;


let app = express();
app.set("etag", false);
app.set("x-powered-by", false);

app.use(cookieParser());

morgan.token("nn", (req) => req.cookies["n"]);
app.use(morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" n=:nn xff=":req[x-forwarded-for]" host=":req[host]"'
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
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@tarobomb" />
                <meta name="twitter:title" content="yank test" />
                <meta name="twitter:description" content="This is yank on ${req.hostname}." />
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
                <p>This is yank on ${req.hostname}. ${nmhtml(req)}</p>
                ${lips("yank")}
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
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@tarobomb" />
                <meta name="twitter:title" content="yank success" />
                <meta name="twitter:description" content="Welcome to ${req.hostname}. JS ran on yank and cookie exists!" />
                <title>yank success</title>
            </head>
            <body>
                <p>Welcome to ${req.hostname}. JS ran on yank and cookie exists! ${nmhtml(req)}</p>
                ${lips("yank-success")}
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
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@tarobomb" />
                <meta name="twitter:title" content="yank cookie error" />
                <meta name="twitter:description" content="Welcome to ${req.hostname}. JS ran on yank, but cookie did not exist!" />
                <title>yank cookie error</title>
            </head>
            <body>
                <p>Welcome to ${req.hostname}. JS ran on yank, but cookie did not exist! ${nmhtml(req)}</p>
                ${lips("yank-fail")}
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
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:site" content="@tarobomb" />
                    <meta name="twitter:title" content="redirect success" />
                    <meta name="twitter:description" content="Welcome to ${req.hostname}. Cookie exists on redirect-verify!" />
                    <title>redirect success</title>
                </head>
                <body>
                    <p>Welcome to ${req.hostname}. Cookie exists on redirect-verify! ${nmhtml(req)}</p>
                    ${lips("redirect-ok")}
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
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@tarobomb" />
                <meta name="twitter:title" content="redirect cookie error" />
                <meta name="twitter:description" content="Welcome to ${req.hostname}. Cookie did not exist on redirect-verify!" />
                <title>redirect cookie error</title>
            </head>
            <body>
                <p>Welcome to ${req.hostname}. Cookie did not exist on redirect-verify! ${nmhtml(req)}</p>
                ${lips("redirect-fail")}
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
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:site" content="@tarobomb" />
                    <meta name="twitter:title" content="${title}" />
                    <meta name="twitter:description" content="Welcome to ${req.hostname}!" />
                    <title>${title}</title>
                </head>
                <body>
                    <p>Welcome to ${req.hostname}! ${nmhtml(req)}</p>
                    ${html}
                </body>
            </html>
        `);
    };
};

function lips(seed, nParas) {
    return loremIpsum({
        count: 5, units: "paragraphs", format: "html",
        paragraphLowerBound: 1, paragraphUpperBound: 5,
        random: seedrandom(seed)
    });
}

let server = app.listen(process.env.PORT || 80, function () {
    console.log(`server listening on port ${server.address().port}`);
});
