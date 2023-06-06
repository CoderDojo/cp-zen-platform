# cp-zen-platform

## About

This is the API server and middleware repository of the [CoderDojo Zen Community Platform](https://github.com/CoderDojo/community-platform) project.
It also contains our legacy front-end. In case of large PR regarding our front-end, we encourage you to use [cp-zen-frontend instead](https://github.com/CoderDojo/cp-zen-frontend). Small bugfixes are still welcome while the corresponding code is in use.

If you want to get set up to make a contribution, please see the [cp-local-development repository](https://github.com/CoderDojo/cp-local-development).

General documentation is in the [community-platform repository](https://github.com/CoderDojo/community-platform).

## Debugging

You can see HAPI interactions by setting `HAPI_DEBUG` to `true` in `web/config/development.env`.  This then outputs data to `/tmp/hapi-zen-platform.log` inside the zen container.
