#!/bin/bash

yarn run deploy:prod || exit 1
rm -R ~/zdrojaky/python/app_engine/makonreact/static/ ~/zdrojaky/python/app_engine/makonreact/index.html
mv dist/index.html ~/zdrojaky/python/app_engine/makonreact/index.html || exit 1
mv dist ~/zdrojaky/python/app_engine/makonreact/static || exit 1
#~/share/install/google/app_engine/google_appengine_1.9.19/appcfg.py --oauth2 update ~/zdrojaky/python/app_engine/makonreact
gcloud app deploy ~/zdrojaky/python/app_engine/makonreact
