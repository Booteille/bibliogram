# Bibliogram

## An alternative front-end for Instagram.

Bibliogram works without client-side JavaScript, has no ads or tracking, and doesn't urge you to sign up.

See also: [Invidious, a front-end for YouTube.](https://github.com/omarroth/invidious)

## Features

- [x] View profile and timeline
- [x] Infinite scroll
- [x] User memory cache
- [x] RSS (latest 12 posts)
- [x] View post
- [x] Galleries
- [ ] Videos
- [ ] Galleries of videos
- [ ] Image disk cache
- [ ] Clickable usernames and hashtags
- [ ] Homepage
- [ ] Proper error checking
- [ ] Optimised for mobile
- [ ] Favicon
- [ ] Settings (e.g. data saving)
- [ ] List view
- [ ] IGTV
- [ ] Public API
- [ ] Rate limiting
- [ ] Explore hashtags
- [ ] Explore locations
- [ ] _more..._

These features may not be able to be implemented for technical reasons:

- Stories

These features will not be added, unless you ask _reallllly_ nicely:

- Comments
- Tagging users

## Instances

There is currently no official Bibliogram instance.

Perflyst has hosted an instance on https://bibliogram.snopyta.org ([example page](https://bibliogram.snopyta.org/u/instagram)), but this is not managed by me and I cannot verify its code.

If you only use one computer, you can install Bibliogram on that computer and then access the instance through localhost.

## Installing

Bibliogram depends on GraphicsMagick for resizing thumbnails.

Ubuntu: `# apt install graphicsmagick`

1. `$ git clone https://github.com/cloudrac3r/bibliogram`
If you are using a fork, be sure to actually install that fork instead!
1. `$ npm install`
1. Edit `/config.js` to suit your server environment
1. `$ npm start`

Bibliogram is now running on `0.0.0.0:10407`.

## User-facing endpoints

- `/u/{username}` - load a user's profile and timeline
- `/u/{username}/rss.xml` - get the RSS feed for a user
- `/p/{shortcode}` - load a post
