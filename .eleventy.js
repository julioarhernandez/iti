const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const embedJson = require('embed-json');
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const htmlmin = require("html-minifier");
const Image = require("@11ty/eleventy-img");
const {DateTime} = require("luxon");
const util = require('util');

module.exports = function (eleventyConfig) {
    eleventyConfig.addNunjucksAsyncShortcode("myImage", async function(src, alt, className, width=[350], outputFormat = "jpeg") {
        if(alt === undefined) {
          // You bet we throw an error on missing alt (alt="" works okay)
          throw new Error(`Missing \`alt\` on myImage from: ${src}`);
        }
        var source = `./src${src}`;
        // returns Promise
        let stats = await Image(source, {
          formats: [outputFormat],
          // This uses the original image width
          widths: width,
          urlPath: "/assets/img/",
          outputDir: "_site/assets/img/",
        });

        let prop = stats[outputFormat].pop();

        return `<img src="${prop.url}" width="${prop.width}" height="${prop.height}" alt="${alt}" class="${className}"/>`;
      });
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(sitemap, {
        sitemap: {
            lastModifiedProperty: "modified",
            hostname: "https://iti.edu",
        },
    });
    // https://www.11ty.dev/docs/data-deep-merge/
    eleventyConfig.setDataDeepMerge(true);

    eleventyConfig.addTransform("embedjson", function (content, outputPath) {
        if (outputPath.endsWith(".html")) {
            let contentEmbedded = embedJson(content);
            return contentEmbedded;
        }
        return content;
    });
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (process.env.ELEVENTY_PRODUCTION && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }

        return content;
    });
    eleventyConfig
        .addPassthroughCopy("./src/assets/css")
        .addPassthroughCopy("./src/assets/images")
        .addPassthroughCopy("./src/assets/js")
        .addPassthroughCopy("./src/assets/pdf")
        .addPassthroughCopy("./src/assets/plugins")
        .addPassthroughCopy("./src/assets/upload")
        .addPassthroughCopy("./src/robots.txt")
        .addPassthroughCopy("./src/favicon*")
        .addPassthroughCopy("./src/manifest.json")
        .addPassthroughCopy("./src/admin");
    eleventyConfig.addLayoutAlias("postsEn", "layouts/postsEn.njk");
    eleventyConfig.addFilter('console', function (value) {
        return util.inspect(value);
    });
    eleventyConfig.addFilter("filterTagList", tags => {
        // should match the list in tags.njk
        return (tags || []).filter(tag => ["post", "posts", "tagList"].indexOf(tag) === -1);
    });
    eleventyConfig.addFilter("cssmin", function(code) {
        return new cleanCss({}).minify(code).styles;
    });
    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    });
    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });
    eleventyConfig.addFilter("bust", (url) => {
        const [urlPart, paramPart] = url.split("?");
        const params = new URLSearchParams(paramPart || "");
        params.set("v", DateTime.local().toFormat("X"));
        return `${urlPart}?${params}`;
    });

    // Create an array of all tags
    eleventyConfig.addCollection("tagList", function (collection) {
        let tagSet = new Set();
        collection.getAll().forEach(item => {
            (item.data.tags || []).forEach(tag => tagSet.add(tag));
        });

        return [...tagSet];
    });

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: "njk",
        templateFormats: ["md", "njk", "html", "eot", "ttf", "woff", "woff2", "svg", "jpg", "png", "css", "svg", "yml", "gif", "txt"],
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            layouts: "_includes/layouts"
        }

    }
};




