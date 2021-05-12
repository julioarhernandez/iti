# Run the project in development mode

`npm install` 
`npm start`

# To build the project just:

`npm run build`

# Project structure

**Pages** folder is just a copy of html template for this theme. **DO NOT CHANGE THESE FILES**.
**Src** folder contains the important files.

## Source Folder

At **SRC** folder you can find the website pages. *Index.njk* would be the homepage.
https://github.com/julioarhernandez/iti/blob/master/src/index.njk

## Page Data, Front Matter

This is where you change each page title, description and links in the main menu.
Front Matter should be always wrapped by "---" and it should be always on top of the page.
```
---
layout: default.njk
title: InterAmerican Technical Institute
description: ITI is committed to providing high quality vocational technical education.
menu: home
---
```

- Title: Title of the page
- Description: Meta Description of the page
- menu: The name of the page in the main menu

## Analytics and Google tag manager

These two scripts are loaded in every page. Edit these files and they would be updated on every page.

https://github.com/julioarhernandez/iti/blob/master/src/_includes/scripts/analytics.njk
https://github.com/julioarhernandez/iti/blob/master/src/_includes/scripts/tagManager.njk





