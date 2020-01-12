# Bibliogram

## An alternative front-end for Instagram.

Bibliogram works without client-side JavaScript, has no ads or tracking, and doesn't urge you to sign up.

See also: [Invidious, a front-end for YouTube.](https://github.com/omarroth/invidious)

## Features

- [x] View profile and timeline
- [x] User memory cache
- [ ] Image disk cache
- [ ] View post
- [ ] Homepage
- [ ] Optimised for mobile
- [ ] Favicon
- [ ] Infinite scroll
- [ ] Settings (e.g. data saving)
- [ ] Galleries
- [ ] List view
- [ ] Videos
- [ ] IGTV
- [ ] Public API
- [ ] Rate limiting
- [ ] Explore tags
- [ ] Explore locations
- [ ] _more..._

These features may not be able to be implemented for technical reasons:

- Stories

These features will not be added:

- Comments

## Instances

There is currently no official Bibliogram instance. You will have to run your own, or find someone else's.

If you only use one computer, you can install Bibliogram on that computer and then access the instance through localhost.

## Installing

1. `git clone https://github.com/cloudrac3r/bibliogram`
1. `npm install`
1. `npm start`

Bibliogram is now running on `0.0.0.0:10407`.

## User-facing endpoints

- `/u/{username}` - load a user's profile and timeline
