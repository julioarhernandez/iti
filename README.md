To install dependencies, build and run the site:

    bundle install
    bundle exec jekyll serve
    open http://127.0.0.1:4000

To snapshot it in Percy, set your `PERCY_TOKEN` environment variable and then run:
    
    export PERCY_TOKEN=token-number
    npx percy snapshot _site