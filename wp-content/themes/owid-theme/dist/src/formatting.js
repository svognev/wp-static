"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var urlSlug = require('url-slug');
var wpautop = require('wpautop');
var _ = require("lodash");
var React = require("react");
var ReactDOMServer = require("react-dom/server");
var settings_1 = require("./settings");
var wpdb_1 = require("./wpdb");
var Tablepress_1 = require("./views/Tablepress");
var path = require("path");
var mjAPI = require("mathjax-node");
function romanize(num) {
    if (!+num)
        return "";
    var digits = String(+num).split(""), key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
        "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], roman = "", i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}
mjAPI.config({
    MathJax: {}
});
mjAPI.start();
function extractLatex(html) {
    var latexBlocks = [];
    html = html.replace(/\[latex\]([\s\S]*?)\[\/latex\]/gm, function (_, latex) {
        latexBlocks.push(latex.replace("\\[", "").replace("\\]", "").replace(/\$\$/g, ""));
        return "[latex]";
    });
    return [html, latexBlocks];
}
function formatLatex(html, latexBlocks) {
    return __awaiter(this, void 0, void 0, function () {
        var compiled, _i, latexBlocks_1, latex, result, err_1, i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!latexBlocks)
                        _a = extractLatex(html), html = _a[0], latexBlocks = _a[1];
                    compiled = [];
                    _i = 0, latexBlocks_1 = latexBlocks;
                    _b.label = 1;
                case 1:
                    if (!(_i < latexBlocks_1.length)) return [3 /*break*/, 6];
                    latex = latexBlocks_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, mjAPI.typeset({ math: latex, format: "TeX", svg: true })];
                case 3:
                    result = _b.sent();
                    compiled.push(result.svg.replace("<svg", "<svg class=\"latex\""));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    compiled.push(latex + " (parse error: " + err_1 + ")");
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    i = -1;
                    return [2 /*return*/, html.replace(/\[latex\]/g, function (_) {
                            i += 1;
                            return compiled[i];
                        })];
            }
        });
    });
}
function formatWordpressPost(post, html, grapherExports) {
    return __awaiter(this, void 0, void 0, function () {
        var latexBlocks, footnotes, tables, $, sectionStarts, _i, sectionStarts_1, start, $start, $contents, $wrapNode, grapherIframes, _a, grapherIframes_1, el, src, chart, output, $p, _b, _c, iframe, _d, _e, p, $p, _f, _g, table, $table, $div, uploadDex, _h, _j, el, $el, src, upload, $a, hasToc, openHeadingIndex, openSubheadingIndex, tocHeadings, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    // Strip comments
                    html = html.replace(/<!--[^>]+-->/g, "");
                    // Standardize spacing
                    html = html.replace(/&nbsp;/g, "").replace(/\r\n/g, "\n").replace(/\n+/g, "\n").replace(/\n/g, "\n\n");
                    _k = extractLatex(html), html = _k[0], latexBlocks = _k[1];
                    // Replicate wordpress formatting (thank gods there's an npm package)
                    html = wpautop(html);
                    return [4 /*yield*/, formatLatex(html, latexBlocks)
                        // Footnotes
                    ];
                case 1:
                    html = _l.sent();
                    footnotes = [];
                    html = html.replace(/\[ref\]([\s\S]*?)\[\/ref\]/gm, function (_, footnote) {
                        footnotes.push(footnote);
                        var i = footnotes.length;
                        return "<a id=\"ref-" + i + "\" class=\"ref\" href=\"#note-" + i + "\"><sup>" + i + "</sup></a>";
                    });
                    return [4 /*yield*/, wpdb_1.getTables()];
                case 2:
                    tables = _l.sent();
                    html = html.replace(/\[table\s+id=(\d+)\s*\/\]/g, function (match, tableId) {
                        var table = tables.get(tableId);
                        if (table)
                            return ReactDOMServer.renderToStaticMarkup(React.createElement(Tablepress_1.default, { data: table.data }));
                        else
                            return "UNKNOWN TABLE";
                    });
                    // These old things don't work with static generation, link them through to maxroser.com
                    html = html.replace(new RegExp("https://ourworldindata.org/wp-content/uploads/nvd3", 'g'), "https://www.maxroser.com/owidUploads/nvd3")
                        .replace(new RegExp("https://ourworldindata.org/wp-content/uploads/datamaps", 'g'), "https://www.maxroser.com/owidUploads/datamaps");
                    $ = cheerio.load(html);
                    sectionStarts = [$("body").children().get(0)].concat($("h2").toArray());
                    for (_i = 0, sectionStarts_1 = sectionStarts; _i < sectionStarts_1.length; _i++) {
                        start = sectionStarts_1[_i];
                        $start = $(start);
                        $contents = $start.nextUntil("h2");
                        $wrapNode = $("<section></section>");
                        $contents.remove();
                        $wrapNode.append($start.clone());
                        $wrapNode.append($contents);
                        $start.replaceWith($wrapNode);
                    }
                    // Replace grapher iframes with static previews
                    if (grapherExports) {
                        grapherIframes = $("iframe").toArray().filter(function (el) { return (el.attribs['src'] || '').match(/\/grapher\//); });
                        for (_a = 0, grapherIframes_1 = grapherIframes; _a < grapherIframes_1.length; _a++) {
                            el = grapherIframes_1[_a];
                            src = el.attribs['src'];
                            chart = grapherExports.get(src);
                            if (chart) {
                                output = "<figure data-grapher-src=\"" + src + "\" class=\"grapherPreview\"><a href=\"" + src + "\" target=\"_blank\"><div><img src=\"" + chart.svgUrl + "\"/></div></a></div>";
                                $p = $(el).closest('p');
                                $(el).remove();
                                $p.after(output);
                            }
                        }
                    }
                    // Any remaining iframes: ensure https embeds
                    if (settings_1.HTTPS_ONLY) {
                        for (_b = 0, _c = $("iframe").toArray(); _b < _c.length; _b++) {
                            iframe = _c[_b];
                            iframe.attribs['src'] = iframe.attribs['src'].replace("http://", "https://");
                        }
                    }
                    // Remove any empty elements
                    for (_d = 0, _e = $("p").toArray(); _d < _e.length; _d++) {
                        p = _e[_d];
                        $p = $(p);
                        if ($p.contents().length === 0)
                            $p.remove();
                    }
                    // Wrap tables so we can do overflow-x: scroll if needed
                    for (_f = 0, _g = $("table").toArray(); _f < _g.length; _f++) {
                        table = _g[_f];
                        $table = $(table);
                        $div = $("<div class='tableContainer'></div>");
                        $table.after($div);
                        $div.append($table);
                    }
                    return [4 /*yield*/, wpdb_1.getUploadedImages()];
                case 3:
                    uploadDex = _l.sent();
                    for (_h = 0, _j = $("img").toArray(); _h < _j.length; _h++) {
                        el = _j[_h];
                        $el = $(el);
                        // Open full-size image in new tab
                        if (el.parent.tagName === "a") {
                            el.parent.attribs['target'] = '_blank';
                        }
                        src = el.attribs['src'] || "";
                        upload = uploadDex.get(path.basename(src));
                        if (upload && upload.variants.length) {
                            el.attribs['srcset'] = upload.variants.map(function (v) { return v.url + " " + v.width + "w"; }).join(", ");
                            el.attribs['sizes'] = "(min-width: 800px) 50vw, 100vw";
                            // Link through to full size image
                            if (el.parent.tagName !== "a") {
                                $a = $("<a href=\"" + upload.originalUrl + "\" target=\"_blank\"></a>");
                                $el.replaceWith($a);
                                $a.append($el);
                            }
                        }
                    }
                    hasToc = post.type === 'page' && post.slug !== 'about';
                    openHeadingIndex = 0;
                    openSubheadingIndex = 0;
                    tocHeadings = [];
                    $("h1, h2, h3, h4").each(function (_, el) {
                        var $heading = $(el);
                        var headingText = $heading.text();
                        // We need both the text and the html because may contain footnote
                        var headingHtml = $heading.html();
                        var slug = urlSlug(headingText);
                        // Table of contents
                        if (hasToc) {
                            if ($heading.is("#footnotes") && footnotes.length > 0) {
                                tocHeadings.push({ text: headingText, slug: "footnotes", isSubheading: false });
                            }
                            else if (!$heading.is('h1') && !$heading.is('h4')) {
                                // Inject numbering into the text as well
                                if ($heading.is('h2')) {
                                    openHeadingIndex += 1;
                                    openSubheadingIndex = 0;
                                }
                                else if ($heading.is('h3')) {
                                    openSubheadingIndex += 1;
                                }
                                if (openHeadingIndex > 0) {
                                    if ($heading.is('h2')) {
                                        headingHtml = romanize(openHeadingIndex) + '. ' + headingHtml;
                                        $heading.html(headingHtml);
                                        tocHeadings.push({ text: $heading.text(), slug: slug, isSubheading: false });
                                    }
                                    else {
                                        headingHtml = romanize(openHeadingIndex) + '.' + openSubheadingIndex + ' ' + headingHtml;
                                        $heading.html(headingHtml);
                                        tocHeadings.push({ text: $heading.text(), slug: slug, isSubheading: true });
                                    }
                                }
                            }
                        }
                        // Deep link
                        $heading.attr('id', slug).prepend("<a class=\"deep-link\" href=\"#" + slug + "\"></a>");
                    });
                    return [2 /*return*/, {
                            id: post.id,
                            type: post.type,
                            slug: post.slug,
                            title: post.title,
                            date: post.date,
                            modifiedDate: post.modifiedDate,
                            authors: post.authors,
                            html: $("body").html(),
                            footnotes: footnotes,
                            excerpt: post.excerpt || $($("p")[0]).text(),
                            imageUrl: post.imageUrl,
                            tocHeadings: tocHeadings
                        }];
            }
        });
    });
}
exports.formatWordpressPost = formatWordpressPost;
function formatPost(post, grapherExports) {
    return __awaiter(this, void 0, void 0, function () {
        var html, isRaw;
        return __generator(this, function (_a) {
            html = post.content;
            // Standardize urls
            html = html.replace(new RegExp(settings_1.WORDPRESS_URL, 'g'), settings_1.BAKED_URL)
                .replace(new RegExp("https?://ourworldindata.org", 'g'), settings_1.BAKED_URL);
            isRaw = html.match(/<!--raw-->/);
            if (isRaw) {
                return [2 /*return*/, {
                        id: post.id,
                        type: post.type,
                        slug: post.slug,
                        title: post.title,
                        date: post.date,
                        modifiedDate: post.modifiedDate,
                        authors: post.authors,
                        html: html,
                        footnotes: [],
                        excerpt: post.excerpt || "",
                        imageUrl: post.imageUrl,
                        tocHeadings: []
                    }];
            }
            else {
                return [2 /*return*/, formatWordpressPost(post, html, grapherExports)];
            }
            return [2 /*return*/];
        });
    });
}
exports.formatPost = formatPost;
function formatAuthors(authors, requireMax) {
    if (requireMax && authors.indexOf("Max Roser") === -1)
        authors.push("Max Roser");
    var authorsText = authors.slice(0, -1).join(", ");
    if (authorsText.length == 0)
        authorsText = authors[0];
    else
        authorsText += " and " + _.last(authors);
    return authorsText;
}
exports.formatAuthors = formatAuthors;
function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
}
exports.formatDate = formatDate;
//# sourceMappingURL=formatting.js.map