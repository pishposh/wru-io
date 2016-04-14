"use strict";

let express         = require("express");
let cookieParser    = require("cookie-parser");
let fs              = require("fs");
let morgan          = require("morgan");

let hipsum = fs.readFileSync(`${__dirname}/hipsum.html-fragment`, "utf8");
let dimsum = fs.readFileSync(`${__dirname}/dimsum.html-fragment`, "utf8");

let app = express();
app.set("etag", false);
app.set("x-powered-by", false);

app.use(cookieParser());

morgan.token("nn", (req) => req.cookies["n"]);
app.use(morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" n=:nn xff=":req[x-forwarded-for]"'
));

app.get("/hipsum.html", endpoint(hipsum));
app.get("/", endpoint(dimsum));

function endpoint(html) {
    return (req, res) => {
        let n = req.cookies["n"];
        n = isNaN(n) ? 0 : +n;

        res.cookie("n", String(n + 1), {
            domain: ".wru.io",
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
                    <title>cookie test</title>
                </head>
                <body>
                    ${html}

                    <div style="color: #666; font-size: 0.8em">
                        <p>Server saw n=${n}.</p>
                        <p>Is JavaScript enabled? <span id="js">No?</span> <noscript>(I'm in a noscript tag!)</noscript></p>
                        <p>How's n look from here? <span id="c">Dunno.</span></p>
                    </div>

                    <script>
                        (function () {
                            var js = document.getElementById("js"),
                                c = document.getElementById("c");
                            js.innerHTML = "Yes!"
                            c.innerHTML = "" + (window.document.cookie.match(/(^|;) *n=([^;]*)/) || [])[2];
                        })();
                    </script>
                </body>
            </html>
        `);
    };
};

app.listen(80, function () {
    console.log('Example app listening on port 80!');
});
