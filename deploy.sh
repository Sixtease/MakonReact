#!/bin/bash

npm run build || exit 1
rm -R ~/zdrojaky/python/app_engine/makonreact/static/ ~/zdrojaky/python/app_engine/makonreact/index.html
mv build/index.html ~/zdrojaky/python/app_engine/makonreact/index.html || exit 1
mv build ~/zdrojaky/python/app_engine/makonreact/static || exit 1
#~/share/install/google/app_engine/google_appengine_1.9.19/appcfg.py --oauth2 update ~/zdrojaky/python/app_engine/makonreact
gcloud app deploy ~/zdrojaky/python/app_engine/makonreact
